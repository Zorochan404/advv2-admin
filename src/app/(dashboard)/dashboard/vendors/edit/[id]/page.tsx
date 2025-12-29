"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { getVendorById, updateVendor, VendorFormData, getVendorByIdAdmin, updateVendorAdmin } from "../../api";

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<VendorFormData | null>(null);
  const [imageLoading, setImageLoading] = useState({
    aadharimg: false,
    dlimg: false,
    passportimg: false,
    avatar: false,
  });

  useEffect(() => {
    const fetchVendor = async () => {
      setFetching(true);
      const vendor = await getVendorById(parseInt(vendorId));
      console.log('Fetched vendor data:', vendor);
      console.log('Vendor type:', typeof vendor);
      console.log('Is array?', Array.isArray(vendor));

      if (vendor) {
        // Check if vendor is an array or object
        const rawVendorData = Array.isArray(vendor) ? vendor[0] : vendor;
        const vendorData = {
          ...rawVendorData,
          number: rawVendorData.number ? String(rawVendorData.number) : "",
        };
        console.log('Setting form with:', vendorData);
        setForm(vendorData);
      } else {
        toast.error("Vendor not found");
        router.push("/dashboard/vendors");
      }
      setFetching(false);
    };
    fetchVendor();
  }, [vendorId, router]);

  const handleInputChange = (field: keyof VendorFormData, value: any) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleImageUpload = async (field: keyof VendorFormData, file: File) => {
    if (!validateImageFile(file)) {
      toast.error("Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.");
      return;
    }

    setImageLoading(prev => ({ ...prev, [field]: true }));
    try {
      const result = await uploadImageToCloudinary(file, "vendors/documents");
      if (result.success && result.data && result.data.secure_url) {
        setForm(prev => prev ? { ...prev, [field]: result.data!.secure_url } : prev);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Image upload failed.");
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error("Failed to upload image");
    } finally {
      setImageLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);

    const { createdAt, updatedAt, ...finalForm } = form;
    const response = await updateVendorAdmin(parseInt(vendorId), finalForm);
    if (response) {
      toast.success("Vendor updated successfully!");
      router.push('/dashboard/vendors');
    } else {
      toast.error("Failed to update vendor");
    }
    setLoading(false);
  };

  if (fetching || !form) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-lg font-medium">Loading vendor details...</span>
      </div>
    );
  }

  console.log('Current form state:', form);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/vendors")}> <ArrowLeft className="h-4 w-4 mr-2" /> Back to Vendors </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Vendor</CardTitle>
            <CardDescription>Update the details for this vendor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User Name</Label>
                    <Input value={form.name || ""} onChange={e => handleInputChange("name", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" value={form.age ?? ""} onChange={e => handleInputChange("age", e.target.value ? parseInt(e.target.value) : null)} required />
                  </div>
                </div>
                <div>
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Input value={form.avatar || ""} onChange={e => handleInputChange("avatar", e.target.value)} placeholder="Image URL or upload" />
                    <Input type="file" id="avatar-upload" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files && handleImageUpload("avatar", e.target.files[0])} />
                    <Button asChild variant="outline">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        {imageLoading.avatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Label>
                    </Button>
                  </div>
                  {form.avatar && (
                    <div className="mt-3">
                      <Label className="text-sm text-gray-600">Preview:</Label>
                      <div className="mt-2 relative inline-block">
                        <img src={form.avatar} alt="Avatar preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                        <Button type="button" variant="outline" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => form.avatar && window.open(form.avatar, "_blank")}> <Eye className="h-3 w-3" /> </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input value={form.locality || ""} onChange={e => handleInputChange("locality", e.target.value)} required />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input value={form.city || ""} onChange={e => handleInputChange("city", e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>State</Label>
                    <Input value={form.state || ""} onChange={e => handleInputChange("state", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input value={form.country || ""} onChange={e => handleInputChange("country", e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pincode</Label>
                    <Input type="text" value={form.pincode} onChange={e => handleInputChange("pincode", e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Contact & Credentials */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" value={form.number} onChange={e => handleInputChange("number", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email || ""} onChange={e => handleInputChange("email", e.target.value)} required />
                  </div>
                </div>

              </CardContent>
            </Card>
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Aadhar Number</Label>
                    <Input value={form.aadharNumber || ""} onChange={e => handleInputChange("aadharNumber", e.target.value)} />
                  </div>
                  <div>
                    <Label>Aadhar Image</Label>
                    <div className="flex items-center gap-4">
                      <Input value={form.aadharimg || ""} onChange={e => handleInputChange("aadharimg", e.target.value)} placeholder="Image URL or upload" />
                      <Input type="file" id="aadhar-upload" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files && handleImageUpload("aadharimg", e.target.files[0])} />
                      <Button asChild variant="outline">
                        <Label htmlFor="aadhar-upload" className="cursor-pointer"> {imageLoading.aadharimg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} </Label>
                      </Button>
                    </div>
                    {form.aadharimg && (
                      <div className="mt-3">
                        <Label className="text-sm text-gray-600">Preview:</Label>
                        <div className="mt-2 relative inline-block">
                          <img src={form.aadharimg} alt="Aadhar preview" className="w-32 h-24 object-cover rounded-lg border border-gray-200" />
                          <Button type="button" variant="outline" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => form.aadharimg && window.open(form.aadharimg, "_blank")}> <Eye className="h-3 w-3" /> </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>DL Number</Label>
                    <Input value={form.dlNumber || ""} onChange={e => handleInputChange("dlNumber", e.target.value)} />
                  </div>
                  <div>
                    <Label>DL Image</Label>
                    <div className="flex items-center gap-4">
                      <Input value={form.dlimg || ""} onChange={e => handleInputChange("dlimg", e.target.value)} placeholder="Image URL or upload" />
                      <Input type="file" id="dl-upload" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files && handleImageUpload("dlimg", e.target.files[0])} />
                      <Button asChild variant="outline">
                        <Label htmlFor="dl-upload" className="cursor-pointer"> {imageLoading.dlimg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} </Label>
                      </Button>
                    </div>
                    {form.dlimg && (
                      <div className="mt-3">
                        <Label className="text-sm text-gray-600">Preview:</Label>
                        <div className="mt-2 relative inline-block">
                          <img src={form.dlimg} alt="DL preview" className="w-32 h-24 object-cover rounded-lg border border-gray-200" />
                          <Button type="button" variant="outline" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => form.dlimg && window.open(form.dlimg, "_blank")}> <Eye className="h-3 w-3" /> </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Passport Number</Label>
                    <Input value={form.passportNumber || ""} onChange={e => handleInputChange("passportNumber", e.target.value)} />
                  </div>
                  <div>
                    <Label>Passport Image</Label>
                    <div className="flex items-center gap-4">
                      <Input value={form.passportimg || ""} onChange={e => handleInputChange("passportimg", e.target.value)} placeholder="Image URL or upload" />
                      <Input type="file" id="passport-upload" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files && handleImageUpload("passportimg", e.target.files[0])} />
                      <Button asChild variant="outline">
                        <Label htmlFor="passport-upload" className="cursor-pointer"> {imageLoading.passportimg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} </Label>
                      </Button>
                    </div>
                    {form.passportimg && (
                      <div className="mt-3">
                        <Label className="text-sm text-gray-600">Preview:</Label>
                        <div className="mt-2 relative inline-block">
                          <img src={form.passportimg} alt="Passport preview" className="w-32 h-24 object-cover rounded-lg border border-gray-200" />
                          <Button type="button" variant="outline" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => form.passportimg && window.open(form.passportimg, "_blank")}> <Eye className="h-3 w-3" /> </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Role & Status */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="isverified" checked={form.isverified} onCheckedChange={checked => handleInputChange("isverified", checked)} />
                  <Label htmlFor="isverified">Is Verified</Label>
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={form.role || ""} readOnly />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/vendors")}> Cancel </Button>
              <Button type="submit" disabled={loading}> {loading ? "Updating..." : "Update Vendor"} </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 