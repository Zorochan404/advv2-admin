"use client"

import { useEffect, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Search } from "lucide-react"
import { toast } from "sonner"
import { getParkingRequests, getParkingRequestDetails, updateRequestStatus, ParkingRequest } from "./api"
import { Input } from "@/components/ui/input"

export default function ParkingApprovalsPage() {
    const [requests, setRequests] = useState<ParkingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Details Modal State
    const [selectedRequest, setSelectedRequest] = useState<ParkingRequest | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // Confirmation Modal State (Reuse Details modal or separate? Separate for clarity)
    // We'll do actions directly from Details modal or Table row? 
    // Let's do actions from Details modal mainly, and maybe fast actions from table. 
    // For now, let's keep interactions simple: View Details -> Approve/Reject.

    const fetchRequests = async () => {
        setLoading(true)
        const data = await getParkingRequests()
        setRequests(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleViewDetails = async (id: number) => {
        setDetailsLoading(true)
        setIsDetailsOpen(true)
        // Set basic data if available from list/row? Or fetch fresh?
        // Fetch fresh to ensure we have all fields (images, map, etc)
        const details = await getParkingRequestDetails(id)
        if (details) {
            setSelectedRequest(details)
        } else {
            toast.error("Failed to load request details")
            setIsDetailsOpen(false)
        }
        setDetailsLoading(false)
    }

    const handleAction = async (status: 'approved' | 'rejected') => {
        if (!selectedRequest) return

        if (!confirm(`Are you sure you want to ${status} this parking request?`)) return

        setActionLoading(true)
        const success = await updateRequestStatus(selectedRequest.id, status)
        if (success) {
            toast.success(`Request ${status} successfully`)
            setIsDetailsOpen(false)
            fetchRequests() // Refresh list
        } else {
            toast.error(`Failed to ${status} request`)
        }
        setActionLoading(false)
    }

    const filteredRequests = requests.filter(req =>
        (req.parkingName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        req.id?.toString().includes(searchQuery) ||
        (req.city?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            case "approved":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
            case "rejected":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Parking Approvals</h1>
                    <p className="text-muted-foreground">
                        Review and approve parking spot requests from vendors.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchRequests} disabled={loading}>
                        <Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Requests</CardTitle>
                            <CardDescription>All parking requests pending approval.</CardDescription>
                        </div>
                        <div className="max-w-sm w-full relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search requests..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <MapPin className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No requests found</h3>
                            <p className="text-sm">There are no parking requests to show.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Parking Name</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>#{req.id}</TableCell>
                                        <TableCell className="font-medium">{req.parkingName}</TableCell>
                                        <TableCell>{req.city}</TableCell>
                                        <TableCell>{req.capacity}</TableCell>
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="secondary" onClick={() => handleViewDetails(req.id)}>
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Parking Request Details</DialogTitle>
                        <DialogDescription>Review full details before approving.</DialogDescription>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : selectedRequest ? (
                        <div className="space-y-6">
                            {/* Images */}
                            {selectedRequest.images && selectedRequest.images.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Images</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedRequest.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Parking ${idx + 1}`}
                                                className="h-32 w-auto rounded-md object-cover border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Parking Name</h3>
                                    <p className="text-lg font-medium">{selectedRequest.parkingName}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">User ID</h3>
                                    <p>{selectedRequest.vendor_name || `ID: ${selectedRequest.userId}`}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Capacity</h3>
                                    <p>{selectedRequest.capacity} Slots</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Location</h3>
                                <div className="bg-muted p-3 rounded-md text-sm">
                                    <p>{selectedRequest.address}</p>
                                    <p>{selectedRequest.city}, {selectedRequest.state}, {selectedRequest.pincode}</p>
                                    <p>{selectedRequest.country}</p>
                                    <div className="mt-2 text-xs text-muted-foreground font-mono">
                                        LAT: {selectedRequest.lat}, LNG: {selectedRequest.lng}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                        {selectedRequest && selectedRequest.status === 'pending' && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleAction('rejected')}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Deny
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleAction('approved')}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Approve
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
