"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    Coupon,
    CouponPayload
} from "./api"
import { CouponsTable } from "./components/coupons-table"
import { CouponForm } from "./components/coupon-form"
import { CouponDetails } from "./components/coupon-details"

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)

    // State for actions
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchCoupons = async () => {
        setLoading(true)
        const result = await getAllCoupons()
        if (result.success && result.data) {
            setCoupons(result.data)
        } else {
            toast.error(result.message || "Failed to fetch coupons")
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleCreate = async (data: CouponPayload) => {
        setIsSubmitting(true)
        const result = await createCoupon(data)
        setIsSubmitting(false)

        if (result.success) {
            toast.success("Coupon created successfully")
            setIsCreateOpen(false)
            fetchCoupons()
        } else {
            toast.error(result.message || "Failed to create coupon")
        }
    }

    const handleEdit = async (data: CouponPayload) => {
        if (!selectedCoupon) return

        setIsSubmitting(true)
        const result = await updateCoupon(selectedCoupon.id, data)
        setIsSubmitting(false)

        if (result.success) {
            toast.success("Coupon updated successfully")
            setIsEditOpen(false)
            setSelectedCoupon(null)
            fetchCoupons()
        } else {
            toast.error(result.message || "Failed to update coupon")
        }
    }

    const handleDelete = async () => {
        if (!selectedCoupon) return

        setIsSubmitting(true)
        const result = await deleteCoupon(selectedCoupon.id)
        setIsSubmitting(false)

        if (result.success) {
            toast.success("Coupon deleted successfully")
            setIsDeleteOpen(false)
            setSelectedCoupon(null)
            // Optimistic update or refetch
            setCoupons(prev => prev.filter(c => c.id !== selectedCoupon.id))
        } else {
            toast.error(result.message || "Failed to delete coupon")
        }
    }

    const openEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon)
        setIsEditOpen(true)
    }

    const openDetails = (coupon: Coupon) => {
        setSelectedCoupon(coupon)
        setIsDetailsOpen(true)
    }

    const openDelete = (coupon: Coupon) => {
        setSelectedCoupon(coupon)
        setIsDeleteOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage promotional discounts and offers
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </div>

            <CouponsTable
                coupons={coupons}
                isLoading={loading}
                onView={openDetails}
                onEdit={openEdit}
                onDelete={openDelete}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Coupon</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new promotional coupon.
                        </DialogDescription>
                    </DialogHeader>
                    <CouponForm
                        onSubmit={handleCreate}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open)
                if (!open) setSelectedCoupon(null)
            }}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Coupon</DialogTitle>
                        <DialogDescription>
                            Update the details for coupon {selectedCoupon?.code}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCoupon && (
                        <CouponForm
                            initialData={selectedCoupon}
                            onSubmit={handleEdit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <CouponDetails
                coupon={selectedCoupon}
                open={isDetailsOpen}
                onOpenChange={(open) => {
                    setIsDetailsOpen(open)
                    if (!open) setSelectedCoupon(null)
                }}
            />

            {/* Delete Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={(open) => {
                setIsDeleteOpen(open)
                if (!open) setSelectedCoupon(null)
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the coupon
                            <span className="font-semibold text-foreground"> {selectedCoupon?.code} </span>
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
