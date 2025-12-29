'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Calendar, Search, Eye, Edit, Trash2, Car, User, MapPin, CreditCard, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { getBookings, deleteBooking, updateBookingStatus, Booking } from './api'
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types'

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  
  // Date range filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateFilterActive, setDateFilterActive] = useState(false)

  // Fetch bookings on component mount
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const result = await getBookings()
        if (result.success && result.data) {
          // Handle both array and direct array responses
          const bookingsData = Array.isArray(result.data) ? result.data : [result.data]
          setBookings(bookingsData)
        } else {
          toast.error(result.message || 'Failed to fetch bookings')
        }
      } catch (error) {
        console.error('Error loading bookings:', error)
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  // Filtered bookings logic
  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(booking => {
    const matchesSearch =
      (booking.user?.name && booking.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.user?.email && booking.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.car?.name && booking.car.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.car?.maker && booking.car.maker.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.car?.carnumber && booking.car.carnumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter

    // Date range filter
    let matchesDateRange = true
    if (dateFilterActive && startDate && endDate) {
      const bookingStartDate = new Date(booking.startDate)
      const bookingEndDate = new Date(booking.endDate)
      const filterStartDate = new Date(startDate)
      const filterEndDate = new Date(endDate)
      
      // Check if booking dates overlap with filter dates
      matchesDateRange = bookingStartDate <= filterEndDate && bookingEndDate >= filterStartDate
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDateRange
  })

  const handleDeleteBooking = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        const result = await deleteBooking(bookingId)
        if (result.success) {
          toast.success('Booking deleted successfully!')
          const bookingsArray = Array.isArray(bookings) ? bookings : []
          setBookings(bookingsArray.filter(booking => booking.id !== bookingId))
        } else {
          toast.error(result.message || 'Failed to delete booking')
        }
      } catch (error) {
        console.error('Error deleting booking:', error)
        toast.error('Failed to delete booking')
      }
    }
  }

  const handleStatusUpdate = async (bookingId: number, newStatus: Booking['status']) => {
    try {
      const result = await updateBookingStatus(bookingId, newStatus)
      if (result.success) {
        toast.success('Booking status updated successfully!')
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ))
      } else {
        toast.error(result.message || 'Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    }
  }

  const getStatusBadgeColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'advance_paid':
        return 'bg-orange-100 text-orange-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentBadgeColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0
      }
      
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (error) {
      return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor all car rental bookings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{(Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{(Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold">{(Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'confirmed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings List</CardTitle>
          <CardDescription>Manage and monitor all car rental bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name, email, car details, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="advance_paid">Advance Paid</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex gap-4 items-center">
              <Label className="text-sm font-medium">Filter by Booking Dates:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="max-w-xs"
                placeholder="Start Date"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="max-w-xs"
                placeholder="End Date"
              />
              <Button
                onClick={() => {
                  if (startDate && endDate) {
                    setDateFilterActive(true)
                    toast.success('Date filter applied!')
                  } else {
                    toast.error('Please select both start and end dates')
                  }
                }}
                variant="outline"
                size="sm"
              >
                Apply Date Filter
              </Button>
              {dateFilterActive && (
                <Button
                  onClick={() => {
                    setDateFilterActive(false)
                    setStartDate('')
                    setEndDate('')
                    toast.success('Date filter cleared!')
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Clear Date Filter
                </Button>
              )}
            </div>
          </div>

          {/* Bookings Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Car Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">#{booking.id}</p>
                        <p className="text-sm text-gray-600">
                          {booking.createdAt
                            ? formatDate(
                                typeof booking.createdAt === 'number'
                                  ? new Date(booking.createdAt)
                                  : booking.createdAt
                              )
                            : 'No date'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                          <p className="font-medium">{booking.user?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-600">{booking.user?.email || 'No email'}</p>
                          <p className="text-sm text-gray-600">{booking.user?.number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.car?.name || 'Unknown Car'}</p>
                          <p className="text-sm text-gray-600">{booking.car?.maker || 'Unknown Maker'}</p>
                          <p className="text-sm text-gray-600">{booking.car?.carnumber || 'No number'}</p>
                        </div>
                      </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{calculateDuration(booking.startDate.toString(), booking.endDate.toString())} days</p>
                        <p className="text-sm text-gray-600">
                          {booking.startDate ? formatDate(booking.startDate.toString()) : 'No start date'} - {booking.endDate ? formatDate(booking.endDate.toString()) : 'No end date'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentBadgeColor(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={booking.status}
                          onValueChange={(value: Booking['status']) => handleStatusUpdate(booking.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="advance_paid">Advance Paid</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 