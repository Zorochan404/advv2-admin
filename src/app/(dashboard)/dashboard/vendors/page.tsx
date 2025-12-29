"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, Edit, Trash2, RefreshCw, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteVendor, getVendors, VendorFormData, getVendorsAdmin, deleteVendorAdmin, getVendorStats } from "./api";

// Mock vendor data


export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorFormData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vendorStats, setVendorStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      const [vendors, stats] = await Promise.all([
        getVendorsAdmin(),
        getVendorStats()
      ]);
      console.log('Fetched vendors:', vendors);
      console.log('Fetched vendor stats:', stats);
      if (vendors) {
        setVendors(vendors);
      }
      if (stats) {
        setVendorStats(stats);
      }
      setIsLoading(false);
    };
    fetchVendors();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-lg font-medium">Loading vendors...</span>
      </div>
    );
  }

  const filteredVendors = (Array.isArray(vendors) ? vendors : []).filter((vendor) => {
    // Search filter
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.number && vendor.number.toString().includes(searchTerm)) ||
      (vendor.id && vendor.id.toString().includes(searchTerm));

    // Status filter
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && vendor.status === "active") ||
      (statusFilter === "inactive" && vendor.status === "inactive") ||
      (statusFilter === "pending" && !vendor.status);

    // Verification filter
    const matchesVerification = verificationFilter === "all" ||
      (verificationFilter === "verified" && vendor.isverified) ||
      (verificationFilter === "unverified" && !vendor.isverified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  console.log('Vendors state:', vendors);
  console.log('Filtered vendors:', filteredVendors);

  // Handlers
  const handleDeleteVendor = async (id: number) => {
    try {
      setDeletingId(id);
      const success = await deleteVendorAdmin(id);
      if (success) {
        setVendors(prev => prev.filter(v => v.id !== id));
        toast.success("Vendor deleted successfully!");
      } else {
        toast.error("Failed to delete vendor");
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error("Failed to delete vendor");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddVendor = (vendor: VendorFormData) => {
    setVendors((prev) => [...prev, { ...vendor, id: Date.now() }]);
    setIsAddDialogOpen(false);
    toast.success("Vendor added successfully!");
  };

  const handleEditVendor = (vendor: VendorFormData) => {

    setIsEditDialogOpen(false);
    toast.success("Vendor updated successfully!");
  };

  return (



    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors Management</h1>
          <p className="text-gray-600 mt-2">Manage your vendors</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsLoading(true);
              const fetchVendors = async () => {
                const [vendors, stats] = await Promise.all([
                  getVendorsAdmin(),
                  getVendorStats()
                ]);
                console.log('Refreshed vendors:', vendors);
                console.log('Refreshed stats:', stats);
                if (vendors) {
                  setVendors(vendors);
                }
                if (stats) {
                  setVendorStats(stats);
                }
                setIsLoading(false);
              };
              fetchVendors();
            }}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/dashboard/vendors/add')}>
            <Plus className="h-4 w-4 mr-2" /> Add Vendor
          </Button>
        </div>
      </div>

      {/* Vendor Stats */}
      {vendorStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold">{vendorStats.totalVendors}</p>
                  {vendorStats.newVendorsThisMonth && (
                    <p className="text-xs text-green-600">+{vendorStats.newVendorsThisMonth} this month</p>
                  )}
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">V</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Vendors</p>
                  <p className="text-2xl font-bold text-green-600">{vendorStats.verifiedVendors}</p>
                  {vendorStats.verificationRate && (
                    <p className="text-xs text-gray-500">{vendorStats.verificationRate}% verified</p>
                  )}
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-blue-600">{vendorStats.activeVendors || vendorStats.totalVendors - vendorStats.pendingVendors}</p>
                  {vendorStats.activeRate && (
                    <p className="text-xs text-gray-500">{vendorStats.activeRate}% active</p>
                  )}
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">⚡</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{vendorStats.totalRevenue?.toLocaleString() || '0'}</p>
                  {vendorStats.averageRevenuePerVendor && (
                    <p className="text-xs text-gray-500">Avg: ₹{vendorStats.averageRevenuePerVendor.toLocaleString()}</p>
                  )}
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">₹</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cars</p>
                <p className="text-2xl font-bold">{vendors.reduce((sum, vendor) => sum + (vendor.carCount || 0), 0)}</p>
                <p className="text-xs text-gray-500">
                  Avg: {vendors.length ? Math.round(vendors.reduce((sum, vendor) => sum + (vendor.carCount || 0), 0) / vendors.length) : 0} per vendor
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">🚗</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cars</p>
                <p className="text-2xl font-bold">{vendors.reduce((sum, vendor) => sum + (vendor.cars?.filter(car => car.isavailable && !car.inmaintainance).length || 0), 0)}</p>
                <p className="text-xs text-gray-500">
                  {vendors.reduce((sum, vendor) => sum + (vendor.cars?.filter(car => car.inmaintainance).length || 0), 0)} in maintenance
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Car Value</p>
                <p className="text-2xl font-bold">₹{vendors.reduce((sum, vendor) => sum + (vendor.cars?.reduce((carSum, car) => carSum + car.price, 0) || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  Avg: ₹{vendors.length ? Math.round(vendors.reduce((sum, vendor) => sum + (vendor.cars?.reduce((carSum, car) => carSum + car.price, 0) || 0), 0) / vendors.length) : 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors List</CardTitle>
          <CardDescription>View and manage all vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredVendors.length} of {vendors.length} vendors
            {(statusFilter !== "all" || verificationFilter !== "all" || searchTerm) && (
              <span className="ml-2">
                (filtered by {[
                  statusFilter !== "all" && `status: ${statusFilter}`,
                  verificationFilter !== "all" && `verification: ${verificationFilter}`,
                  searchTerm && `search: "${searchTerm}"`
                ].filter(Boolean).join(", ")})
              </span>
            )}
          </div>

          {/* Vendors Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <span className="text-lg font-medium">Loading vendors...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cars</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor: VendorFormData) => (
                    <TableRow key={vendor.id}>
                      <TableCell>{vendor.id?.toString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {vendor.avatar && (
                            <img
                              src={vendor.avatar}
                              alt={vendor.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="font-medium">{vendor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.number || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${vendor.isverified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {vendor.isverified ? 'Verified' : 'Pending'}
                          </span>
                          {vendor.status && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${vendor.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {vendor.status}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{vendor.carCount || 0} total</div>
                          <div className="text-gray-500">{vendor.cars?.filter(car => car.isavailable && !car.inmaintainance).length || 0} active</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">₹{vendor.cars?.reduce((sum, car) => sum + car.price, 0).toLocaleString() || '0'}</div>
                          <div className="text-gray-500">Total car value</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          {/* View Vendor */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedVendor(vendor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Vendor Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for {vendor.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Basic Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="font-semibold">ID:</span> {vendor.id}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Name:</span> {vendor.name}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Age:</span> {vendor.age ?? "-"}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Email:</span> {vendor.email}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Phone:</span> {vendor.number}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Role:</span> {vendor.role}
                                  </div>
                                </div>

                                {/* Status Information */}
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-2">Status & Verification</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="font-semibold">Verification Status:</span>{" "}
                                      {vendor.isverified ? (
                                        <span className="text-green-600 font-semibold">Verified</span>
                                      ) : (
                                        <span className="text-yellow-600 font-semibold">Pending</span>
                                      )}
                                    </div>
                                    {vendor.status && (
                                      <div>
                                        <span className="font-semibold">Account Status:</span>{" "}
                                        <span className={`font-semibold ${vendor.status === 'active' ? 'text-green-600' : 'text-gray-600'
                                          }`}>
                                          {vendor.status}
                                        </span>
                                      </div>
                                    )}
                                    {vendor.documentsVerified !== undefined && (
                                      <div>
                                        <span className="font-semibold">Documents Verified:</span>{" "}
                                        <span className={`font-semibold ${vendor.documentsVerified ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                          {vendor.documentsVerified ? 'Yes' : 'No'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Business Metrics */}
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-2">Business Metrics</h4>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                      <div className="text-2xl font-bold text-blue-600">{vendor.carCount || 0}</div>
                                      <div className="text-sm text-gray-600">Total Cars</div>
                                      <div className="text-xs text-gray-500">{vendor.cars?.filter(car => car.isavailable && !car.inmaintainance).length || 0} active</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                      <div className="text-2xl font-bold text-green-600">₹{vendor.cars?.reduce((sum, car) => sum + car.price, 0).toLocaleString() || '0'}</div>
                                      <div className="text-sm text-gray-600">Total Car Value</div>
                                      <div className="text-xs text-gray-500">Avg: ₹{vendor.cars?.length ? Math.round(vendor.cars.reduce((sum, car) => sum + car.price, 0) / vendor.cars.length) : 0}</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                      <div className="text-2xl font-bold text-purple-600">{vendor.cars?.filter(car => car.inmaintainance).length || 0}</div>
                                      <div className="text-sm text-gray-600">In Maintenance</div>
                                      <div className="text-xs text-gray-500">{vendor.cars?.filter(car => !car.isavailable).length || 0} unavailable</div>
                                    </div>
                                  </div>
                                  {vendor.averageRating && (
                                    <div className="mt-2 text-center">
                                      <span className="font-semibold">Average Rating:</span>{" "}
                                      <span className="text-yellow-600 font-bold">{vendor.averageRating}/5 ⭐</span>
                                    </div>
                                  )}
                                </div>

                                {/* Address Information */}
                                {(vendor.locality || vendor.city || vendor.state || vendor.country || vendor.pincode) && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Address Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {vendor.locality && (
                                        <div>
                                          <span className="font-semibold">Location:</span> {vendor.locality}
                                        </div>
                                      )}
                                      {vendor.city && (
                                        <div>
                                          <span className="font-semibold">City:</span> {vendor.city}
                                        </div>
                                      )}
                                      {vendor.state && (
                                        <div>
                                          <span className="font-semibold">State:</span> {vendor.state}
                                        </div>
                                      )}
                                      {vendor.country && (
                                        <div>
                                          <span className="font-semibold">Country:</span> {vendor.country}
                                        </div>
                                      )}
                                      {vendor.pincode && (
                                        <div>
                                          <span className="font-semibold">Pincode:</span> {vendor.pincode}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Document Information */}
                                {(vendor.aadharNumber || vendor.dlNumber || vendor.passportNumber) && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Document Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {vendor.aadharNumber && (
                                        <div>
                                          <span className="font-semibold">Aadhar Number:</span> {vendor.aadharNumber}
                                        </div>
                                      )}
                                      {vendor.dlNumber && (
                                        <div>
                                          <span className="font-semibold">DL Number:</span> {vendor.dlNumber}
                                        </div>
                                      )}
                                      {vendor.passportNumber && (
                                        <div>
                                          <span className="font-semibold">Passport Number:</span> {vendor.passportNumber}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Business Details */}
                                {vendor.businessDetails && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Business Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {vendor.businessDetails.businessName && (
                                        <div>
                                          <span className="font-semibold">Business Name:</span> {vendor.businessDetails.businessName}
                                        </div>
                                      )}
                                      {vendor.businessDetails.businessType && (
                                        <div>
                                          <span className="font-semibold">Business Type:</span> {vendor.businessDetails.businessType}
                                        </div>
                                      )}
                                      {vendor.businessDetails.gstNumber && (
                                        <div>
                                          <span className="font-semibold">GST Number:</span> {vendor.businessDetails.gstNumber}
                                        </div>
                                      )}
                                      {vendor.businessDetails.panNumber && (
                                        <div>
                                          <span className="font-semibold">PAN Number:</span> {vendor.businessDetails.panNumber}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Bank Details */}
                                {vendor.bankDetails && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Bank Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {vendor.bankDetails.bankName && (
                                        <div>
                                          <span className="font-semibold">Bank Name:</span> {vendor.bankDetails.bankName}
                                        </div>
                                      )}
                                      {vendor.bankDetails.accountNumber && (
                                        <div>
                                          <span className="font-semibold">Account Number:</span> {vendor.bankDetails.accountNumber}
                                        </div>
                                      )}
                                      {vendor.bankDetails.ifscCode && (
                                        <div>
                                          <span className="font-semibold">IFSC Code:</span> {vendor.bankDetails.ifscCode}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Cars Information */}
                                {vendor.cars && vendor.cars.length > 0 && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Cars ({vendor.carCount})</h4>
                                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                                      {vendor.cars.map((car) => (
                                        <div key={car.id} className="border rounded-lg p-3 bg-gray-50">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <div className="font-medium text-sm">{car.name}</div>
                                              <div className="text-xs text-gray-600">Number: {car.number}</div>
                                              <div className="text-xs text-gray-600">Price: ₹{car.price}/day</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${car.isavailable && !car.inmaintainance
                                                  ? 'bg-green-100 text-green-800'
                                                  : car.inmaintainance
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {car.inmaintainance ? 'Maintenance' : car.isavailable ? 'Available' : 'Unavailable'}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {new Date(car.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                          {car.images && car.images.length > 0 && (
                                            <div className="mt-2 flex gap-1">
                                              {car.images.slice(0, 3).map((image, index) => (
                                                <img
                                                  key={index}
                                                  src={image}
                                                  alt={`${car.name} ${index + 1}`}
                                                  className="w-12 h-8 object-cover rounded border"
                                                />
                                              ))}
                                              {car.images.length > 3 && (
                                                <div className="w-12 h-8 bg-gray-200 rounded border flex items-center justify-center text-xs">
                                                  +{car.images.length - 3}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Timestamps */}
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-2">Timeline</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="font-semibold">Created:</span> {new Date(vendor.createdAt || '').toLocaleDateString()}
                                    </div>
                                    <div>
                                      <span className="font-semibold">Last Updated:</span> {new Date(vendor.updatedAt || '').toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Images */}
                                {(vendor.avatar || vendor.aadharimg || vendor.dlimg || vendor.passportimg) && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Document Images</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {vendor.avatar && (
                                        <div>
                                          <span className="font-semibold">Avatar:</span>
                                          <div className="mt-1">
                                            <a href={vendor.avatar} target="_blank" rel="noopener noreferrer">
                                              <img src={vendor.avatar} alt="Avatar" className="w-24 h-24 object-cover rounded border" />
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      {vendor.aadharimg && (
                                        <div>
                                          <span className="font-semibold">Aadhar Image:</span>
                                          <div className="mt-1">
                                            <a href={vendor.aadharimg} target="_blank" rel="noopener noreferrer">
                                              <img src={vendor.aadharimg} alt="Aadhar" className="w-24 h-16 object-cover rounded border" />
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      {vendor.dlimg && (
                                        <div>
                                          <span className="font-semibold">DL Image:</span>
                                          <div className="mt-1">
                                            <a href={vendor.dlimg} target="_blank" rel="noopener noreferrer">
                                              <img src={vendor.dlimg} alt="DL" className="w-24 h-16 object-cover rounded border" />
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      {vendor.passportimg && (
                                        <div>
                                          <span className="font-semibold">Passport Image:</span>
                                          <div className="mt-1">
                                            <a href={vendor.passportimg} target="_blank" rel="noopener noreferrer">
                                              <img src={vendor.passportimg} alt="Passport" className="w-24 h-16 object-cover rounded border" />
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {/* Edit Vendor */}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              router.push(`/dashboard/vendors/edit/${vendor.id}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>


                          {/* Delete Vendor */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVendor(vendor.id!)}
                            disabled={deletingId === vendor.id}
                          >
                            {deletingId === vendor.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm
            onSubmit={handleAddVendor}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Vendor Form Component
function VendorForm({ initial, onSubmit, onCancel }: {
  initial?: VendorFormData | null,
  onSubmit: (vendor: VendorFormData) => void,
  onCancel: () => void
}) {

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ ...initial! });
      }}
      className="space-y-4"
    >
      <div>
        <Label>Name</Label>
        <Input
          value={initial?.name}
          onChange={e => onSubmit({ ...initial!, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={initial?.email}
          onChange={e => onSubmit({ ...initial!, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Phone</Label>
        <Input
          type="tel"
          value={initial?.number}
          onChange={e => onSubmit({ ...initial!, number: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Address</Label>
        <Input
          value={initial?.locality}
          onChange={e => onSubmit({ ...initial!, locality: e.target.value })}
          required
        />
      </div>
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
}
