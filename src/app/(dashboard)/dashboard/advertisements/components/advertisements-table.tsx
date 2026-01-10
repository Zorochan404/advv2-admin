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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Advertisement } from "../api"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface AdvertisementsTableProps {
    data: Advertisement[]
    onDelete: (id: number) => void
    onView: (ad: Advertisement) => void
}

export function AdvertisementsTable({
    data,
    onDelete,
    onView,
}: AdvertisementsTableProps) {
    const router = useRouter()

    const getStatusColor = (isActive: boolean | undefined, startDate: string, endDate: string) => {
        const now = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (!isActive) return "destructive" // Inactive
        if (now < start) return "secondary" // Pending/Scheduled
        if (now > end) return "outline" // Expired
        return "default" // Active
    }

    const getStatusLabel = (isActive: boolean | undefined, startDate: string, endDate: string) => {
        const now = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (!isActive) return "Inactive"
        if (now < start) return "Scheduled"
        if (now > end) return "Expired"
        return "Active"
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Stats</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(Array.isArray(data) ? data : []).map((ad) => (
                        <TableRow key={ad.id}>
                            <TableCell className="font-medium">{ad.id}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{ad.title}</span>
                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {ad.linkUrl}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="capitalize">{ad.adType}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusColor(ad.isActive, ad.startDate, ad.endDate)}>
                                    {getStatusLabel(ad.isActive, ad.startDate, ad.endDate)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-xs">
                                    <span>{format(new Date(ad.startDate), "MMM d, yyyy")}</span>
                                    <span className="text-muted-foreground">to</span>
                                    <span>{format(new Date(ad.endDate), "MMM d, yyyy")}</span>
                                </div>
                            </TableCell>
                            <TableCell>{ad.priority}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex flex-col text-xs">
                                    <span>{ad.viewCount} Views</span>
                                    <span>{ad.clickCount} Clicks</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onView(ad)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => router.push(`/dashboard/advertisements/edit/${ad.id}`)}
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => onDelete(ad.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                No advertisements found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
