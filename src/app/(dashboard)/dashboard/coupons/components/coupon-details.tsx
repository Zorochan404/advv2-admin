"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Coupon } from "../api"
import { formatCurrency, formatDate } from "@/lib/utils" // Assuming these exist, checked table use earlier
import { Calendar, Tag, CreditCard, Users, Hash } from "lucide-react"

interface CouponDetailsProps {
    coupon: Coupon | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CouponDetails({
    coupon,
    open,
    onOpenChange
}: CouponDetailsProps) {
    if (!coupon) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Coupon Details
                    </DialogTitle>
                    <DialogDescription>
                        Detailed information for coupon {coupon.code}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Header Info */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-primary">{coupon.code}</h3>
                            <p className="text-sm text-muted-foreground">{coupon.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                {coupon.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                ID: {coupon.id}
                            </span>
                        </div>
                    </div>

                    {/* Discount Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Discount</p>
                            <p className="font-semibold text-lg flex items-center">
                                {coupon.discountType === 'percentage'
                                    ? `${coupon.discountAmount}%`
                                    : formatCurrency(coupon.discountAmount)
                                }
                                <span className="ml-1 text-xs font-normal text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
                                    {coupon.discountType}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Min Booking</p>
                            <p className="font-semibold text-lg">
                                {formatCurrency(coupon.minBookingAmount)}
                            </p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Validity Period
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Start Date</p>
                                <p>{new Date(coupon.startDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">End Date</p>
                                <p>{new Date(coupon.endDate).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" /> Usage Limits
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Usage</p>
                                <p>
                                    Used: <span className="font-medium">{coupon.count}</span>
                                    {coupon.usageLimit > 0 && <span> / {coupon.usageLimit}</span>}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Per User Limit</p>
                                <p className="font-medium">{coupon.perUserLimit}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {coupon.description && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Hash className="h-4 w-4" /> Description
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                {coupon.description}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
