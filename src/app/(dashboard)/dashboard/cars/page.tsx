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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Car as CarIcon, Plus, Search, MapPin, Eye, FileText, Shield, Wrench, User, Edit, Trash2, Upload, Building2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCar, fetchCars, fetchCarStats, updateCarStatus, filterCarsByBookings, Car, Vendor, Parking } from './api'
import { useRef } from 'react'
import { Switch } from '@/components/ui/switch'


const statusColors = {
  available: 'bg-green-100 text-green-800',
  rented: 'bg-orange-100 text-orange-800',
  maintenance: 'bg-orange-100 text-orange-800',
  out_of_service: 'bg-red-100 text-red-800',
  unavailable: 'bg-red-100 text-red-800'
}

export default function CarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)

  // Date range state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bookingFilterLoading, setBookingFilterLoading] = useState(false)
  const [showPopularOnly, setShowPopularOnly] = useState(false)

  // Advanced filters
  const [makerFilter, setMakerFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [fuelFilter, setFuelFilter] = useState('all')
  const [transmissionFilter, setTransmissionFilter] = useState('all')

  // Car statistics state
  const [carStats, setCarStats] = useState({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    outOfService: 0
  })

  // Fetch cars and statistics on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load cars with current filters
        const carsResult = await fetchCars({
          search: searchTerm,
          status: statusFilter,
          popularOnly: showPopularOnly,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          maker: makerFilter !== 'all' ? makerFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          fuel: fuelFilter !== 'all' ? fuelFilter : undefined,
          transmission: transmissionFilter !== 'all' ? transmissionFilter : undefined
        })

        if (carsResult.success && carsResult.data) {
          setCars(carsResult.data)
        } else {
          toast.error(carsResult.message || 'Failed to fetch cars')
        }

        // Load car statistics
        const statsResult = await fetchCarStats()
        if (statsResult.success && statsResult.data) {
          setCarStats(statsResult.data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    if (!loading) {
      const loadFilteredCars = async () => {
        try {
          setLoading(true)
          const result = await fetchCars({
            search: searchTerm,
            status: statusFilter,
            popularOnly: showPopularOnly,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            maker: makerFilter !== 'all' ? makerFilter : undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            fuel: fuelFilter !== 'all' ? fuelFilter : undefined,
            transmission: transmissionFilter !== 'all' ? transmissionFilter : undefined
          })

          if (result.success && result.data) {
            setCars(result.data)
          }
        } catch (error) {
          console.error('Error loading filtered cars:', error)
        } finally {
          setLoading(false)
        }
      }
      loadFilteredCars()
    }
  }, [searchTerm, statusFilter, showPopularOnly, startDate, endDate, makerFilter, typeFilter, fuelFilter, transmissionFilter])

  // Since the API now handles filtering, we can use cars directly
  const filteredCars = Array.isArray(cars) ? cars : []

  // Date range filter handler
  const handleDateRangeFilter = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end date')
      return
    }
    setBookingFilterLoading(true)
    try {
      const result = await filterCarsByBookings(
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString()
      )
      if (result.success && result.data) {
        setCars(result.data)
        toast.success('Filtered by booking date range!')
      } else {
        setCars([])
        toast.error(result.message || 'No cars found for selected range')
      }
    } catch (error) {
      setCars([])
      toast.error('Failed to filter by booking date range')
    } finally {
      setBookingFilterLoading(false)
    }
  }

  const handleStatusChange = async (carId: number, newStatus: string) => {
    try {
      const result = await updateCarStatus(carId, newStatus as any)
      if (result.success) {
        // Update local state
        const carsArray = Array.isArray(cars) ? cars : []
        setCars(carsArray.map(car =>
          car.id === carId ? {
            ...car,
            isavailable: newStatus === 'available',
            inmaintainance: newStatus === 'maintenance'
          } : car
        ))
        toast.success('Car status updated!')
      } else {
        toast.error(result.message || 'Failed to update car status')
      }
    } catch (error) {
      toast.error('Failed to update car status')
    }
  }

  const handleDeleteCar = async (carId: number) => {
    setLoading(true)
    const result = await deleteCar(carId)
    if (result.success) {
      toast.success('Car deleted successfully!')
      const carsArray = Array.isArray(cars) ? cars : []
      setCars(carsArray.filter(car => car.id !== carId))
      setLoading(false)
    } else {
      toast.error(result.message || 'Failed to delete car')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cars Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your fleet of rental cars
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/cars/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Car
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CarIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cars</p>
                <p className="text-2xl font-bold">{carStats.total}</p>
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
                <p className="text-2xl font-bold">{carStats.available}</p>
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
                <p className="text-sm font-medium text-gray-600">Rented</p>
                <p className="text-2xl font-bold">{carStats.rented}</p>
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
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold">{carStats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Cars List</CardTitle>
          <CardDescription>Manage and monitor your car fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by make, model, license plate, unique ID, or owner..."
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Booked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 ml-4">
                <Switch id="popular-toggle" checked={showPopularOnly} onCheckedChange={setShowPopularOnly} />
                <Label htmlFor="popular-toggle" className="text-sm">Show only popular cars</Label>
              </div>
            </div>
            {/* Date Range Selector */}
            <div className="flex gap-4 items-center">
              <Label className="text-sm">Start Date</Label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="max-w-xs"
              />
              <Label className="text-sm">End Date</Label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={handleDateRangeFilter}
                disabled={bookingFilterLoading}
                className="ml-2"
              >
                {bookingFilterLoading ? 'Filtering...' : 'Filter by Booking Date'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  // Reload cars without date filter
                  const loadCars = async () => {
                    try {
                      setLoading(true)
                      const result = await fetchCars({
                        search: searchTerm,
                        status: statusFilter,
                        popularOnly: showPopularOnly
                      })
                      if (result.success && result.data) {
                        setCars(result.data)
                      }
                    } catch (error) {
                      console.error('Error loading cars:', error)
                    } finally {
                      setLoading(false)
                    }
                  }
                  loadCars()
                }}
                className="ml-2"
                disabled={bookingFilterLoading}
              >
                Clear Date Filter
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Advanced Filters:</Label>
              </div>
              <Select value={makerFilter} onValueChange={setMakerFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Maker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makers</SelectItem>
                  <SelectItem value="Hyundai">Hyundai</SelectItem>
                  <SelectItem value="Mahindra">Mahindra</SelectItem>
                  <SelectItem value="Maruti">Maruti</SelectItem>
                  <SelectItem value="Tata">Tata</SelectItem>
                  <SelectItem value="Honda">Honda</SelectItem>
                  <SelectItem value="Toyota">Toyota</SelectItem>
                  <SelectItem value="BMW">BMW</SelectItem>
                  <SelectItem value="Mercedes">Mercedes</SelectItem>
                  <SelectItem value="Audi">Audi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="muv">MUV</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>

              <Select value={fuelFilter} onValueChange={setFuelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Fuel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuel Types</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transmissions</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setMakerFilter('all')
                  setTypeFilter('all')
                  setFuelFilter('all')
                  setTransmissionFilter('all')
                }}
                className="ml-2"
              >
                Clear Advanced Filters
              </Button>
            </div>
          </div>

          {/* Cars Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Car Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Parking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading cars...
                  </TableCell>
                </TableRow>
              ) : filteredCars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No cars found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{car.name}</p>
                        <p className="text-sm text-gray-600">{car.maker} • {car.year}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{car.carnumber}</TableCell>
                    <TableCell className="capitalize">{car.type}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[car.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatCurrency(car.price)}/day</p>
                      {car.discountedprice < car.price && (
                        <p className="text-sm text-green-600">{formatCurrency(car.discountedprice)} (discounted)</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {car.vendor ? (
                        <div className="flex items-center gap-2">
                          {car.vendor.avatar ? (
                            <img
                              src={car.vendor.avatar}
                              alt={car.vendor.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                              <Users className="h-3 w-3 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{car.vendor.name}</p>
                            <p className="text-xs text-gray-500">ID: {car.vendor.id}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No vendor data</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {car.parking ? (
                        <div className="flex items-center gap-2">
                          {car.parking.mainimg ? (
                            <img
                              src={car.parking.mainimg}
                              alt={car.parking.name}
                              className="w-6 h-6 rounded object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-green-200 rounded flex items-center justify-center">
                              <Building2 className="h-3 w-3 text-green-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{car.parking.name}</p>
                            <p className="text-xs text-gray-500">{car.parking.locality}, {car.parking.city}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not assigned</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCar(car)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="!max-w-5xl !w-[90vw] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Car Details</DialogTitle>
                              <DialogDescription>
                                Complete information for {car.name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCar && (
                              <div className="space-y-6">
                                {/* Car Header */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-xl font-semibold">{selectedCar.name}</h3>
                                    <p className="text-gray-600">{selectedCar.maker} • {selectedCar.year}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge className={statusColors[selectedCar.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                                        {selectedCar.status}
                                      </Badge>
                                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                        {selectedCar.carnumber}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold">{formatCurrency(selectedCar.price)}</p>
                                    <p className="text-sm text-gray-600">per day</p>
                                    {selectedCar.insurancePrice > 0 && (
                                      <p className="text-sm text-blue-600">{formatCurrency(selectedCar.insurancePrice)} (insurance)</p>
                                    )}
                                    {selectedCar.discountedprice < selectedCar.price && (
                                      <p className="text-sm text-green-600">{formatCurrency(selectedCar.discountedprice)} (discounted)</p>
                                    )}
                                  </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                  {/* Car Details */}
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Car Details
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Car Number</p>
                                        <p className="font-mono font-medium">{selectedCar.carnumber}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">RC Number</p>
                                        <p className="font-medium">{selectedCar.rcnumber}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Color</p>
                                        <p className="font-medium">{selectedCar.color}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Specifications */}
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <Shield className="h-4 w-4" />
                                      Specifications
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Transmission</p>
                                        <p className="font-medium">{selectedCar.transmission}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Fuel Type</p>
                                        <p className="font-medium">{selectedCar.fuel}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Seats</p>
                                        <p className="font-medium">{selectedCar.seats}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Pricing Information */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Pricing Information
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Daily Rate</p>
                                      <p className="font-medium">{formatCurrency(selectedCar.price)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Insurance Price</p>
                                      <p className="font-medium">{formatCurrency(selectedCar.insurancePrice)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Discounted Price</p>
                                      <p className="font-medium">{selectedCar.discountedprice < selectedCar.price ? formatCurrency(selectedCar.discountedprice) : 'No discount'}</p>

                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Fine per hour</p>
                                      <p className="font-medium">{selectedCar.fineperhour ? selectedCar.fineperhour : 0}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Extension per hour</p>
                                      <p className="font-medium">{selectedCar.extensionperhour ? selectedCar.extensionperhour : 0}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Status and Business Info */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <Wrench className="h-4 w-4" />
                                      Status & Business
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium">{selectedCar.status}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Approved</p>
                                        <p className="font-medium">{selectedCar.isapproved ? 'Yes' : 'No'}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Popular</p>
                                        <p className="font-medium">{selectedCar.ispopular ? 'Yes' : 'No'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      Business Information
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Car ID</p>
                                        <p className="font-medium">{selectedCar.id}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Vendor Information */}
                                {selectedCar.vendor && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      Vendor Information
                                    </h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <div className="flex items-center gap-4">
                                        {selectedCar.vendor.avatar ? (
                                          <img
                                            src={selectedCar.vendor.avatar}
                                            alt={selectedCar.vendor.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                                            <Users className="h-8 w-8 text-blue-600" />
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <h5 className="text-lg font-semibold text-gray-900">{selectedCar.vendor.name}</h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                            <div>
                                              <p className="text-sm text-gray-600">Email</p>
                                              <p className="font-medium text-blue-600">{selectedCar.vendor.email}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm text-gray-600">Phone</p>
                                              <p className="font-medium">{selectedCar.vendor.number}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm text-gray-600">Vendor ID</p>
                                              <p className="font-medium">{selectedCar.vendor.id}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Parking Information */}
                                {selectedCar.parking && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <Building2 className="h-4 w-4" />
                                      Parking Location
                                    </h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                      <div className="flex items-center gap-4">
                                        {selectedCar.parking.mainimg ? (
                                          <img
                                            src={selectedCar.parking.mainimg}
                                            alt={selectedCar.parking.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                          />
                                        ) : (
                                          <div className="w-16 h-16 bg-green-200 rounded-lg flex items-center justify-center">
                                            <Building2 className="h-8 w-8 text-green-600" />
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <h5 className="text-lg font-semibold text-gray-900">{selectedCar.parking.name}</h5>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                            <div>
                                              <p className="text-sm text-gray-600">Location</p>
                                              <p className="font-medium">{selectedCar.parking.locality}, {selectedCar.parking.city}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm text-gray-600">Capacity</p>
                                              <p className="font-medium">{selectedCar.parking.capacity} cars</p>
                                            </div>
                                            <div>
                                              <p className="text-sm text-gray-600">Parking ID</p>
                                              <p className="font-medium">{selectedCar.parking.id}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Document Images */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Documents
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedCar.rcimg && (
                                      <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-3 font-medium">RC Document</p>
                                        <div className="relative group">
                                          <img
                                            src={selectedCar.rcimg}
                                            alt="RC Document"
                                            className="w-full h-48 object-contain bg-gray-100 rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none'
                                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                              if (nextElement) {
                                                nextElement.style.display = 'flex'
                                              }
                                            }}
                                          />
                                          <div className="w-full h-48 bg-gray-200 rounded-lg border flex items-center justify-center hidden">
                                            <div className="text-center">
                                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                              <p className="text-gray-500">RC Document</p>
                                            </div>
                                          </div>
                                          <a
                                            href={selectedCar.rcimg}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-70 transition-opacity"
                                          >
                                            View Full
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                    {selectedCar.pollutionimg && (
                                      <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-3 font-medium">Pollution Certificate</p>
                                        <div className="relative group">
                                          <img
                                            src={selectedCar.pollutionimg}
                                            alt="Pollution Certificate"
                                            className="w-full h-48 object-contain bg-gray-100 rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none'
                                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                              if (nextElement) {
                                                nextElement.style.display = 'flex'
                                              }
                                            }}
                                          />
                                          <div className="w-full h-48 bg-gray-200 rounded-lg border flex items-center justify-center hidden">
                                            <div className="text-center">
                                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                              <p className="text-gray-500">Pollution Certificate</p>
                                            </div>
                                          </div>
                                          <a
                                            href={selectedCar.pollutionimg}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-70 transition-opacity"
                                          >
                                            View Full
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                    {selectedCar.insuranceimg && (
                                      <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-3 font-medium">Insurance Document</p>
                                        <div className="relative group">
                                          <img
                                            src={selectedCar.insuranceimg}
                                            alt="Insurance Document"
                                            className="w-full h-48 object-contain bg-gray-100 rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none'
                                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                              if (nextElement) {
                                                nextElement.style.display = 'flex'
                                              }
                                            }}
                                          />
                                          <div className="w-full h-48 bg-gray-200 rounded-lg border flex items-center justify-center hidden">
                                            <div className="text-center">
                                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                              <p className="text-gray-500">Insurance Document</p>
                                            </div>
                                          </div>
                                          <a
                                            href={selectedCar.insuranceimg}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-70 transition-opacity"
                                          >
                                            View Full
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Car Images */}
                                {(selectedCar.mainimg || (selectedCar.images && selectedCar.images.length > 0)) && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <Upload className="h-4 w-4" />
                                      Car Images
                                    </h4>
                                    <div className="space-y-4">
                                      {selectedCar.mainimg && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600 mb-3 font-medium">Main Image</p>
                                          <div className="relative group">
                                            <img
                                              src={selectedCar.mainimg}
                                              alt="Main car image"
                                              className="w-full h-80 object-contain bg-gray-100 rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                                if (nextElement) {
                                                  nextElement.style.display = 'flex'
                                                }
                                              }}
                                            />
                                            <div className="w-full h-80 bg-gray-200 rounded-lg border flex items-center justify-center hidden">
                                              <div className="text-center">
                                                <CarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">Image not available</p>
                                              </div>
                                            </div>
                                            <a
                                              href={selectedCar.mainimg}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-70 transition-opacity"
                                            >
                                              View Full Size
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      {selectedCar.images && selectedCar.images.length > 0 && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600 mb-3 font-medium">Additional Images ({selectedCar.images.length})</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {selectedCar.images.map((image, index) => (
                                              <div key={index} className="relative group">
                                                <img
                                                  src={image}
                                                  alt={`Car image ${index + 1}`}
                                                  className="w-full h-48 object-contain bg-gray-100 rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                                                  onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                                    if (nextElement) {
                                                      nextElement.style.display = 'flex'
                                                    }
                                                  }}
                                                />
                                                <div className="w-full h-48 bg-gray-200 rounded-lg border flex items-center justify-center hidden">
                                                  <div className="text-center">
                                                    <CarIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                                    <p className="text-gray-500 text-sm">Image {index + 1}</p>
                                                  </div>
                                                </div>
                                                <a
                                                  href={image}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs hover:bg-opacity-70 transition-opacity"
                                                >
                                                  View Full
                                                </a>
                                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                                  Image {index + 1}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Timestamps */}
                                <div>
                                  <h4 className="font-medium mb-3">Timestamps</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Created At</p>
                                      <p className="font-medium">{formatDate(selectedCar.createdAt)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Updated At</p>
                                      <p className="font-medium">{formatDate(selectedCar.updatedAt)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/cars/edit/${car.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCar(car.id)}>
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
