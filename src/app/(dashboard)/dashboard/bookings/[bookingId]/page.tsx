'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Calendar, ArrowLeft, Car, User, MapPin, CreditCard, Clock, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getBookingById, updateBookingStatus, deleteBooking, Booking } from '../api'

export default function BookingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch booking details on component mount
  useEffect(() => {
    const loadBooking = async () => {
      try {
        const result = await getBookingById(parseInt(bookingId))
        if (result.success && result.data) {
          setBooking(result.data)
        } else {
          toast.error(result.message || 'Failed to fetch booking details')
          router.push('/dashboard/bookings')
        }
      } catch (error) {
        console.error('Error loading booking:', error)
        toast.error('Failed to load booking details')
        router.push('/dashboard/bookings')
      } finally {
        setLoading(false)
      }
    }
    loadBooking()
  }, [bookingId, router])

  const handleStatusUpdate = async (newStatus: Booking['status']) => {
    if (!booking) return
    
    setUpdatingStatus(true)
    try {
      const result = await updateBookingStatus(booking.id, newStatus)
      if (result.success) {
        setBooking({ ...booking, status: newStatus })
        toast.success('Booking status updated successfully!')
      } else {
        toast.error(result.message || 'Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDeleteBooking = async () => {
    if (!booking) return
    
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      setDeleting(true)
      try {
        const result = await deleteBooking(booking.id)
        if (result.success) {
          toast.success('Booking deleted successfully!')
          router.push('/dashboard/bookings')
        } else {
          toast.error(result.message || 'Failed to delete booking')
        }
      } catch (error) {
        console.error('Error deleting booking:', error)
        toast.error('Failed to delete booking')
      } finally {
        setDeleting(false)
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-medium">Loading booking details...</span>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <Button onClick={() => router.push('/dashboard/bookings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/bookings')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.id}</h1>
            <p className="text-gray-600 mt-2">
              Complete booking information and details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/bookings/edit/${booking.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteBooking}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete Booking'}
          </Button>
        </div>
      </div>

      {/* Booking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusBadgeColor(booking.status)}>
                  {booking.status}
                </Badge>
                <Badge className={getPaymentBadgeColor(booking.paymentStatus)}>
                  {booking.paymentStatus}
                </Badge>
              </div>
              <p className="text-gray-600">Created on {booking.createdAt ? formatDateTime(booking.createdAt.toString()) : 'Unknown date'}</p>  
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(booking.totalPrice)}</p>
              <p className="text-sm text-gray-600">Total Amount</p>
              {booking.insurancePrice > 0 && (
                <p className="text-sm text-blue-600">+ {formatCurrency(booking.insurancePrice)} insurance</p>
              )}
              {(booking.extensionPrice || booking.extentiontill) && (
                <div className="mt-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    Extended Trip
                  </Badge>
                  {booking.extensionPrice && (
                    <p className="text-sm text-orange-600 mt-1">+ {formatCurrency(booking.extensionPrice)} extension</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {booking.user?.name ? booking.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{booking.user?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-600">Customer ID: {booking.userId}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{booking.user?.email || 'No email'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{booking.user?.number}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium capitalize">{booking.user?.role || 'Unknown'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Verification Status</p>
                <p className="font-medium">{booking.user?.isverified ? 'Verified' : 'Not Verified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Information */}
        {booking.car && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Car Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={Array.isArray(booking.car.mainimg) ? booking.car.mainimg[0] : booking.car.mainimg} 
                  alt={booking.car.name} 
                  className="w-16 h-12 object-cover rounded" 
                />
                <div>
                  <p className="font-medium">{booking.car.maker} {booking.car.name}</p>
                  <p className="text-sm text-gray-600">Car ID: {booking.carId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">License Plate</p>
                  <p className="font-medium font-mono">{booking.car.carnumber}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-medium">{booking.car.year}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Color</p>
                  <p className="font-medium">{booking.car.color}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{booking.car.type}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-medium">{booking.car.transmission}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fuel</p>
                  <p className="font-medium">{booking.car.fuel}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Seats</p>
                  <p className="font-medium">{booking.car.seats}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Daily Rate</p>
                  <p className="font-medium">{formatCurrency(booking.car.price)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{booking.startDate ? formatDateTime(booking.startDate.toString()) : 'No start date'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{booking.endDate ? formatDateTime(booking.endDate.toString()) : 'No end date'}</p>  
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{calculateDuration(booking.startDate.toString(), booking.endDate.toString())} days</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Base Price</p>
                <p className="font-medium">{formatCurrency(booking.price)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Insurance Price</p>
                <p className="font-medium">{formatCurrency(booking.insurancePrice)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Payment Status</p>
                <Badge className={getPaymentBadgeColor(booking.paymentStatus)}>
                  {booking.paymentStatus}
                </Badge>
              </div>
              {booking.paymentReferenceId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Payment Reference</p>
                  <p className="font-medium font-mono text-sm">{booking.paymentReferenceId}</p>
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Booking Status</p>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusBadgeColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  
                </div>
              </div>
              {booking.tool && booking.tool.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tools Included</p>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {booking.tool.map((tool, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <img 
                          src={tool.imageUrl} 
                          alt={tool.name}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span className="text-sm font-medium">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {booking.extensionPrice && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Extension Price</p>
                  <p className="font-medium">{formatCurrency(booking.extensionPrice)}</p>
                </div>
              )}
              {booking.extentiontill && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Extended Till</p>
                  <p className="font-medium">{formatDateTime(booking.extentiontill.toString())}</p>
                </div>
              )}
              {booking.extentiontime && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Extension Time</p>
                  <p className="font-medium">{booking.extentiontime}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Information */}
      {(booking.pickupParking || booking.dropoffParking) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {booking.pickupParking && (
                <div>
                  <h4 className="font-medium mb-3">Pickup Location</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Parking Name</p>
                      <p className="font-medium">{booking.pickupParking.name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        {booking.pickupParking.locality}, {booking.pickupParking.city}, {booking.pickupParking.state}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Pincode</p>
                      <p className="font-medium">{booking.pickupParking.pincode}</p>
                    </div>
                  </div>
                </div>
              )}
              {booking.dropoffParking && (
                <div>
                  <h4 className="font-medium mb-3">Dropoff Location</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Parking Name</p>
                      <p className="font-medium">{booking.dropoffParking.name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        {booking.dropoffParking.locality}, {booking.dropoffParking.city}, {booking.dropoffParking.state}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Pincode</p>
                      <p className="font-medium">{booking.dropoffParking.pincode}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Extension Information */}
      {(booking.extensionPrice || booking.extentiontill || booking.extentiontime) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Trip Extension Details
            </CardTitle>
            <CardDescription>
              Information about any trip extensions or modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {booking.extensionPrice && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Extension Price</p>
                  <p className="text-lg font-bold text-blue-800">{formatCurrency(booking.extensionPrice)}</p>
                  <p className="text-xs text-blue-600 mt-1">Additional cost for extension</p>
                </div>
              )}
              {booking.extentiontill && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Extended Till</p>
                  <p className="text-lg font-bold text-green-800">{formatDateTime(booking.extentiontill.toString())}</p>
                  <p className="text-xs text-green-600 mt-1">New end date after extension</p>
                </div>
              )}
              {booking.extentiontime && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium">Extension Time</p>
                  <p className="text-lg font-bold text-purple-800">{booking.extentiontime}</p>
                  <p className="text-xs text-purple-600 mt-1">Extension duration or notes</p>
                </div>
              )}
            </div>
            
            {/* Extension Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Extension Summary</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Original End Date:</span> {booking.endDate ? formatDateTime(booking.endDate.toString()) : 'Not specified'}</p>
                {booking.extentiontill && (
                  <p><span className="font-medium">Extended End Date:</span> {formatDateTime(booking.extentiontill.toString())}</p>
                )}
                <p><span className="font-medium">Original Total:</span> {formatCurrency(booking.totalPrice)}</p>
                {booking.extensionPrice && (
                  <p><span className="font-medium">Extension Cost:</span> {formatCurrency(booking.extensionPrice)}</p>
                )}
                {booking.extensionPrice && (
                  <p><span className="font-medium">New Total:</span> {formatCurrency(booking.totalPrice + booking.extensionPrice)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Starting Images */}
      {booking.tripStartingCarImages && booking.tripStartingCarImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Trip Starting Car Images
            </CardTitle>
            <CardDescription>
              Images taken at the start of the trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {booking.tripStartingCarImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Trip starting image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-medium">{booking.createdAt ? formatDateTime(booking.createdAt.toString()) : 'Unknown date'}</p>
            </div>
            {booking.updatedAt && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Updated At</p>
                <p className="font-medium">{formatDateTime(booking.updatedAt.toString())}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 