"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, Eye, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { getParkingInchargeById, updateParkingIncharge, ParkingManager } from "../../../api";

export default function EditManagerPage() {
  const router = useRouter();
  const params = useParams();
  const spotId = params.spotId as string;
  const inchargeId = params.inchargeId as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState<ParkingManager>({
    name: '',
    avatar: '',
    age: '',
    number: '',
    email: '',
    password: '',
    aadharNumber: '',
    aadharimg: '',
    dlNumber: '',
    dlimg: '',
    passportNumber: '',
    passportimg: '',
    locality: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    isverified: false,
    role: 'parkingincharge',
    parkingid: parseInt(spotId)
  });

  const [imageLoading, setImageLoading] = useState({
    aadharImg: false,
    dlImg: false,
    passportImg: false,
    avatar: false,
  });

  // Fetch existing manager data
  useEffect(() => {
    const fetchManagerData = async () => {
      setLoading(true);
      try {
        console.log('Fetching manager data for ID:', inchargeId);
        const response = await getParkingInchargeById(parseInt(inchargeId));
        console.log('Manager data received:', response);
        
        if (response) {
          const formData = {
            name: response[0].name || '',
            avatar: response[0].avatar || '',
            age: response[0].age || '',
            number: response[0].number || '',
            email: response[0].email || '',
            password: '', // Don't pre-fill password for security
            aadharNumber: response[0].aadharNumber || '',
            aadharimg: response[0].aadharimg || '',
            dlNumber: response[0].dlNumber || '',
            dlimg: response[0].dlimg || '',
            passportNumber: response[0].passportNumber || '',
            passportimg: response[0].passportimg || '',
            locality: response[0].locality || '',
            city: response[0].city || '',
            state: response[0].state || '',
            country: response[0].country || '',
            pincode: response[0].pincode || '',
            isverified: response[0].isverified || false,
            role: response[0].role || 'parkingincharge',
            parkingid: response[0].parkingid || parseInt(spotId)
          };
          
          console.log('Setting form data:', formData);
          setForm(formData);
          toast.success('Manager data loaded successfully');
        } else {
          toast.error('Failed to load manager details');
        }
      } catch (error) {
        console.error('Error fetching manager data:', error);
        toast.error('Failed to load manager details');
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, [inchargeId, spotId]);

  const handleInputChange = (field: keyof ParkingManager, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (field: keyof ParkingManager, file: File) => {
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
    setSubmitting(true);
    
    // Update the form with the current parkingid
    const formData = {
      ...form,
      parkingid: parseInt(spotId),
      role: "parkingincharge"
    };
    
    console.log('Updating manager data:', formData);
    const response = await updateParkingIncharge(parseInt(inchargeId), formData);
    if (response) {
      toast.success("Parking manager updated successfully!");
      router.push(`/dashboard/parking/${spotId}`)
    } else {
      toast.error("Failed to update parking manager");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-medium">Loading manager details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/dashboard/parking/${spotId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Parking
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Parking Manager Details</CardTitle>
                <CardDescription>
                  {isEditMode ? 'Edit the details of the parking manager.' : 'View the details of the parking manager.'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <Button 
                    type="button" 
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Manager
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Only
                  </Button>
                )}
              </div>
            </div>
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
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={form.age}
                      onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                      required
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
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
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                    {isEditMode && (
                      <>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          id="avatar-upload"
                          className="hidden"
                          onChange={(e) => e.target.files && handleImageUpload("avatar", e.target.files[0])}
                        />
                        <Button asChild variant="outline">
                          <Label htmlFor="avatar-upload" className="cursor-pointer">
                            {imageLoading.avatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          </Label>
                        </Button>
                      </>
                    )}
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
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
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
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={form.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      required
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pincode</Label>
                    <Input
                      type="number"
                      value={form.pincode}
                      onChange={(e) => handleInputChange("pincode", parseInt(e.target.value))}
                      required
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
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
                      type="number"
                      value={form.number}
                      onChange={(e) => handleInputChange("number", parseInt(e.target.value))}
                      required
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Leave blank to keep current password"
                    readOnly={!isEditMode}
                    className={!isEditMode ? "bg-gray-50" : ""}
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
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label>Aadhar Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={form.aadharimg}
                        onChange={(e) => handleInputChange("aadharimg", e.target.value)}
                        placeholder="Image URL or upload"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-gray-50" : ""}
                      />
                      {isEditMode && (
                        <>
                          <Input
                            type="file"
                          accept="image/*,.pdf"
                            id="aadhar-upload"
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload("aadharimg", e.target.files[0])}
                          />
                          <Button asChild variant="outline">
                            <Label htmlFor="aadhar-upload" className="cursor-pointer">
                              {imageLoading.aadharImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </Label>
                          </Button>
                        </>
                      )}
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
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label>DL Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={form.dlimg}
                        onChange={(e) => handleInputChange("dlimg", e.target.value)}
                        placeholder="Image URL or upload"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-gray-50" : ""}
                      />
                      {isEditMode && (
                        <>
                          <Input
                            type="file"
                          accept="image/*,.pdf"
                            id="dl-upload"
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload("dlimg", e.target.files[0])}
                          />
                          <Button asChild variant="outline">
                            <Label htmlFor="dl-upload" className="cursor-pointer">
                              {imageLoading.dlImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </Label>
                          </Button>
                        </>
                      )}
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
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label>Passport Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={form.passportimg}
                        onChange={(e) => handleInputChange("passportimg", e.target.value)}
                        placeholder="Image URL or upload"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-gray-50" : ""}
                      />
                      {isEditMode && (
                        <>
                          <Input
                            type="file"
                          accept="image/*,.pdf"
                            id="passport-upload"
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload("passportimg", e.target.files[0])}
                          />
                          <Button asChild variant="outline">
                            <Label htmlFor="passport-upload" className="cursor-pointer">
                              {imageLoading.passportImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </Label>
                          </Button>
                        </>
                      )}
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
                    disabled={!isEditMode}
                  />
                  <Label htmlFor="isverified">Is Verified</Label>
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value="Parking Incharge" readOnly />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/parking/${spotId}`)}>
                Back to Parking
              </Button>
              {isEditMode && (
                <>
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Updating..." : "Update Parking Manager"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 