'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  getVendorByIdAdmin, 
  getCarsByVendorId, 
  getCarsByVendor,
  VendorFormData 
} from '../api'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  CreditCard
} from 'lucide-react'

export default function VendorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string

  const [vendor, setVendor] = useState<VendorFormData | null>(null)
  const [vendorCars, setVendorCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [carsLoading, setCarsLoading] = useState(true)

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return

      try {
        setLoading(true)
        const [vendorData, carsData] = await Promise.all([
          getVendorByIdAdmin(parseInt(vendorId)),
          getCarsByVendor(parseInt(vendorId))
        ])

        if (vendorData) {
          setVendor(vendorData)
        }

        if (carsData) {
          console.log('Fetched cars for vendor:', carsData)
          setVendorCars(carsData)
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error)
      } finally {
        setLoading(false)
        setCarsLoading(false)
      }
    }

    fetchVendorData()
  }, [vendorId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor Not Found</h3>
        <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/dashboard/parking')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Parking Management
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/parking')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-600 mt-1">Vendor Details</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/dashboard/vendors/edit/${vendor.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                {vendor.avatar ? (
                  <img 
                    src={vendor.avatar} 
                    alt={vendor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{vendor.name}</h3>
                <Badge variant={vendor.isverified ? "default" : "secondary"}>
                  {vendor.isverified ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{vendor.number}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {vendor.locality}, {vendor.city}, {vendor.state}, {vendor.country}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Joined: {vendor.createdAt ? formatDate(vendor.createdAt.toString()) : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents & Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Aadhar Card</p>
                  <p className="text-sm text-gray-600">{vendor.aadharNumber}</p>
                </div>
                {vendor.aadharimg && (
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Driving License</p>
                  <p className="text-sm text-gray-600">{vendor.dlNumber}</p>
                </div>
                {vendor.dlimg && (
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Passport</p>
                  <p className="text-sm text-gray-600">{vendor.passportNumber}</p>
                </div>
                {vendor.passportimg && (
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Cars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vendor Cars ({vendorCars.length})
          </CardTitle>
          <CardDescription>
            Cars added by this vendor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : vendorCars.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Cars Found</h3>
              <p className="text-gray-600">This vendor hasn't added any cars yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>Maker & Year</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Parking Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {vendorCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {car.mainimg ? (
                            <img 
                              src={Array.isArray(car.mainimg) ? car.mainimg[0] : car.mainimg} 
                              alt={car.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Car className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{car.name}</p>
                          <p className="text-sm text-gray-500">ID: {car.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{car.maker}</p>
                        <p className="text-sm text-gray-500">{car.year}</p>
                      </div>
                    </TableCell>
                    <TableCell>{car.carnumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">₹{car.price}</p>
                        {car.discountedprice && car.discountedprice !== car.price && (
                          <p className="text-sm text-green-600">₹{car.discountedprice}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{car.parking?.name}</p>
                        <p className="text-sm text-gray-500">{car.parking?.locality}, {car.parking?.city}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={car.isavailable ? "default" : "secondary"}>
                          {car.isavailable ? "Available" : "Unavailable"}
                        </Badge>
                        {car.inmaintainance && (
                          <Badge variant="destructive" className="text-xs">
                            Maintenance
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/cars/edit/${car.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
