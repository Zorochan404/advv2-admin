"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Advertisement } from "../api"
import { format } from "date-fns"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface AdvertisementViewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    advertisement: Advertisement | null
}

export function AdvertisementViewDialog({
    open,
    onOpenChange,
    advertisement,
}: AdvertisementViewDialogProps) {
    if (!advertisement) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Advertisement Details</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                            {advertisement.imageUrl ? (
                                <Image
                                    src={advertisement.imageUrl}
                                    alt={advertisement.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Link URL</h4>
                            <a
                                href={advertisement.linkUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 hover:underline break-all"
                            >
                                {advertisement.linkUrl}
                            </a>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-1">Title</h4>
                            <p className="text-sm text-muted-foreground">{advertisement.title}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{advertisement.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-1">Type</h4>
                                <Badge variant="outline" className="capitalize">{advertisement.adType}</Badge>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Status</h4>
                                <Badge variant={advertisement.isActive ? "default" : "secondary"}>
                                    {advertisement.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-1">Start Date</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(advertisement.startDate), "PPP")}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">End Date</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(advertisement.endDate), "PPP")}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-1">Views</h4>
                                <p className="text-sm font-medium">{advertisement.viewCount}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Clicks</h4>
                                <p className="text-sm font-medium">{advertisement.clickCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
