import { Phone, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CallType } from "@/hooks/useWebRTC";

interface IncomingCallModalProps {
  open: boolean;
  caller: {
    firstName: string;
    lastName: string;
    profilePhoto?: string | null;
  };
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModal({
  open,
  caller,
  callType,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  const initials = `${caller.firstName?.[0] || ""}${caller.lastName?.[0] || ""}`.toUpperCase();

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-md" 
        data-testid="dialog-incoming-call"
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            Incoming {callType === "video" ? "Video" : "Audio"} Call
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <Avatar className="h-24 w-24">
            {caller.profilePhoto && <AvatarImage src={caller.profilePhoto} />}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-lg font-semibold" data-testid="text-caller-name">
              {caller.firstName} {caller.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              is calling you...
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={onReject}
              variant="destructive"
              size="lg"
              className="rounded-full h-16 w-16"
              data-testid="button-reject-call"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              onClick={onAccept}
              variant="default"
              size="lg"
              className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700"
              data-testid="button-accept-call"
            >
              {callType === "video" ? (
                <Video className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
