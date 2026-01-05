"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, MapPin } from "lucide-react"
import { toast } from "sonner"
import { getCarRequests, assignParking, CarRequest, getUserDetails, User, getParkingSpots } from "./api"
import { FancySingleSelect } from "@/components/ui/fancy-single-select"

export default function CarRequestsPage() {
    const [requests, setRequests] = useState<CarRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVendor, setSelectedVendor] = useState<User | null>(null)
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
    const [vendorLoading, setVendorLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("ALL")

    // Assign Parking State
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<CarRequest | null>(null)
    const [parkingSpots, setParkingSpots] = useState<any[]>([])
    const [selectedParkingId, setSelectedParkingId] = useState<string>("")
    const [assigning, setAssigning] = useState(false)

    const fetchRequests = async () => {
        setLoading(true)
        const data = await getCarRequests()
        setRequests(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const filteredRequests = requests.filter(req =>
        statusFilter === "ALL" || req.status === statusFilter
    )

    const handleViewVendor = async (vendorId: number) => {
        setVendorLoading(true)
        setIsVendorModalOpen(true)
        const user = await getUserDetails(vendorId)
        setSelectedVendor(user)
        setVendorLoading(false)
    }

    const handleOpenAssignModal = async (request: CarRequest) => {
        setSelectedRequest(request)
        setAssignModalOpen(true)
        // Fetch parking spots if not already fetched
        if (parkingSpots.length === 0) {
            const spots = await getParkingSpots()
            setParkingSpots(spots)
        }
    }

    const handleAssignParking = async () => {
        if (!selectedRequest || !selectedParkingId) return

        setAssigning(true)
        const success = await assignParking(selectedRequest.id, parseInt(selectedParkingId))
        if (success) {
            toast.success("Parking assigned successfully")
            setAssignModalOpen(false)
            setSelectedParkingId("")
            fetchRequests() // Refresh list
        } else {
            toast.error("Failed to assign parking")
        }
        setAssigning(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING_ADMIN_ASSIGNMENT":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            case "PARKING_ASSIGNED":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Assigned</Badge>
            case "APPROVED":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
            case "DENIED":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Denied</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const parkingOptions = parkingSpots.map(spot => ({
        value: spot.id?.toString(),
        label: spot.name || spot.locationName || `Parking #${spot.id}`
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Car Requests</h1>
                    <p className="text-muted-foreground">
                        Manage vendor car requests and assign parking spots.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Requests</SelectItem>
                            <SelectItem value="PENDING_ADMIN_ASSIGNMENT">Pending Assignment</SelectItem>
                            <SelectItem value="PARKING_ASSIGNED">Parking Assigned</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="DENIED">Denied</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchRequests} disabled={loading}>
                        <Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Requests</CardTitle>
                    <CardDescription>
                        List of all car requests needing attention.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="rounded-full bg-muted p-3 mb-4">
                                <span className="text-2xl">🚘</span>
                            </div>
                            <h3 className="text-lg font-medium">No car requests found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                New requests from vendors will appear here.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Car</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Parking</TableHead>
                                    <TableHead>Requested At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">#{req.id}</TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handleViewVendor(req.vendorId)}
                                                className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                {req.vendorName}
                                            </button>
                                        </TableCell>
                                        <TableCell>{req.carName}</TableCell>
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell>
                                            {req.parkingName ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    {req.parkingName}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === "PENDING_ADMIN_ASSIGNMENT" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenAssignModal(req)}
                                                >
                                                    Assign Parking
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Vendor Details Modal */}
            <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Vendor Details</DialogTitle>
                        <DialogDescription>Information about the vendor.</DialogDescription>
                    </DialogHeader>
                    {vendorLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : selectedVendor ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {selectedVendor.avatar ? (
                                    <img src={selectedVendor.avatar} alt={selectedVendor.name} className="h-16 w-16 rounded-full object-cover border" />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                                        {selectedVendor.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold">{selectedVendor.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedVendor.email}</p>
                                    <Badge variant={selectedVendor.isVerified ? "default" : "destructive"} className="mt-1">
                                        {selectedVendor.isVerified ? "Verified" : "Unverified"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold block">Phone</span>
                                    {selectedVendor.phoneNumber}
                                </div>
                                <div>
                                    <span className="font-semibold block">Role</span>
                                    {selectedVendor.role}
                                </div>
                                <div className="col-span-2">
                                    <span className="font-semibold block">Address</span>
                                    {selectedVendor.address || "No address provided"}
                                </div>
                            </div>

                            {selectedVendor.documents && selectedVendor.documents.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Documents</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedVendor.documents.map((doc, idx) => (
                                            <a
                                                key={idx}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block p-2 border rounded hover:bg-muted transition-colors text-sm truncate text-blue-600"
                                            >
                                                {doc.name || `Document ${idx + 1}`}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            Vendor details not available.
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Assign Parking Modal */}
            <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Parking</DialogTitle>
                        <DialogDescription>
                            Select a parking spot for <strong>{selectedRequest?.carName}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Parking Spot</label>
                        <FancySingleSelect
                            options={parkingOptions}
                            initialSelected={selectedParkingId ? parkingOptions.find(o => o.value === selectedParkingId) : null}
                            onChange={(value) => setSelectedParkingId(value || "")}
                            placeholder="Search and select parking spot..."
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignParking} disabled={!selectedParkingId || assigning}>
                            {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
