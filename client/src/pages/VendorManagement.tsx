import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Store, Edit, Trash2, Plus, MapPin, Phone, Mail, IndianRupee, ChevronLeft, Check, X, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Vendor } from "@shared/schema";

const VENDOR_CATEGORIES = [
  "catering",
  "photography",
  "decoration",
  "venue",
  "entertainment",
  "transportation",
  "other",
];

export default function VendorManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState({
    name: "",
    category: "catering",
    description: "",
    location: "",
    priceRange: "",
    rating: "4.5",
    reviewCount: 0,
    responseTime: "24 hours",
    imageUrl: "",
  });

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });

  const createVendorMutation = useMutation({
    mutationFn: (vendorData: typeof newVendor) =>
      apiRequest('/api/admin/vendors', 'POST', vendorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsCreateDialogOpen(false);
      setNewVendor({
        name: "",
        category: "catering",
        description: "",
        location: "",
        priceRange: "",
        rating: "4.5",
        reviewCount: 0,
        responseTime: "24 hours",
        imageUrl: "",
      });
      toast({
        title: "Vendor created",
        description: "New vendor has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating vendor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
      apiRequest(`/api/admin/vendors/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setIsEditDialogOpen(false);
      setEditingVendor(null);
      toast({
        title: "Vendor updated",
        description: "Vendor has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating vendor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest(`/api/admin/vendors/${vendorId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Vendor deleted",
        description: "Vendor has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting vendor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveVendorMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest(`/api/admin/vendors/${vendorId}/approve`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Vendor approved",
        description: "Vendor has been approved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error approving vendor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectVendorMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest(`/api/admin/vendors/${vendorId}/reject`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Vendor rejected",
        description: "Vendor has been rejected successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error rejecting vendor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner - Warm Cream Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/80 to-orange-50 dark:from-orange-950/20 dark:via-amber-950/15 dark:to-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-6 shadow-sm">
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" data-testid="button-back-admin" className="hover:bg-orange-100 dark:hover:bg-orange-900/30">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-3 text-foreground">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  Vendor Management
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Manage vendor listings and categories
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-xl p-3 min-w-[80px] shadow-sm">
                <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{vendors?.length ?? 0}</div>
                <div className="text-xs text-orange-600/80 dark:text-orange-400/80">Vendors</div>
              </div>
            </div>
          </div>
        </div>

      <div className="flex items-center justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-vendor">
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="dialog-create-vendor">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Add a new vendor to the marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Vendor Name</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="Best Caterers"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newVendor.category} onValueChange={(value) => setNewVendor({ ...newVendor, category: value })}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="input-description"
                  value={newVendor.description}
                  onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
                  placeholder="Provide delicious food for all occasions"
                />
              </div>
              <div>
                <Label htmlFor="responseTime">Response Time</Label>
                <Input
                  id="responseTime"
                  data-testid="input-responseTime"
                  value={newVendor.responseTime}
                  onChange={(e) => setNewVendor({ ...newVendor, responseTime: e.target.value })}
                  placeholder="24 hours"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  data-testid="input-location"
                  value={newVendor.location}
                  onChange={(e) => setNewVendor({ ...newVendor, location: e.target.value })}
                  placeholder="Mumbai, Maharashtra"
                />
              </div>
              <div>
                <Label htmlFor="priceRange">Price Range</Label>
                <Input
                  id="priceRange"
                  data-testid="input-priceRange"
                  value={newVendor.priceRange}
                  onChange={(e) => setNewVendor({ ...newVendor, priceRange: e.target.value })}
                  placeholder="₹10,000 - ₹50,000"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  data-testid="input-imageUrl"
                  value={newVendor.imageUrl}
                  onChange={(e) => setNewVendor({ ...newVendor, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createVendorMutation.mutate(newVendor)}
                disabled={createVendorMutation.isPending || !newVendor.name}
                data-testid="button-confirm-create"
              >
                Add Vendor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>
            {vendors?.length ?? 0} total vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {vendors?.map((vendor) => (
              <div
                key={vendor.id}
                className="flex items-start justify-between p-4 border rounded-lg"
                data-testid={`vendor-item-${vendor.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground" data-testid={`text-name-${vendor.id}`}>
                        {vendor.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">
                          {vendor.category.charAt(0).toUpperCase() + vendor.category.slice(1)}
                        </Badge>
                        <Badge 
                          variant={
                            vendor.approvalStatus === 'approved' ? 'default' :
                            vendor.approvalStatus === 'rejected' ? 'destructive' :
                            'outline'
                          }
                          data-testid={`badge-status-${vendor.id}`}
                        >
                          {vendor.approvalStatus === 'approved' ? '✓ Approved' :
                           vendor.approvalStatus === 'rejected' ? '✗ Rejected' :
                           '⏳ Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {vendor.description && (
                    <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${vendor.id}`}>
                      {vendor.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-muted-foreground">
                    {vendor.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span data-testid={`text-location-${vendor.id}`}>{vendor.location}</span>
                      </div>
                    )}
                    {vendor.priceRange && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-3 w-3" />
                        <span data-testid={`text-price-${vendor.id}`}>{vendor.priceRange}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>⭐ {vendor.rating} ({vendor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Response: {vendor.responseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {vendor.approvalStatus === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => approveVendorMutation.mutate(vendor.id)}
                        data-testid={`button-approve-${vendor.id}`}
                        title="Approve vendor"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => rejectVendorMutation.mutate(vendor.id)}
                        data-testid={`button-reject-${vendor.id}`}
                        title="Reject vendor"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(vendor)}
                    data-testid={`button-edit-${vendor.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" data-testid={`button-delete-${vendor.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{vendor.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteVendorMutation.mutate(vendor.id)}
                          data-testid="button-confirm-delete"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {vendors?.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No vendors found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingVendor && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
              <DialogDescription>
                Update vendor information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Vendor Name</Label>
                <Input
                  id="edit-name"
                  data-testid="input-edit-name"
                  defaultValue={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingVendor.category}
                  onValueChange={(value) => setEditingVendor({ ...editingVendor, category: value })}
                >
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  data-testid="input-edit-description"
                  defaultValue={editingVendor.description || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-responseTime">Response Time</Label>
                <Input
                  id="edit-responseTime"
                  data-testid="input-edit-responseTime"
                  defaultValue={editingVendor.responseTime}
                  onChange={(e) => setEditingVendor({ ...editingVendor, responseTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  data-testid="input-edit-location"
                  defaultValue={editingVendor.location || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-priceRange">Price Range</Label>
                <Input
                  id="edit-priceRange"
                  data-testid="input-edit-priceRange"
                  defaultValue={editingVendor.priceRange || ""}
                  onChange={(e) => setEditingVendor({ ...editingVendor, priceRange: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingVendor(null);
                }}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateVendorMutation.mutate({ id: editingVendor.id, data: editingVendor })}
                disabled={updateVendorMutation.isPending}
                data-testid="button-confirm-edit"
              >
                Update Vendor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}
