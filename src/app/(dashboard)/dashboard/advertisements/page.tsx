"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Advertisement, getAdvertisements, deleteAdvertisement } from "./api"
import { AdvertisementsTable } from "./components/advertisements-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { AdvertisementViewDialog } from "./components/advertisement-view-dialog"

export default function AdvertisementsPage() {
    const router = useRouter()
    const [data, setData] = useState<Advertisement[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // View Details State
    const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    const fetchData = async (page: number) => {
        setLoading(true)
        const result = await getAdvertisements(page)
        if (result.success && result.data) {
            setData(Array.isArray(result.data) ? result.data : [])
            if (result.pagination) {
                setTotalPages(result.pagination.totalPages)
                setCurrentPage(result.pagination.currentPage)
            }
        } else {
            toast.error(result.message || "Failed to fetch advertisements")
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData(currentPage)
    }, [currentPage])

    const handleDeleteClick = (id: number) => {
        setDeleteId(id)
        setIsDeleteOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        const result = await deleteAdvertisement(deleteId)

        if (result.success) {
            toast.success("Advertisement deleted successfully")
            // Optimistic update or refetch
            setData(prev => prev.filter(ad => ad.id !== deleteId))
            if (data.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1)
            }
        } else {
            toast.error(result.message || "Failed to delete advertisement")
        }

        setIsDeleting(false)
        setIsDeleteOpen(false)
        setDeleteId(null)
    }

    const handleViewClick = (ad: Advertisement) => {
        setSelectedAd(ad)
        setIsViewOpen(true)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Advertisements</h2>
                <Button onClick={() => router.push("/dashboard/advertisements/create")}>
                    <Plus className="mr-2 h-4 w-4" /> Create Advertisement
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    <AdvertisementsTable
                        data={data}
                        onDelete={handleDeleteClick}
                        onView={handleViewClick}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the advertisement.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <AdvertisementViewDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                advertisement={selectedAd}
            />
        </div>
    )
}
