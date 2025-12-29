'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

import { 
  getParkingSpots, 
  ParkingSpot, 
  getParkingSpotById,
  getParkingStats,
  searchParkingSpots,
  getParkingAnalytics,
  getManagerPerformance,
  ParkingStats,
  SearchParams,
  SearchResult,
  AnalyticsData,
  ManagerPerformance
} from './api'
import { 
  getVendors, 
  deleteVendor, 
  VendorFormData,
  getVendorsAdmin,
  deleteVendorAdmin,
  getCarsByVendorId,
  getCarsByVendor
} from '../vendors/api'
import {
  MapPin,
  Car,
  Plus,
  Settings,
  Activity,
  Search,
  TrendingUp,
  Users,
  BarChart3,
  Filter,
  RefreshCw,
  Calendar,
  TrendingDown,
  User,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ParkingPage() {
  const router = useRouter()
  
  // State management
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([])
  const [parkingData, setParkingData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ParkingStats | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [managers, setManagers] = useState<ManagerPerformance[]>([])
  const [allParkingSpots, setAllParkingSpots] = useState<ParkingSpot[]>([])
  
  // Vendor management state
  const [vendors, setVendors] = useState<VendorFormData[]>([])
  const [vendorSearchTerm, setVendorSearchTerm] = useState('')
  const [selectedVendorForDelete, setSelectedVendorForDelete] = useState<VendorFormData | null>(null)
  const [vendorCarsToDelete, setVendorCarsToDelete] = useState<any[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [vendorSearchLoading, setVendorSearchLoading] = useState(false)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedCapacity, setSelectedCapacity] = useState('all')
  const [hasManagerFilter, setHasManagerFilter] = useState<string>('all')
  const [analyticsPeriod, setAnalyticsPeriod] = useState('monthly')
  const [selectedSpotForAnalytics, setSelectedSpotForAnalytics] = useState('')
  
  // Loading states
  const [searchLoading, setSearchLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        // Fetch all data in parallel
        const [spotsData, statsData, managersData, vendorsData] = await Promise.all([
          getParkingSpots(),
          getParkingStats(),
          getManagerPerformance(),
          getVendorsAdmin()
        ])

        if (spotsData) {
          setParkingSpots(spotsData)
          setAllParkingSpots(spotsData)
          
          // Fetch detailed data for each parking spot
          const detailedData = await Promise.all(
            spotsData.map(async (spot) => {
              if (spot.id) {
                const detailedSpot = await getParkingSpotById(spot.id)
                return detailedSpot
              }
              return null
            })
          )
          setParkingData(detailedData.filter(data => data !== null))
        }

        if (statsData) {
          setStats(statsData)
        }

        if (managersData) {
          setManagers(managersData)
        }

        if (vendorsData) {
          setVendors(vendorsData)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Load all parking spots by default
  useEffect(() => {
    if (allParkingSpots.length > 0) {
      setSearchResults({
        parkingSpots: allParkingSpots,
        total: allParkingSpots.length,
        page: 1,
        limit: allParkingSpots.length
      })
    }
  }, [allParkingSpots])

  // Handle search
  const handleSearch = async () => {
    setSearchLoading(true)
    const searchParams: SearchParams = {
      search: searchTerm || undefined,
      city: selectedCity && selectedCity !== 'all' ? selectedCity : undefined,
      capacity: selectedCapacity && selectedCapacity !== 'all' ? parseInt(selectedCapacity) : undefined,
      hasManager: hasManagerFilter === 'true' ? true : hasManagerFilter === 'false' ? false : undefined,
      page: 1,
      limit: 50
    }

    try {
      const results = await searchParkingSpots(searchParams)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching parking spots:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Load analytics for selected spot
  const loadAnalytics = async (spotId: string) => {
    try {
      const analyticsData = await getParkingAnalytics(analyticsPeriod, parseInt(spotId))
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }


  const getSpotStats = (spotId: string) => {
    const spotData = parkingData.find(data => data?.parking?.id?.toString() === spotId)
    const cars = spotData?.cars || []

    return {
      totalCars: cars.length,
      availableCars: cars.filter((car: any) => car.isavailable).length,
      bookedCars: cars.filter((car: any) => !car.isavailable && !car.inmaintainance).length,
      maintenanceCars: cars.filter((car: any) => car.inmaintainance).length,
    }
  }

  const handleParkingClick = (spotId: string) => {
    router.push(`/dashboard/parking/${spotId}`)
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600'
    if (utilization >= 60) return 'text-orange-600'
    return 'text-green-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const formatParkingSpot = (parkingSpot: string | {id: number; name: string; locality: string; city: string; capacity: number}) => {
    if (typeof parkingSpot === 'object' && parkingSpot) {
      return `${parkingSpot.name || 'Unknown'} - ${parkingSpot.locality || 'Unknown'}`
    }
    return parkingSpot || 'Not Assigned'
  }

  // Vendor management functions
  const handleDeleteVendor = async (vendor: VendorFormData) => {
    setSelectedVendorForDelete(vendor)
    
    // Fetch cars that will be affected by vendor deletion
    try {
      const carsResponse = await getCarsByVendor(vendor.id!)
      setVendorCarsToDelete(carsResponse || [])
      setIsDeleteDialogOpen(true)
    } catch (error) {
      console.error('Error fetching vendor cars:', error)
      toast.error('Failed to fetch vendor cars')
      setVendorCarsToDelete([])
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDeleteVendor = async () => {
    if (!selectedVendorForDelete) return

    try {
      setVendorsLoading(true)
      const success = await deleteVendorAdmin(selectedVendorForDelete.id!)
      if (success) {
        setVendors(prev => prev.filter(v => v.id !== selectedVendorForDelete.id))
        toast.success('Vendor deleted successfully!')
        setIsDeleteDialogOpen(false)
        setSelectedVendorForDelete(null)
        setVendorCarsToDelete([])
      } else {
        toast.error('Failed to delete vendor')
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error('Failed to delete vendor')
    } finally {
      setVendorsLoading(false)
    }
  }

  // Vendor search function
  const handleVendorSearch = async () => {
    if (!vendorSearchTerm.trim()) {
      // If search is empty, fetch all vendors
      try {
        setVendorSearchLoading(true)
        const vendorsData = await getVendorsAdmin()
        if (vendorsData) {
          setVendors(vendorsData)
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
      } finally {
        setVendorSearchLoading(false)
      }
      return
    }

    try {
      setVendorSearchLoading(true)
      const vendorsData = await getVendorsAdmin({ 
        search: vendorSearchTerm,
        limit: 50 
      })
      if (vendorsData) {
        setVendors(vendorsData)
      }
    } catch (error) {
      console.error('Error searching vendors:', error)
    } finally {
      setVendorSearchLoading(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleVendorSearch()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [vendorSearchTerm])

  const filteredVendors = vendors // No need for client-side filtering since we're using server-side search

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // For overview tab, always show parking spots
  // For search tab, show search results if available, otherwise show all spots
  const displaySpots = parkingSpots || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parking Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive parking analytics and management dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        <Button onClick={() => router.push('/dashboard/parking/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Parking Spot
        </Button> 
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Total Spots</p>
                  <p className="text-2xl font-bold">{stats.totalSpots}</p>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-xs text-gray-500">
                      {stats.spotsWithManagers} with managers
                    </span>
                  </div>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold">{stats.totalCapacity}</p>
                  <div className="flex items-center mt-1">
                    <Car className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-gray-500">
                      {stats.totalCars} cars
                    </span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <p className="text-2xl font-bold">{stats.utilizationRate.toFixed(1)}%</p>
                  <Progress value={stats.utilizationRate} className="mt-2" />
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Cars</p>
                  <p className="text-2xl font-bold text-green-600">{stats.availableCars}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {stats.bookedCars} booked, {stats.maintenanceCars} maintenance
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search & Filter</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="managers">Manager Performance</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <div className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
              ))}
            </div>
          ) : displaySpots.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Parking Spots Found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first parking spot.</p>
              <Button onClick={() => router.push('/dashboard/parking/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Parking Spot
              </Button>
      </div>
          ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displaySpots.map((spot: ParkingSpot) => {
              const spotStats = getSpotStats(spot.id?.toString() ?? '')
              const utilization = spot.capacity > 0 ? (spotStats.totalCars / spot.capacity) * 100 : 0

          return (
            <Card
              key={spot.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleParkingClick(spot.id?.toString() ?? '')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {spot.name}
                    </CardTitle>
                        <CardDescription>{spot.locality}, {spot.city}</CardDescription>
                  </div>
                      <Badge variant="secondary">
                        {utilization.toFixed(1)}% utilized
                      </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                    {/* Capacity Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Capacity Utilization</span>
                        <span>{spotStats.totalCars}/{spot.capacity}</span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                    </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Car className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-medium">{spotStats.availableCars}</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                        <p className="text-sm font-medium">{spotStats.bookedCars}</p>
                    <p className="text-xs text-gray-600">Booked</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <Settings className="h-5 w-5 text-red-600 mx-auto mb-1" />
                        <p className="text-sm font-medium">{spotStats.maintenanceCars}</p>
                        <p className="text-xs text-gray-600">Maintenance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            </div>
          )}
        </TabsContent>

        {/* Search & Filter Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Parking Spots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Search Term</label>
                  <Input
                    placeholder="Search by name or locality..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Min Capacity</label>
                  <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Capacity</SelectItem>
                      <SelectItem value="10">10+ cars</SelectItem>
                      <SelectItem value="25">25+ cars</SelectItem>
                      <SelectItem value="50">50+ cars</SelectItem>
                      <SelectItem value="100">100+ cars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Has Manager</label>
                  <Select value={hasManagerFilter} onValueChange={setHasManagerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Manager status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="true">Has Manager</SelectItem>
                      <SelectItem value="false">No Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSearch} className="w-full" disabled={searchLoading}>
                <Search className="h-4 w-4 mr-2" />
                {searchLoading ? 'Searching...' : 'Search Parking Spots'}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {(searchResults || parkingSpots.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({searchResults?.total || parkingSpots.length} found)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Cars</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(searchResults?.parkingSpots || parkingSpots).map((spot) => {
                      const spotStats = getSpotStats(spot.id?.toString() ?? '')
                      const utilization = spot.capacity > 0 ? (spotStats.totalCars / spot.capacity) * 100 : 0

                      return (
                        <TableRow key={spot.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="font-medium">{spot.name}</TableCell>
                          <TableCell>{spot.locality}</TableCell>
                          <TableCell>{spot.city}</TableCell>
                          <TableCell>{spot.capacity}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">Total: {spotStats.totalCars}</span>
                              <span className="text-xs text-gray-500">
                                Available: {spotStats.availableCars} | Booked: {spotStats.bookedCars}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={getUtilizationColor(utilization)}>
                                {utilization.toFixed(1)}%
                              </span>
                              <Progress value={utilization} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleParkingClick(spot.id?.toString() ?? '')}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Parking Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Parking Spot</label>
                  <Select value={selectedSpotForAnalytics} onValueChange={setSelectedSpotForAnalytics}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a parking spot" />
                    </SelectTrigger>
                    <SelectContent>
                      {allParkingSpots.map((spot) => (
                        <SelectItem key={spot.id} value={spot.id?.toString() ?? ''}>
                          {spot.name} - {spot.locality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={() => loadAnalytics(selectedSpotForAnalytics)}
                disabled={!selectedSpotForAnalytics}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Load Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Results */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>{analytics.spotName} - Analytics</CardTitle>
                <CardDescription>
                  Average: {analytics.averageUtilization.toFixed(1)}% | 
                  Peak: {analytics.peakUtilization.toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{analytics.averageUtilization.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Average Utilization</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{analytics.peakUtilization.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Peak Utilization</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Utilization History</h4>
                    <div className="max-h-64 overflow-y-auto">
                      {analytics.utilizationHistory.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{formatDate(entry.date)}</p>
                            <p className="text-sm text-gray-600">
                              {entry.totalCars} total, {entry.availableCars} available
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${getUtilizationColor(entry.utilization)}`}>
                              {entry.utilization.toFixed(1)}%
                            </p>
                            <Progress value={entry.utilization} className="w-20 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manager Performance Tab */}
        <TabsContent value="managers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manager Performance
              </CardTitle>
              <CardDescription>
                Track performance metrics for parking managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>Parking Spot</TableHead>
                    <TableHead>Cars Managed</TableHead>
                    <TableHead>Utilization Rate</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">{manager.name}</TableCell>
                      <TableCell>{formatParkingSpot(manager.parkingSpot)}</TableCell>
                      <TableCell>{manager.carsManaged}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={getUtilizationColor(manager.utilizationRate)}>
                            {manager.utilizationRate.toFixed(1)}%
                          </span>
                          <Progress value={manager.utilizationRate} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{formatLastActivity(manager.lastActivity)}</TableCell>
                      <TableCell>
                        <Badge variant={manager.utilizationRate >= 80 ? "default" : "secondary"}>
                          {manager.utilizationRate >= 80 ? "High Performance" : "Normal"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Management Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Vendor Management
                  </CardTitle>
                  <CardDescription>
                    Manage vendors and their associated cars
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/dashboard/vendors/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search vendors by name, email, or ID..."
                    value={vendorSearchTerm}
                    onChange={(e) => setVendorSearchTerm(e.target.value)}
                  />
                  {vendorSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setVendorSearchTerm('')
                    handleVendorSearch()
                  }}
                  disabled={vendorSearchLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
      </div>

              {/* Vendors Table */}
              {vendorSearchLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {vendor.avatar ? (
                              <img 
                                src={vendor.avatar} 
                                alt={vendor.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            <p className="text-sm text-gray-500">ID: {vendor.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{vendor.email}</p>
                          <p className="text-sm text-gray-500">{vendor.number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{vendor.locality}, {vendor.city}</p>
                          <p className="text-sm text-gray-500">{vendor.state}, {vendor.country}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vendor.isverified ? "default" : "secondary"}>
                          {vendor.isverified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/vendors/edit/${vendor.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVendor(vendor)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!vendorSearchLoading && filteredVendors.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vendors Found</h3>
                  <p className="text-gray-600 mb-4">
                    {vendorSearchTerm ? 'No vendors match your search criteria.' : 'Get started by adding your first vendor.'}
                  </p>
                  {!vendorSearchTerm && (
                    <Button onClick={() => router.push('/dashboard/vendors/add')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendorForDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Vendor to be deleted:</h4>
                <p className="text-red-800">
                  <strong>{selectedVendorForDelete.name}</strong> ({selectedVendorForDelete.email})
                </p>
              </div>

              {vendorCarsToDelete.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">
                    The following cars will also be deleted:
                  </h4>
                   <div className="max-h-32 overflow-y-auto">
                     {vendorCarsToDelete.map((car, index) => (
                       <div key={index} className="text-sm text-orange-800 py-1">
                         • {car.name} ({car.maker} {car.year}) - {car.carnumber} - ₹{car.price}
                       </div>
                     ))}
                   </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={vendorsLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteVendor}
                  disabled={vendorsLoading}
                >
                  {vendorsLoading ? 'Deleting...' : 'Delete Vendor'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
