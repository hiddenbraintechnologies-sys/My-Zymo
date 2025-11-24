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
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const callActiveRef = useRef<boolean>(false);
  const remoteUserIdRef = useRef<string | null>(null);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  // ICE servers configuration (using public STUN servers)
  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Internal cleanup without sending WebSocket message
  const cleanupCall = useCallback(() => {
    // Stop local media tracks using ref (not state)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear refs
    remoteStreamRef.current = null;
    remoteUserIdRef.current = null;
    callActiveRef.current = false;
    iceCandidatesQueueRef.current = [];
    incomingOfferRef.current = null;

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setCallType(null);
    setRemoteUserId(null);
    setIncomingCall(null);
  }, []);

  // End the call - sends signal to peer and cleanup
  const endCall = useCallback(() => {
    // Idempotent - only run if not already cleaned up (using ref)
    if (!callActiveRef.current) return;

    if (ws && remoteUserIdRef.current) {
      ws.send(
        JSON.stringify({
          type: "call-end",
          peerId: remoteUserIdRef.current,
        })
      );
    }

    cleanupCall();
  }, [ws, cleanupCall]);

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate && ws && remoteUserIdRef.current) {
        ws.send(
          JSON.stringify({
            type: "call-ice-candidate",
            targetId: remoteUserIdRef.current,
            candidate: event.candidate,
          })
        );
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall();
      }
    };

    return pc;
  }, [ws, endCall]);

  // Get user media
  const getUserMedia = useCallback(async (type: CallType) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === "video" ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
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
        remoteUserIdRef.current = recipientId;
        callActiveRef.current = true;

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
        cleanupCall();
      }
    },
    [ws, recipientId, currentUserId, getUserMedia, createPeerConnection, cleanupCall]
  );

  // Answer a call
  const answerCall = useCallback(async () => {
    if (!ws || !incomingCall || !currentUserId || !incomingOfferRef.current) return;

    try {
      setCallType(incomingCall.callType);
      setRemoteUserId(incomingCall.callerId);
      remoteUserIdRef.current = incomingCall.callerId;
      callActiveRef.current = true;

      const stream = await getUserMedia(incomingCall.callType);
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description from the incoming offer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));

      // Process queued ICE candidates after setting remote description
      iceCandidatesQueueRef.current.forEach(async (candidate) => {
        try {
          await pc.addIceCandidate(candidate);
        } catch (error) {
          console.error("Error adding queued ICE candidate:", error);
        }
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

      setCallState("active");
      setIncomingCall(null);
      incomingOfferRef.current = null;
    } catch (error) {
      console.error("Error answering call:", error);
      cleanupCall();
    }
  }, [ws, incomingCall, currentUserId, getUserMedia, createPeerConnection, cleanupCall]);

  // Reject a call
  const rejectCall = useCallback(() => {
    if (!ws || !incomingCall || callState !== "ringing") return;

    ws.send(
      JSON.stringify({
        type: "call-reject",
        callerId: incomingCall.callerId,
      })
    );

    // Cleanup without sending call-end
    cleanupCall();
  }, [ws, incomingCall, callState, cleanupCall]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws || !currentUserId) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "call-offer":
            // Store the offer for later use in answerCall
            incomingOfferRef.current = data.offer;
            setIncomingCall({
              callerId: data.callerId,
              caller: data.caller,
              callType: data.callType,
            });
            setCallState("ringing");
            setRemoteUserId(data.callerId);
            remoteUserIdRef.current = data.callerId;
            callActiveRef.current = true;
            break;

          case "call-answer":
            if (peerConnectionRef.current && data.answer) {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(data.answer)
              );
              setCallState("active");
              
              // Process any queued ICE candidates
              iceCandidatesQueueRef.current.forEach(async (candidate) => {
                if (peerConnectionRef.current) {
                  await peerConnectionRef.current.addIceCandidate(candidate);
                }
              });
              iceCandidatesQueueRef.current = [];
            }
            break;

          case "call-ice-candidate":
            if (data.candidate) {
              const candidate = new RTCIceCandidate(data.candidate);
              if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(candidate);
              } else {
                // Queue candidates until remote description is set
                iceCandidatesQueueRef.current.push(candidate);
              }
            }
            break;

          case "call-rejected":
            // Remote peer rejected the call - cleanup without sending
            cleanupCall();
            break;

          case "call-ended":
            // Remote peer ended the call - cleanup without sending
            cleanupCall();
            break;

          case "call-failed":
            // Call failed (user offline, etc.) - cleanup without sending
            cleanupCall();
            break;
        }
      } catch (error) {
        console.error("Error handling WebRTC message:", error);
        cleanupCall();
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, currentUserId, cleanupCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [cleanupCall]);

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
