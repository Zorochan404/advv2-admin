"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Coupon } from "../api"
import { formatCurrency, formatDate } from "@/lib/utils"

interface CouponsTableProps {
    coupons: Coupon[]
    isLoading: boolean
    onView: (coupon: Coupon) => void
    onEdit: (coupon: Coupon) => void
    onDelete: (coupon: Coupon) => void
}

export function CouponsTable({
    coupons,
    isLoading,
    onView,
    onEdit,
    onDelete
}: CouponsTableProps) {

    if (isLoading) {
        return (
            <div className="w-full h-48 flex items-center justify-center">
                <p className="text-muted-foreground">Loading coupons...</p>
            </div>
        )
    }

    if (!Array.isArray(coupons) || coupons.length === 0) {
        return (
            <div className="w-full h-48 flex flex-col items-center justify-center border rounded-md bg-muted/10">
                <p className="text-lg font-medium">No coupons available</p>
                <p className="text-muted-foreground text-sm">Create your first coupon to start promotions</p>
            </div>
        )
    }

    const getStatusBadge = (coupon: Coupon) => {
        const now = new Date()
        const startDate = new Date(coupon.startDate)
        const endDate = new Date(coupon.endDate)

        if (!coupon.isActive) {
            return <Badge variant="destructive">Disabled</Badge>
        }

        if (endDate < now) {
            return <Badge variant="secondary">Expired</Badge>
        }

        if (startDate > now) {
            return <Badge variant="outline">Scheduled</Badge>
        }

        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Min Order</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                            <TableCell className="font-medium font-mono">
                                {coupon.code}
                            </TableCell>
                            <TableCell>{coupon.name}</TableCell>
                            <TableCell>
                                {coupon.discountType === 'percentage'
                                    ? `${coupon.discountAmount}%`
                                    : formatCurrency(coupon.discountAmount)
                                }
                            </TableCell>
                            <TableCell>
                                {formatCurrency(coupon.minBookingAmount)}
                            </TableCell>
                            <TableCell>
                                {coupon.usageLimit > 0
                                    ? `${coupon.count} / ${coupon.usageLimit}`
                                    : `${coupon.count} / ∞`
                                }
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(coupon)}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onView(coupon)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(coupon)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => onDelete(coupon)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
