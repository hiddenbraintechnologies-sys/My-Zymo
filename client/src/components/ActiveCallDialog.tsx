import { useEffect, useRef } from "react";
import { Phone, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { CallType, CallState } from "@/hooks/useWebRTC";
import { useState } from "react";

interface ActiveCallDialogProps {
  open: boolean;
  callState: CallState;
  callType: CallType | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteName: string;
  onEndCall: () => void;
}

export function ActiveCallDialog({
  open,
  callState,
  callType,
  localStream,
  remoteStream,
  remoteName,
  onEndCall,
}: ActiveCallDialogProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && callType === "video") {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-4xl h-[600px] p-0"
        data-testid="dialog-active-call"
      >
        <div className="relative h-full bg-black rounded-lg overflow-hidden">
          {/* Remote video (main view) */}
          {callType === "video" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              data-testid="video-remote"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="text-center">
                <div className="text-6xl mb-4">{remoteName[0]?.toUpperCase()}</div>
                <p className="text-xl text-white" data-testid="text-remote-name">
                  {remoteName}
                </p>
                <p className="text-sm text-white/70 mt-2">
                  {callState === "calling" ? "Calling..." : "Connected"}
                </p>
              </div>
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          {callType === "video" && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                data-testid="video-local"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
          )}

          {/* Call status */}
          {callState === "calling" && (
            <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-full">
              <p className="text-white text-sm">Calling...</p>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full h-14 w-14"
                data-testid="button-toggle-mute"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {callType === "video" && (
                <Button
                  onClick={toggleVideo}
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  className="rounded-full h-14 w-14"
                  data-testid="button-toggle-video"
                >
                  {isVideoOff ? (
                    <VideoOff className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </Button>
              )}

              <Button
                onClick={onEndCall}
                variant="destructive"
                size="lg"
                className="rounded-full h-14 w-14"
                data-testid="button-end-call"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
