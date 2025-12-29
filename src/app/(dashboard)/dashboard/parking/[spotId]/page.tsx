'use client'

import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

import {
  MapPin,
  Car,
  ArrowLeft,
  Navigation,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  Shield,
  Wrench,
  Edit,
  UserPlus,
  Trash2,
  Users
} from 'lucide-react'
import { getParkingSpotById, searchParkingInchargeByPhone, assignInchargeToParking, deleteParkingIncharge, deleteParkingSpot, getAdminUsers, assignUserRoles, User as UserType, UsersResponse, AssignRolesRequest } from '../api'
import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FancyMultiSelect } from '@/components/ui/fancy-multi-select'

// Define interfaces based on the API response
interface Car {
  id: number
  name: string
  maker: string
  year: number
  carnumber: string
  price: number
  discountedprice: number
  color: string
  transmission: string
  fuel: string
  type: string
  seats: number
  rcnumber: string
  rcimg: string
  pollutionimg: string
  insuranceimg: string
  inmaintainance: boolean
  isavailable: boolean
  images: string[] | null
  mainimg: string
  vendorid: number
  parkingid: number
  isapproved: boolean
  createdAt: string
  updatedAt: string
}

interface ParkingSpot {
  id: number
  name: string
  locality: string
  city: string | null
  state: string | null
  country: string | null
  pincode: number | null
  capacity: number
  mainimg: string
  images: string[]
  lat: number
  lng: number
  createdAt: string
  updatedAt: string
}

interface ParkingIncharge {
  id: number
  name: string | null
  email: string | null
  number: number
  role: string
  isverified: boolean
  avatar: string | null
  createdAt: string
  updatedAt: string
}

interface ParkingSpotResponse {
  parking: ParkingSpot
  parkingIncharge: ParkingIncharge[]
  cars: Car[]
  totalCars: number
  availableCars: number
  approvedCars: number
  inMaintenanceCars: number
}

