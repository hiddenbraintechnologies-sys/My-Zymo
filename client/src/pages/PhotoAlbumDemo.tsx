import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Camera, Image, Upload, Download, Share2, Heart, MessageCircle, 
  Grid, LayoutGrid, Star, Lock, Plus, X, ZoomIn, ChevronLeft, ChevronRight,
  Sparkles, PartyPopper, Gift, Users, Trash2, Edit, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  likes: number;
  comments: number;
  liked: boolean;
  timestamp: string;
}

interface Album {
  id: string;
  name: string;
  coverUrl: string;
  photoCount: number;
  eventName: string;
}

const DEMO_PHOTOS: Photo[] = [
  { 
    id: "1", 
    url: "https://images.unsplash.com/photo-1529543544277-750e5b0b0bfa?w=400&h=300&fit=crop", 
    caption: "College reunion group photo - Class of 2015!", 
    uploadedBy: "Priya Sharma", 
    likes: 24, 
    comments: 8, 
    liked: false,
    timestamp: "2 hours ago"
  },
  { 
    id: "2", 
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop", 
    caption: "Birthday celebration at the venue", 
    uploadedBy: "Rahul Verma", 
    likes: 18, 
    comments: 5, 
    liked: true,
    timestamp: "3 hours ago"
  },
  { 
    id: "3", 
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", 
    caption: "Delicious food spread for the party", 
    uploadedBy: "Ananya Gupta", 
    likes: 32, 
    comments: 12, 
    liked: false,
    timestamp: "5 hours ago"
  },
  { 
    id: "4", 
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop", 
    caption: "Dancing the night away!", 
    uploadedBy: "Vikram Singh", 
    likes: 45, 
    comments: 15, 
    liked: true,
    timestamp: "Yesterday"
  },
  { 
    id: "5", 
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop", 
    caption: "Beautiful venue decorations", 
    uploadedBy: "Meera Patel", 
    likes: 28, 
    comments: 6, 
    liked: false,
    timestamp: "Yesterday"
  },
  { 
    id: "6", 
    url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop", 
    caption: "Cheers to the good times!", 
    uploadedBy: "Arjun Reddy", 
    likes: 36, 
    comments: 9, 
    liked: false,
    timestamp: "2 days ago"
  },
];

