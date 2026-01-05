"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { addVendor, VendorFormData } from "../api";



export default function AddVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<VendorFormData>({
    name: "",
    age: "",
    aadharNumber: "",
    aadharimg: "",
    dlNumber: "",
    dlimg: "",
    passportNumber: "",
    passportimg: "",
    locality: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    number: "",
    email: "",
    password: "",
    avatar: "",
    role: "vendor",
    isverified: false,
    carCount: 0,
    cars: [],
  });

  const [imageLoading, setImageLoading] = useState({
    aadharImg: false,
    dlImg: false,
    passportImg: false,
    avatar: false,
  });

  const handleInputChange = (field: keyof VendorFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
        setForm(prev => ({ ...prev, [field]: result.data!.secure_url }));
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
    setLoading(true);
    console.log(form)
    const response = await addVendor(form);
    if (response) {
      toast.success("Vendor added successfully!");
      router.push('/dashboard/vendors')
    } else {
      toast.error("Failed to add vendor");
    }
    setLoading(false);
  };

  const handleDeleteVendor = (id: number) => {

    toast.success("Vendor deleted successfully!");
  };

  return (

    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/vendors")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Add Vendor</CardTitle>
            <CardDescription>Fill in the details to add a new vendor.</CardDescription>
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
                    <Input
                      value={form.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={form.age}
                      onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      value={form.avatar}
                      onChange={(e) => handleInputChange("avatar", e.target.value)}
                      placeholder="Image URL or upload"
                    />
                    <Input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files && handleImageUpload("avatar", e.target.files[0])}
                    />
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
                        <img
                          src={form.avatar}
                          alt="Avatar preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => window.open(form.avatar, "_blank")}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
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
                    <Input
                      value={form.locality}
                      onChange={(e) => handleInputChange("locality", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>State</Label>
                    <Input
                      value={form.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={form.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pincode</Label>
                    <Input
                      type="text"
                      value={form.pincode?.toString()}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      required
                    />
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
                    <Input
                      type="tel"
                      value={form.number}
                      onChange={(e) => handleInputChange("number", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
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
                    <Input
                      value={form.aadharNumber}
                      onChange={(e) => handleInputChange("aadharNumber", e.target.value)}

                    />
                  </div>
                  <div>
                    <Label>Aadhar Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={form.aadharimg}
                        onChange={(e) => handleInputChange("aadharimg", e.target.value)}
                        placeholder="Image URL or upload"
                      />
                      <Input
                        type="file"
                        id="aadhar-upload"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files && handleImageUpload("aadharimg", e.target.files[0])}
                      />
                      <Button asChild variant="outline">
                        <Label htmlFor="aadhar-upload" className="cursor-pointer">
                          {imageLoading.aadharImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </Label>
                      </Button>
                    </div>
                    {form.aadharimg && (
                      <div className="mt-3">
                        <Label className="text-sm text-gray-600">Preview:</Label>
                        <div className="mt-2 relative inline-block">
                          <img
                            src={form.aadharimg}
                            alt="Aadhar preview"
                            className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => window.open(form.aadharimg, "_blank")}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>DL Number</Label>
                    <Input
                      value={form.dlNumber}
                      onChange={(e) => handleInputChange("dlNumber", e.target.value)}

                    />
                  </div>
                  <div>
                    <Label>DL Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={form.dlimg}
                        onChange={(e) => handleInputChange("dlimg", e.target.value)}
                        placeholder="Image URL or upload"
                      />
                      <Input
                        type="file"
                        id="dl-upload"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files && handleImageUpload("dlimg", e.target.files[0])}
                      />
                      <Button asChild variant="outline">
                        <Label htmlFor="dl-upload" className="cursor-pointer">
                          {imageLoading.dlImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </Label>
                      </Button>
                    </div>
                    {form.dlimg && (
                      <div className="mt-3">
                        <Label className="text-sm text-gray-600">Preview:</Label>
                        <div className="mt-2 relative inline-block">
                          <img
                            src={form.dlimg}
                            alt="DL preview"
                            className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => window.open(form.dlimg, "_blank")}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Passport Number</Label>
                    <Input
                      value={form.passportNumber}
                      onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Passport Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={form.passportimg}
                        onChange={(e) => handleInputChange("passportimg", e.target.value)}
                        placeholder="Image URL or upload"
                      />
                      <Input
                        type="file"
                        id="passport-upload"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files && handleImageUpload("passportimg", e.target.files[0])}
                      />
                      <Button asChild variant="outline">
                        <Label htmlFor="passport-upload" className="cursor-pointer">
                          {imageLoading.passportImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        </Label>
                      </Button>
                    </div>
                    {form.passportimg && (
                      <div className="mt-3">
                        <Label className="text-sm text-gray-600">Preview:</Label>
                        <div className="mt-2 relative inline-block">
                          <img
                            src={form.passportimg}
                            alt="Passport preview"
                            className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => window.open(form.passportimg, "_blank")}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
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
                  <Switch
                    id="isverified"
                    checked={form.isverified}
                    onCheckedChange={(checked) => handleInputChange("isverified", checked)}
                  />
                  <Label htmlFor="isverified">Is Verified</Label>
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value="vendor" readOnly />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/vendors")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Vendor"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>

  );
} 