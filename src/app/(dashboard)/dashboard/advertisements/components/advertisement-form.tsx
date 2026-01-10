"use client"

import { useState, useRef } from "react"
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
import { Advertisement, CreateAdvertisementPayload, AdType } from "../api"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"

interface AdvertisementFormProps {
    initialData?: Advertisement
    onSubmit: (data: CreateAdvertisementPayload) => Promise<void>
    isSubmitting: boolean
}

export function AdvertisementForm({
    initialData,
    onSubmit,
    isSubmitting,
}: AdvertisementFormProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<CreateAdvertisementPayload>({
        title: initialData?.title || "",
        description: initialData?.description || "",
        imageUrl: initialData?.imageUrl || "",
        // Initialize optional fields with empty strings
        linkUrl: initialData?.linkUrl || "",
        adType: initialData?.adType || "banner",
        // Ensure dates are correctly formatted for backend
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
        isActive: initialData?.isActive ?? true,
    })

    const [uploading, setUploading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isActive: checked }))
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const result = await uploadImageToCloudinary(file, "advertisements")
            if (result.success && result.data) {
                setFormData((prev) => ({ ...prev, imageUrl: result.data!.secure_url }))
                toast.success("Image uploaded successfully")
            } else {
                toast.error(result.error || "Failed to upload image")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred during upload")
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, imageUrl: "" }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (!formData.title || !formData.imageUrl || !formData.startDate || !formData.endDate) {
            toast.error("Please fill in all required fields")
            return
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error("End date cannot be before start date")
            return
        }

        // Prepare payload with ISO dates for backend
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
                        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Ad Campaign Title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Brief description of the advertisement"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="linkUrl">Link URL <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                        <Input
                            id="linkUrl"
                            name="linkUrl"
                            placeholder="https://example.com/promo"
                            value={formData.linkUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="adType">Ad Type <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.adType}
                                onValueChange={(value) => handleSelectChange("adType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="banner">Banner</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="popup">Popup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex flex-col justify-end pb-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={handleSwitchChange}
                                />
                                <Label htmlFor="isActive">Active Status</Label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
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
                                type="date"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>Ad Image <span className="text-red-500">*</span></Label>

                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] bg-muted/20 relative">
                        {formData.imageUrl ? (
                            <>
                                <Image
                                    src={formData.imageUrl}
                                    alt="Ad Preview"
                                    fill
                                    className="object-contain p-2"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm hover:bg-destructive/90 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="bg-primary/10 p-4 rounded-full inline-block">
                                    <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Click to upload image</p>
                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 10MB)</p>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${formData.imageUrl ? 'hidden' : ''}`}
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={uploading}
                        />
                    </div>
                    {uploading && (
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || uploading}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Advertisement" : "Create Advertisement"}
                </Button>
            </div>
        </form>
    )
}
