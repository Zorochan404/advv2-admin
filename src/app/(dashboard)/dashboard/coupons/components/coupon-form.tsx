"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Coupon, CouponPayload } from "../api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CouponFormProps {
    initialData?: Coupon
    onSubmit: (data: CouponPayload) => Promise<void>
    isSubmitting: boolean
}

export function CouponForm({
    initialData,
    onSubmit,
    isSubmitting,
}: CouponFormProps) {
    const router = useRouter()

    const [formData, setFormData] = useState<CouponPayload>({
        code: initialData?.code || "",
        name: initialData?.name || "",
        description: initialData?.description || "",
        discountType: initialData?.discountType || "fixed",
        discountAmount: initialData?.discountAmount || 0,
        minBookingAmount: initialData?.minBookingAmount || 0,
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().substring(0, 16) : "",
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().substring(0, 16) : "",
        usageLimit: initialData?.usageLimit || 0,
        perUserLimit: initialData?.perUserLimit || 1,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        let finalValue: any = value

        // Handle numeric fields
        if (['discountAmount', 'minBookingAmount', 'usageLimit', 'perUserLimit'].includes(name)) {
            finalValue = Number(value)
        }

        // Handle code uppercase
        if (name === 'code') {
            finalValue = value.toUpperCase()
        }

        setFormData((prev) => ({ ...prev, [name]: finalValue }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.code || !formData.startDate || !formData.endDate) {
            toast.error("Please fill in all required fields")
            return
        }

        if (formData.discountAmount <= 0) {
            toast.error("Discount amount must be greater than 0")
            return
        }

        if (formData.discountType === 'percentage' && formData.discountAmount > 100) {
            toast.error("Percentage discount cannot exceed 100%")
            return
        }

        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error("End date must be after start date")
            return
        }

        if (formData.usageLimit > 0 && formData.usageLimit < formData.perUserLimit) {
            toast.error("Usage limit cannot be less than per user limit")
            return
        }

        // Send payload. Dates are already in ISO-like string from input type="datetime-local" but we might need to ensure full ISO format for backend if it expects it.
        // The input datetime-local gives "YYYY-MM-DDTHH:mm".
        // Let's ensure we send a valid ISO string.
        const payload = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
        }

        await onSubmit(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code <span className="text-red-500">*</span></Label>
                        <Input
                            id="code"
                            name="code"
                            placeholder="SUMMER2026"
                            value={formData.code}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Coupon Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Summer Sale"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Brief description of the coupon"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discountType">Discount Type</Label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(value) => handleSelectChange("discountType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discountAmount">Discount Value</Label>
                            <Input
                                id="discountAmount"
                                name="discountAmount"
                                type="number"
                                min="0"
                                value={formData.discountAmount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="minBookingAmount">Min Booking Amount</Label>
                        <Input
                            id="minBookingAmount"
                            name="minBookingAmount"
                            type="number"
                            min="0"
                            value={formData.minBookingAmount}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="usageLimit">Total Usage Limit</Label>
                            <Input
                                id="usageLimit"
                                name="usageLimit"
                                type="number"
                                min="0"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                placeholder="0 for unlimited"
                            />
                            <p className="text-xs text-muted-foreground">0 for unlimited total usage</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="perUserLimit">Per User Limit</Label>
                            <Input
                                id="perUserLimit"
                                name="perUserLimit"
                                type="number"
                                min="1"
                                value={formData.perUserLimit}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>


            <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Coupon" : "Create Coupon"}
                </Button>
            </div>
        </form>
    )
}
