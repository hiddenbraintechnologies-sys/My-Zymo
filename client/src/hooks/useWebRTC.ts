import { useState, useEffect, useRef, useCallback } from "react";

export type CallType = "audio" | "video";
export type CallState = "idle" | "calling" | "ringing" | "active";

interface UseWebRTCProps {
  ws: WebSocket | null;
  currentUserId: string | undefined;
  recipientId: string | null;
}

export function useWebRTC({ ws, currentUserId, recipientId }: UseWebRTCProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<CallType | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    caller: any;
    callType: CallType;
  } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueueRef = useRef<RTCIceCandidate[]>([]);

  // ICE servers configuration (using public STUN servers)
  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate && ws && remoteUserId) {
        ws.send(
          JSON.stringify({
            type: "call-ice-candidate",
            targetId: remoteUserId,
            candidate: event.candidate,
          })
        );
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall();
      }
    };

    return pc;
  }, [ws, remoteUserId]);

  // Get user media
  const getUserMedia = useCallback(async (type: CallType) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === "video" ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }, []);

  // Start a call
  const startCall = useCallback(
    async (type: CallType) => {
      if (!ws || !recipientId || !currentUserId) return;

      try {
        setCallType(type);
        setCallState("calling");
        setRemoteUserId(recipientId);

        const stream = await getUserMedia(type);
        const pc = createPeerConnection();
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        ws.send(
          JSON.stringify({
            type: "call-offer",
            recipientId,
            offer: offer,
            callType: type,
          })
        );
      } catch (error) {
        console.error("Error starting call:", error);
        endCall();
      }
    },
    [ws, recipientId, currentUserId, getUserMedia, createPeerConnection]
  );

  // Answer a call
  const answerCall = useCallback(async () => {
    if (!ws || !incomingCall || !currentUserId) return;

    try {
      setCallState("active");
      setCallType(incomingCall.callType);
      setRemoteUserId(incomingCall.callerId);

      const stream = await getUserMedia(incomingCall.callType);
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Process queued ICE candidates
      iceCandidatesQueueRef.current.forEach((candidate) => {
        pc.addIceCandidate(candidate).catch(console.error);
      });
      iceCandidatesQueueRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      ws.send(
        JSON.stringify({
          type: "call-answer",
          callerId: incomingCall.callerId,
          answer: answer,
        })
      );

      setIncomingCall(null);
    } catch (error) {
      console.error("Error answering call:", error);
      rejectCall();
    }
  }, [ws, incomingCall, currentUserId, getUserMedia, createPeerConnection]);

  // Reject a call
  const rejectCall = useCallback(() => {
    if (!ws || !incomingCall) return;

    ws.send(
      JSON.stringify({
        type: "call-reject",
        callerId: incomingCall.callerId,
      })
    );

    setIncomingCall(null);
    setCallState("idle");
  }, [ws, incomingCall]);

  // End the call
  const endCall = useCallback(() => {
    if (ws && remoteUserId) {
      ws.send(
        JSON.stringify({
          type: "call-end",
          peerId: remoteUserId,
        })
      );
    }

    // Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setCallType(null);
    setRemoteUserId(null);
    iceCandidatesQueueRef.current = [];
  }, [ws, remoteUserId, localStream]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws || !currentUserId) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "call-offer":
            setIncomingCall({
              callerId: data.callerId,
              caller: data.caller,
              callType: data.callType,
            });
            setCallState("ringing");
            
            // Create peer connection and set remote description
            const pc = createPeerConnection();
            peerConnectionRef.current = pc;
            setRemoteUserId(data.callerId);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            break;

          case "call-answer":
            if (peerConnectionRef.current && data.answer) {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(data.answer)
              );
              setCallState("active");
            }
            break;

          case "call-ice-candidate":
            if (data.candidate) {
              const candidate = new RTCIceCandidate(data.candidate);
              if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(candidate);
              } else {
                iceCandidatesQueueRef.current.push(candidate);
              }
            }
            break;

          case "call-rejected":
            endCall();
            break;

          case "call-ended":
            endCall();
            break;

          case "call-failed":
            endCall();
            break;
        }
      } catch (error) {
        console.error("Error handling WebRTC message:", error);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, currentUserId, createPeerConnection, endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    callState,
    callType,
    incomingCall,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    rejectCall,
    endCall,
  };
}