// Car Card Component
function CarCard({ car }: { car: Car }) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-orange-100 text-orange-800',
    maintenance: 'bg-orange-100 text-orange-800',
    out_of_service: 'bg-red-100 text-red-800'
  }

  const getCarStatus = (car: Car) => {
    if (car.inmaintainance) return 'maintenance'
    if (car.isavailable) return 'available'
    return 'rented'
  }

  const status = getCarStatus(car)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">{car.maker} {car.name}</h4>
                <p className="text-sm text-gray-600">{car.year}</p>
                <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {car.carnumber}
                </p>
              </div>
              <Badge className={statusColors[status]}>
                {status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-600">License:</span> {car.carnumber}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Type:</span> {car.type}
              </p>
              <p className="text-sm font-medium">
                {formatCurrency(car.price)}/day
              </p>
              {car.discountedprice && car.discountedprice < car.price && (
                <p className="text-sm text-green-600">
                  <span className="text-gray-600">Discounted:</span> {formatCurrency(car.discountedprice)}/day
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Car Details - {car.maker} {car.name}</DialogTitle>
          <DialogDescription>
            Complete information and booking details
          </DialogDescription>
        </DialogHeader>
        <CarDetailsContent car={car} />
      </DialogContent>
    </Dialog>
  )
}

// Car Details Content Component
function CarDetailsContent({ car }: { car: Car }) {
  const getCarStatus = (car: Car) => {
    if (car.inmaintainance) return 'maintenance'
    if (car.isavailable) return 'available'
    return 'rented'
  }

  const status = getCarStatus(car)

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-orange-100 text-orange-800',
    maintenance: 'bg-orange-100 text-orange-800',
    out_of_service: 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Car Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{car.maker} {car.name}</h3>
          <p className="text-gray-600">{car.year}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={statusColors[status]}>
              {status}
            </Badge>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {car.carnumber}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(car.price)}</p>
          <p className="text-sm text-gray-600">per day</p>
          {car.discountedprice && car.discountedprice < car.price && (
            <p className="text-sm text-green-600">
              Discounted: {formatCurrency(car.discountedprice)}
            </p>
          )}
        </div>
      </div>

      {/* Car Details */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Vehicle Information
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Car Number</p>
              <p className="font-mono font-medium">{car.carnumber}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">RC Number</p>
              <p className="font-medium">{car.rcnumber}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Color</p>
              <p className="font-medium">{car.color}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Transmission</p>
              <p className="font-medium">{car.transmission}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Fuel Type</p>
              <p className="font-medium">{car.fuel}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Seats</p>
              <p className="font-medium">{car.seats}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Documents & Images
          </h4>
          <div className="space-y-3">
            {car.rcimg && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">RC Image</p>
                <img src={car.rcimg} alt="RC" className="w-full h-32 object-cover rounded" />
              </div>
            )}
            {car.pollutionimg && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Pollution Certificate</p>
                <img src={car.pollutionimg} alt="Pollution" className="w-full h-32 object-cover rounded" />
              </div>
            )}
            {car.insuranceimg && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Insurance</p>
                <img src={car.insuranceimg} alt="Insurance" className="w-full h-32 object-cover rounded" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Car Images */}
      {car.images && car.images.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Car Images
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {car.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Car ${idx + 1}`} className="w-full h-48 object-cover rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Main Image */}
      {car.mainimg && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Main Image
          </h4>
          <img src={car.mainimg} alt="Main" className="w-full max-w-md h-64 object-cover rounded" />
        </div>
      )}

      {/* Status Information */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Status Information
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">In Maintenance</p>
              <p className="font-medium">{car.inmaintainance ? 'Yes' : 'No'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Available</p>
              <p className="font-medium">{car.isavailable ? 'Yes' : 'No'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="font-medium">{car.isapproved ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Additional Info
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Vendor ID</p>
              <p className="font-medium">{car.vendorid}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Parking ID</p>
              <p className="font-medium">{car.parkingid}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">{formatDate(car.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'available' && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Available for Booking</h4>
          <p className="text-sm text-green-700">
            This car is currently available for rental at {formatCurrency(car.price)} per day.
          </p>
        </div>
      )}

      {status === 'maintenance' && (
        <div className="p-4 bg-orange-50 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2">Under Maintenance</h4>
          <p className="text-sm text-orange-700">
            This car is currently under maintenance.
          </p>
        </div>
      )}

      {status === 'rented' && (
        <div className="p-4 bg-orange-50 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2">Currently Rented</h4>
          <p className="text-sm text-orange-700">
            This car is currently rented out.
          </p>
        </div>
      )}
    </div>
  )
}

export default function ParkingSpotPage() {
  const router = useRouter()
  const params = useParams()
  const spotId = params.spotId as string

  const [parkingData, setParkingData] = useState<ParkingSpotResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchPhone, setSearchPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [assigning, setAssigning] = useState(false)
  
  // Bulk user assignment state
  const [users, setUsers] = useState<UserType[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkAssigning, setBulkAssigning] = useState(false)

  useEffect(() => {
    const fetchParkingSpot = async () => {
      setLoading(true)
      try {
        const response = await getParkingSpotById(parseInt(spotId))
        console.log(response)
        if (response) {
          setParkingData(response)
        }
      } catch (error) {
        console.error('Error fetching parking spot:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchParkingSpot()
  }, [spotId])

  // Fetch users for bulk assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAdminUsers({ limit: 100 })
        if (usersData) {
          setUsers(usersData.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  const handleSearchIncharge = async () => {
    if (!searchPhone.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    setSearching(true)
    setSearchResult(null)
    const number = {
      number: searchPhone
    }
    
    try {
      const result = await searchParkingInchargeByPhone(number)
      if (result) {
        console.log(result.data[0])
        setSearchResult(result.data[0])
        toast.success('Incharge found!')
      } else {
        toast.error('No incharge found with this phone number')
      }
    } catch (error) {
      console.error('Error searching incharge:', error)
      toast.error('Failed to search incharge')
    } finally {
      setSearching(false)
    }
  }

  const handleAssignIncharge = async (inchargeId: number) => {
    setAssigning(true)
    
    try {
      const result = await assignInchargeToParking(parseInt(spotId), inchargeId)
      if (result) {
        toast.success('Incharge assigned successfully!')
        router.refresh()
        // Refresh the parking data
        const response = await getParkingSpotById(parseInt(spotId))
        if (response) {
          setParkingData(response)
        }
        setSearchResult(null)
        setSearchPhone('')
      } else {
        toast.error('Failed to assign incharge')
      }
    } catch (error) {
      console.error('Error assigning incharge:', error)
      toast.error('Failed to assign incharge')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-medium">Loading parking spot details...</span>
        </div>
      </div>
    )
  }

  if (!parkingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Parking Spot Not Found</h1>
          <Button onClick={() => router.push('/dashboard/parking')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parking
          </Button>
        </div>
      </div>
    )
  }

  const { parking: spot, cars: carsAtSpot, totalCars, availableCars: availableCarsCount, approvedCars, inMaintenanceCars, parkingIncharge = [] } = parkingData
  const bookedCars = carsAtSpot.filter(car => !car.isavailable && !car.inmaintainance)
  const maintenanceCars = carsAtSpot.filter(car => car.inmaintainance)
  const handleDeleteIncharge = async (inchargeId: number) => {
    try {
      const result = await deleteParkingIncharge(inchargeId)
      if (result) {
        toast.success('Incharge deleted successfully!')
        router.refresh()
        // Refresh the parking data
        const response = await getParkingSpotById(parseInt(spotId))
        if (response) {
          setParkingData(response)
        }
      }
    } catch (error) {
      console.error('Error deleting incharge:', error)
      toast.error('Failed to delete incharge')
    }
  }

  // Handle bulk user assignment as parking managers
  const handleBulkAssignUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    setBulkAssigning(true)
    try {
      const request: AssignRolesRequest = {
        userIds: selectedUsers.map(id => parseInt(id)),
        role: 'parkingincharge'
      }
      
      const result = await assignUserRoles(request)
      if (result) {
        toast.success(`Successfully assigned ${selectedUsers.length} users as parking managers`)
        setSelectedUsers([])
        // Refresh the parking data to show updated managers
        const response = await getParkingSpotById(parseInt(spotId))
        if (response) {
          setParkingData(response)
        }
      }
    } catch (error) {
      console.error('Error assigning users:', error)
      toast.error('Failed to assign users as parking managers')
    } finally {
      setBulkAssigning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/parking')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{spot?.name}</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {spot?.locality}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/dashboard/parking/edit/${spotId}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Parking Spot
          </Button>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this parking spot? This action cannot be undone.')) {
                try {
                  const res = await deleteParkingSpot(parseInt(spotId))
                  if (res) {
                    toast.success('Parking spot deleted successfully!')
                    router.push('/dashboard/parking')
                  } else {
                    toast.error('Failed to delete parking spot')
                  }
                } catch (err) {
                  toast.error('Failed to delete parking spot')
                }
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Parking Spot Details */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Spot Details</CardTitle>
          <CardDescription>All details for this parking spot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><span className="font-semibold">Name:</span> {spot?.name}</div>
          <div><span className="font-semibold">Locality:</span> {spot?.locality}</div>
          <div><span className="font-semibold">City:</span> {spot?.city ?? "-"}</div>
          <div><span className="font-semibold">State:</span> {spot?.state ?? "-"}</div>
          <div><span className="font-semibold">Country:</span> {spot?.country ?? "-"}</div>
          <div><span className="font-semibold">Pincode:</span> {spot?.pincode ?? "-"}</div>
          <div><span className="font-semibold">Capacity:</span> {spot?.capacity}</div>
          <div><span className="font-semibold">Latitude:</span> {spot?.lat}</div>
          <div><span className="font-semibold">Longitude:</span> {spot?.lng}</div>
          <div><span className="font-semibold">Created At:</span> {spot?.createdAt}</div>
          <div><span className="font-semibold">Updated At:</span> {spot?.updatedAt}</div>
          <div>
            <span className="font-semibold">Main Image:</span>
            {spot?.mainimg && (
              <div className="mt-1">
                <a href={spot.mainimg} target="_blank" rel="noopener noreferrer">
                  <img src={spot.mainimg} alt="Main" className="w-32 h-24 object-cover rounded border" />
                </a>
              </div>
            )}
          </div>
          {spot?.images && spot.images.length > 0 && (
            <div>
              <span className="font-semibold">Images:</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {spot.images.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                    <img src={img} alt={`Parking ${idx + 1}`} className="w-24 h-16 object-cover rounded border" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cars</p>
                <p className="text-2xl font-bold">{totalCars}</p>
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
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold">{availableCarsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{approvedCars}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-orange-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-2xl font-bold">{bookedCars.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-red-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold">{inMaintenanceCars}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cars List */}
      <Card>
        <CardHeader>
          <CardTitle>Cars at {spot?.name}</CardTitle>
          <CardDescription>
            View and manage all cars at this parking location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Cars ({carsAtSpot.length})</TabsTrigger>
              <TabsTrigger value="available">Available ({availableCarsCount})</TabsTrigger>
              <TabsTrigger value="rented">Booked ({bookedCars.length})</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance ({maintenanceCars.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carsAtSpot.map((car: Car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="available" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carsAtSpot.filter(car => car.isavailable).map((car: Car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rented" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookedCars.map((car: Car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maintenanceCars.map((car: Car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Parking Incharge Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Parking Incharge Details</CardTitle>
              <CardDescription>
                Manage parking managers and staff assigned to this location
              </CardDescription>
            </div>
            <Button 
              onClick={() => router.push(`/dashboard/parking/add-manager/${spotId}`)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Manager
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Existing Incharge Section */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Search & Add Existing Incharge
            </h4>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="searchPhone">Phone Number</Label>
                  <Input
                    id="searchPhone"
                    type="tel"
                    placeholder="Enter phone number to search"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchIncharge()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearchIncharge}
                    disabled={searching || !searchPhone.trim()}
                    className="flex items-center gap-2"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              {/* Search Result */}
              {searchResult && (
                <div className="p-4 border rounded-lg bg-white">
                  <h5 className="font-medium mb-3">Found Incharge:</h5>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={searchResult.avatar || ''} alt={searchResult.name || 'Incharge'} />
                        <AvatarFallback>
                          {searchResult.name ? searchResult.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'I'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{searchResult.name || 'Unnamed Incharge'}</p>
                        <p className="text-sm text-gray-600">Phone: {searchResult.number}</p>
                        <p className="text-sm text-gray-600">Email: {searchResult.email || 'No email'}</p>
                        <p className="text-sm text-gray-600">Role: {searchResult.role}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAssignIncharge(searchResult.id)}
                      disabled={assigning}
                      className="flex items-center gap-2"
                    >
                      {assigning ? 'Assigning...' : 'Assign to Parking'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bulk User Assignment Section */}
          <div className="mb-6 p-4 border rounded-lg bg-blue-50">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Assign Users as Parking Managers
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulkUsers">Select Users to Assign</Label>
                <FancyMultiSelect
                  options={users.map(user => ({
                    value: user.id.toString(),
                    label: `${user.name} (${user.email}) - Current: ${user.role}`
                  }))}
                  placeholder="Search and select users to assign as parking managers..."
                  onChange={setSelectedUsers}
                />
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                <div className="flex-1">
                  <p className="text-sm font-medium">Selected Users: {selectedUsers.length}</p>
                  <p className="text-xs text-gray-600">Role: Parking In Charge (PIC)</p>
                </div>
                <Button 
                  onClick={handleBulkAssignUsers}
                  disabled={bulkAssigning || selectedUsers.length === 0}
                  className="min-w-[120px]"
                >
                  {bulkAssigning ? 'Assigning...' : 'Assign as Managers'}
                </Button>
              </div>
            </div>
          </div>

          {parkingIncharge.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Parking Managers Assigned</h3>
              <p className="text-gray-600 mb-4">
                This parking spot doesn't have any managers assigned yet.
              </p>
              <Button 
                onClick={() => router.push(`/dashboard/parking/add-manager/${spotId}`)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add First Manager
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parkingIncharge.map((incharge: ParkingIncharge) => (
                  <TableRow key={incharge.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={incharge.avatar || ''} alt={incharge.name || 'Manager'} />
                          <AvatarFallback>
                            {incharge.name ? incharge.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{incharge.name || 'Unnamed Manager'}</p>
                          <p className="text-sm text-gray-600">ID: {incharge.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-500" />
                          {incharge.email || 'No email'}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-500" />
                          {incharge.number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{incharge.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={incharge.isverified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {incharge.isverified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(incharge.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/parking/edit-manager/${spotId}/${incharge.id}`)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteIncharge(incharge.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
