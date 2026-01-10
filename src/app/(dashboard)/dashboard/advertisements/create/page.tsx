"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdvertisementForm } from "../components/advertisement-form"
import { createAdvertisement, CreateAdvertisementPayload } from "../api"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreateAdvertisementPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (data: CreateAdvertisementPayload) => {
        setIsSubmitting(true)
        const result = await createAdvertisement(data)

        if (result.success) {
            toast.success(result.message || "Advertisement created successfully")
            router.push("/dashboard/advertisements")
            // Force refresh data? router.refresh() might be needed or handled by the list page fetching on mount
        } else {
            toast.error(result.message || "Failed to create advertisement")
        }
        setIsSubmitting(false)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Create Advertisement</h2>
            </div>

            <div className="max-w-4xl mx-auto">
                <AdvertisementForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
        </div>
    )
}
