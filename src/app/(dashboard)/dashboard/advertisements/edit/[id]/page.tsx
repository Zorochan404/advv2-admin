"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { AdvertisementForm } from "../../components/advertisement-form"
import { getAdvertisementById, updateAdvertisement, CreateAdvertisementPayload, Advertisement } from "../../api"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
    params: Promise<{ id: string }>
}

export default function EditAdvertisementPage({ params }: PageProps) {
    const router = useRouter()
    // Unwrap params using use() hook as per Next.js 15+ convention for async params
    const { id } = use(params)

    const [advertisement, setAdvertisement] = useState<Advertisement | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchAd = async () => {
            if (!id) return

            const result = await getAdvertisementById(parseInt(id))
            if (result.success && result.data) {
                setAdvertisement(result.data)
            } else {
                toast.error(result.message || "Failed to load advertisement")
                router.push("/dashboard/advertisements")
            }
            setLoading(false)
        }

        fetchAd()
    }, [id, router])

    const handleSubmit = async (data: CreateAdvertisementPayload) => {
        if (!id) return

        setIsSubmitting(true)
        const result = await updateAdvertisement(parseInt(id), data)

        if (result.success) {
            toast.success(result.message || "Advertisement updated successfully")
            router.push("/dashboard/advertisements")
        } else {
            toast.error(result.message || "Failed to update advertisement")
        }
        setIsSubmitting(false)
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Edit Advertisement</h2>
            </div>

            <div className="max-w-4xl mx-auto">
                <AdvertisementForm
                    initialData={advertisement}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    )
}
