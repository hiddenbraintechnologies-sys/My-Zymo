import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, GraduationCap, Calendar, Edit } from "lucide-react";
import type { User } from "@shared/schema";
import { Link } from "wouter";

interface ProfileSidebarProps {
  user: User;
}

export default function ProfileSidebar({ user }: ProfileSidebarProps) {
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  
  return (
    <Card data-testid="card-profile-sidebar">
      <CardHeader className="text-center pb-2">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user.profileImageUrl || ""} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-heading font-bold" data-testid="text-user-name">
          {user.firstName} {user.lastName}
        </h2>
        {user.bio && (
          <p className="text-sm text-muted-foreground mt-2" data-testid="text-user-bio">
            {user.bio}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {user.profession && (
          <div className="flex items-start gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium" data-testid="text-user-profession">{user.profession}</p>
              {user.company && (
                <p className="text-muted-foreground" data-testid="text-user-company">{user.company}</p>
              )}
            </div>
          </div>
        )}
        
        {user.college && (
          <div className="flex items-start gap-2 text-sm">
            <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium" data-testid="text-user-college">{user.college}</p>
              {user.degree && (
                <p className="text-muted-foreground">{user.degree}</p>
              )}
              {user.graduationYear && (
                <p className="text-muted-foreground">Class of {user.graduationYear}</p>
              )}
            </div>
          </div>
        )}
        
        {user.currentCity && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <p data-testid="text-user-city">{user.currentCity}</p>
          </div>
        )}
        
        <Link href="/profile/edit">
          <Button variant="outline" className="w-full mt-4" data-testid="button-edit-profile">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