const DEMO_ALBUMS: Album[] = [
  { id: "1", name: "College Reunion 2025", coverUrl: "https://images.unsplash.com/photo-1529543544277-750e5b0b0bfa?w=400&h=300&fit=crop", photoCount: 48, eventName: "Class of 2015 Reunion" },
  { id: "2", name: "Priya's Birthday", coverUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop", photoCount: 32, eventName: "Birthday Bash" },
  { id: "3", name: "Goa Trip Memories", coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop", photoCount: 156, eventName: "Group Trip to Goa" },
];

export default function PhotoAlbumDemo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>(DEMO_PHOTOS);
  const [activeTab, setActiveTab] = useState("photos");
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handleLikePhoto = (id: string) => {
    setPhotos(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
    toast({
      title: "Photo liked!",
      description: "Your reaction has been saved",
    });
  };

  const handleOpenLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowLightbox(true);
  };

  const handleNavigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedPhotoIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
    } else {
      setSelectedPhotoIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
    }
  };

  const handleOpenComments = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowCommentDialog(true);
  };

  const handlePremiumFeature = () => {
    setShowSignupDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-background dark:from-rose-950/20 dark:to-background">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {/* Floating Icons */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '2.5s' }}>
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-8 right-8 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
          <Image className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-6 left-1/4 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '2.8s' }}>
          <PartyPopper className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-4 right-1/4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '3.2s' }}>
          <Heart className="w-6 h-6 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <Badge className="bg-white/20 text-white border-white/30 mb-4" data-testid="badge-demo-mode">
            <Sparkles className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4" data-testid="text-hero-title">
            Photo Album
          </h1>
          <p className="text-rose-100 text-lg md:text-xl max-w-2xl mb-6" data-testid="text-hero-description">
            Capture and share memories with your event group. Create beautiful photo albums that everyone can contribute to.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1" data-testid="badge-feature-upload">
              <Upload className="w-3 h-3 mr-1" />
              Easy Upload
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1" data-testid="badge-feature-share">
              <Share2 className="w-3 h-3 mr-1" />
              Share Albums
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1" data-testid="badge-feature-download">
              <Download className="w-3 h-3 mr-1" />
              Download All
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Photo Gallery */}
            <Card className="border-2 border-rose-200 dark:border-rose-800" data-testid="card-photo-gallery">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-b">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg" data-testid="text-gallery-title">Event Photos</CardTitle>
                      <CardDescription data-testid="text-photo-count">
                        {photos.length} photos from your events
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      data-testid="button-view-grid"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "masonry" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("masonry")}
                      data-testid="button-view-masonry"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                      onClick={() => setShowUploadDialog(true)}
                      data-testid="button-upload-photo"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 pt-2" data-testid="tabs-gallery">
                    <TabsTrigger value="photos" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-500" data-testid="tab-photos">
                      <Image className="w-4 h-4 mr-1" />
                      All Photos
                      <Badge variant="secondary" className="ml-2 text-xs">{photos.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="albums" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-500" data-testid="tab-albums">
                      <Grid className="w-4 h-4 mr-1" />
                      Albums
                      <Badge variant="secondary" className="ml-2 text-xs">{DEMO_ALBUMS.length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="photos" className="m-0 p-4">
                    <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3"}`} data-testid="photo-grid">
                      {photos.map((photo, index) => (
                        <div 
                          key={photo.id} 
                          className="group relative rounded-lg overflow-hidden bg-muted cursor-pointer hover-elevate"
                          data-testid={`photo-card-${photo.id}`}
                        >
                          <img 
                            src={photo.url} 
                            alt={photo.caption}
                            className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                            onClick={() => handleOpenLightbox(index)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-white text-sm truncate">{photo.caption}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3">
                                  <button 
                                    className="flex items-center gap-1 text-white hover:text-rose-300 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); handleLikePhoto(photo.id); }}
                                    data-testid={`button-like-${photo.id}`}
                                  >
                                    <Heart className={`w-4 h-4 ${photo.liked ? "fill-rose-500 text-rose-500" : ""}`} />
                                    <span className="text-xs">{photo.likes}</span>
                                  </button>
                                  <button 
                                    className="flex items-center gap-1 text-white hover:text-rose-300 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); handleOpenComments(photo); }}
                                    data-testid={`button-comment-${photo.id}`}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs">{photo.comments}</span>
                                  </button>
                                </div>
                                <button 
                                  className="text-white hover:text-rose-300 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); handleOpenLightbox(index); }}
                                  data-testid={`button-zoom-${photo.id}`}
                                >
                                  <ZoomIn className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="albums" className="m-0 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="album-grid">
                      {DEMO_ALBUMS.map((album) => (
                        <div 
                          key={album.id}
                          className="group relative rounded-lg overflow-hidden bg-muted cursor-pointer hover-elevate"
                          data-testid={`album-card-${album.id}`}
                          onClick={() => toast({ title: "Album Selected", description: `Viewing ${album.name}` })}
                        >
                          <img 
                            src={album.coverUrl} 
                            alt={album.name}
                            className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-semibold text-lg">{album.name}</h3>
                              <p className="text-white/80 text-sm">{album.eventName}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Image className="w-3 h-3 mr-1" />
                                  {album.photoCount} photos
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Create Album Card */}
                      <div 
                        className="rounded-lg border-2 border-dashed border-rose-300 dark:border-rose-700 flex items-center justify-center aspect-video cursor-pointer hover:border-rose-400 dark:hover:border-rose-600 transition-colors bg-rose-50/50 dark:bg-rose-950/20"
                        onClick={handlePremiumFeature}
                        data-testid="button-create-album"
                      >
                        <div className="text-center p-4">
                          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mx-auto mb-2">
                            <Plus className="w-6 h-6 text-rose-500" />
                          </div>
                          <p className="font-medium text-rose-600 dark:text-rose-400">Create Album</p>
                          <p className="text-sm text-muted-foreground">Organize your photos</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload Stats */}
            <Card className="border-2 border-rose-200 dark:border-rose-800" data-testid="card-upload-stats">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-rose-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Photos</span>
                  <span className="font-semibold" data-testid="text-total-photos">236</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Albums</span>
                  <span className="font-semibold" data-testid="text-total-albums">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contributors</span>
                  <span className="font-semibold" data-testid="text-contributors">12</span>
                </div>
              </CardContent>
            </Card>

            {/* Premium Features Card */}
            <Card className="border-2 border-rose-200 dark:border-rose-800" data-testid="card-premium-features">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-rose-500" />
                  Premium Features
                </CardTitle>
                <CardDescription>
                  Unlock advanced photo tools
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-download-all"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Download All Photos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-slideshow"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Photo Slideshow
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-prints"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Order Prints
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-photobook"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Create Photo Book
                </Button>
                
                <div className="pt-3 border-t">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                    onClick={() => navigate("/signup")}
                    data-testid="button-sidebar-signup"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card data-testid="card-top-contributors">
              <CardHeader>
                <CardTitle className="text-lg">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Priya Sharma", "Rahul Verma", "Ananya Gupta"].map((name, index) => (
                  <div key={name} className="flex items-center gap-3" data-testid={`contributor-${index}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-rose-100 text-rose-600 text-xs">
                        {name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-xs text-muted-foreground">{[48, 32, 28][index]} photos</p>
                    </div>
                    {index === 0 && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">Top</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <Card className="p-8 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-2 border-rose-200 dark:border-rose-800" data-testid="card-cta">
            <h3 className="text-2xl font-bold mb-2">Capture Every Moment</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Sign up for free to upload unlimited photos, create albums, and share memories with your event group.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                onClick={() => navigate("/signup")}
                data-testid="button-cta-signup"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Sharing Photos
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/")}
                data-testid="button-cta-explore"
              >
                Explore More Features
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Photo Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden" data-testid="dialog-lightbox" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="relative">
            <img 
              src={photos[selectedPhotoIndex]?.url} 
              alt={photos[selectedPhotoIndex]?.caption}
              className="w-full max-h-[70vh] object-contain bg-black"
              data-testid="img-lightbox"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70"
              onClick={() => setShowLightbox(false)}
              data-testid="button-close-lightbox"
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70"
              onClick={() => handleNavigateLightbox("prev")}
              data-testid="button-prev-photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70"
              onClick={() => handleNavigateLightbox("next")}
              data-testid="button-next-photo"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
          <div className="p-4 bg-background">
            <p className="font-medium" data-testid="text-lightbox-caption">{photos[selectedPhotoIndex]?.caption}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                By {photos[selectedPhotoIndex]?.uploadedBy} • {photos[selectedPhotoIndex]?.timestamp}
              </p>
              <div className="flex items-center gap-3">
                <button 
                  className="flex items-center gap-1 hover:text-rose-500 transition-colors"
                  onClick={() => handleLikePhoto(photos[selectedPhotoIndex]?.id)}
                  data-testid="button-lightbox-like"
                >
                  <Heart className={`w-5 h-5 ${photos[selectedPhotoIndex]?.liked ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>{photos[selectedPhotoIndex]?.likes}</span>
                </button>
                <button 
                  className="flex items-center gap-1 hover:text-rose-500 transition-colors"
                  onClick={() => handleOpenComments(photos[selectedPhotoIndex])}
                  data-testid="button-lightbox-comment"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{photos[selectedPhotoIndex]?.comments}</span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent data-testid="dialog-upload" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-rose-500" />
              Upload Photos
            </DialogTitle>
            <DialogDescription>
              Share your event memories with the group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-rose-300 dark:border-rose-700 rounded-lg p-8 text-center cursor-pointer hover:border-rose-400 dark:hover:border-rose-600 transition-colors bg-rose-50/50 dark:bg-rose-950/20">
              <Upload className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <p className="font-medium text-rose-600 dark:text-rose-400">Click to upload or drag photos here</p>
              <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 10MB each</p>
            </div>
            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Textarea 
                placeholder="Add a caption for your photos..."
                className="resize-none"
                data-testid="input-caption"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              onClick={() => {
                setShowUploadDialog(false);
                handlePremiumFeature();
              }}
              data-testid="button-confirm-upload"
            >
              Upload Photos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent data-testid="dialog-comments" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-rose-500" />
              Comments
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {[
                { name: "Rahul Verma", comment: "Great photo! Love this moment!", time: "1 hour ago" },
                { name: "Ananya Gupta", comment: "Everyone looks so happy here", time: "2 hours ago" },
                { name: "Vikram Singh", comment: "Can't wait for the next reunion!", time: "3 hours ago" },
              ].map((c, i) => (
                <div key={i} className="flex gap-3" data-testid={`comment-${i}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-rose-100 text-rose-600 text-xs">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-sm">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-4 border-t">
            <Input 
              placeholder="Add a comment..." 
              className="flex-1"
              data-testid="input-comment"
            />
            <Button
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              onClick={() => {
                setShowCommentDialog(false);
                handlePremiumFeature();
              }}
              data-testid="button-post-comment"
            >
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup Prompt Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent data-testid="dialog-signup-prompt" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-rose-500" />
              Premium Feature
            </DialogTitle>
            <DialogDescription>
              This feature requires a free account. Sign up to unlock:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-rose-500" />
              Upload unlimited photos to your events
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-rose-500" />
              Create and organize photo albums
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-rose-500" />
              Download all photos at once
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-rose-500" />
              Order prints and photo books
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSignupDialog(false)}
              data-testid="button-prompt-continue"
            >
              Continue Exploring
            </Button>
            <Button
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              onClick={() => navigate("/signup")}
              data-testid="button-prompt-signup"
            >
              Sign Up Free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
