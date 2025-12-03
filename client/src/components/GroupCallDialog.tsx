import { useState } from "react";
import { Phone, Mic, MicOff, Video, VideoOff, PhoneOff, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GroupCallDialogProps {
  open: boolean;
  groupName: string;
  callType: "audio" | "video";
  memberCount: number;
  onClose: () => void;
}

export function GroupCallDialog({
  open,
  groupName,
  callType,
  memberCount,
  onClose,
}: GroupCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (callType === "video") {
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        className="sm:max-w-lg p-6"
        data-testid="dialog-group-call"
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <p className="text-xl font-semibold" data-testid="text-group-call-name">
            {groupName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {memberCount} members
          </p>
          
          <Alert className="mt-6 text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Group calling is a preview feature. Full multi-participant WebRTC calling 
              requires additional infrastructure (TURN servers, mesh/SFU architecture) 
              that is not available in this environment. For now, use 1-on-1 calls from 
              the Direct Messages tab or coordinate using group chat messages.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full h-14 w-14"
              data-testid="button-group-call-toggle-mute"
              disabled
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {callType === "video" && (
              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full h-14 w-14"
                data-testid="button-group-call-toggle-video"
                disabled
              >
                {isVideoOff ? (
                  <VideoOff className="h-5 w-5" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
              </Button>
            )}

            <Button
              onClick={handleEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14"
              data-testid="button-group-call-end"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
