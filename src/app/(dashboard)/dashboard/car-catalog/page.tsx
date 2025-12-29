'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Car,
  Calendar,
  Fuel,
  Settings,
  Users,
  Loader2,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  getAllCarCatalog, 
  deleteCarCatalog, 
  getCarCategories,
  searchCarCatalog,
  getCarCatalogUsageStats,
  getCategoriesWithCounts,
  type CarCatalogItem,
  type CarCatalogFilters,
  type CarCatalogSearchFilters,
  type CarCatalogUsageStats,
  type CategoryWithCounts
} from './api'

export default function CarCatalogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [catalogItems, setCatalogItems] = useState<CarCatalogItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [categories, setCategories] = useState<CategoryWithCounts[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [useSearch, setUseSearch] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState<CarCatalogFilters>({
    page: 1,
    limit: 10,
    isActive: true
  })
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all')
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CarCatalogItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Usage stats modal
  const [usageStatsOpen, setUsageStatsOpen] = useState(false)
  const [usageStats, setUsageStats] = useState<CarCatalogUsageStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid']
  const transmissions = ['manual', 'automatic']

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCatalogItems()
    }, searchTerm.trim() ? 500 : 0) // Debounce search by 500ms

    return () => clearTimeout(timeoutId)
  }, [filters, searchTerm, useSearch])

  const loadCatalogItems = async () => {
    try {
      setLoading(true)
      
      // Use search API if there's a search term or if we're using search mode
      const searchFilters: CarCatalogSearchFilters = {
        ...filters,
        q: searchTerm.trim() || undefined
      }
      
      const response = useSearch || searchTerm.trim() 
        ? await searchCarCatalog(searchFilters)
        : await getAllCarCatalog(filters)
      
      // The API response structure: response.data.data contains the array
      const items = response.data?.data || []
      const total = response.data?.pagination?.totalItems || 0
      
      setCatalogItems(Array.isArray(items) ? items : [])
      setTotalItems(typeof total === 'string' ? parseInt(total) : total)
    } catch (error: any) {
      console.error('Error loading catalog items:', error)
      toast.error('Failed to load car catalog items')
      setCatalogItems([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await getCategoriesWithCounts()
      const categories = response.data?.categories || []
      setCategories(Array.isArray(categories) ? categories : [])
    } catch (error: any) {
      console.error('Error loading categories:', error)
      setCategories([])
    }
  }

  const handleSearch = () => {
    const newFilters: CarCatalogFilters = {
      page: 1,
      limit: itemsPerPage,
      isActive: showInactive ? undefined : true
    }

    if (searchTerm.trim()) {
      // Note: Backend doesn't have search by name, so we'll filter client-side
    }
    if (selectedCategory && selectedCategory !== 'all') newFilters.category = selectedCategory
    if (selectedFuelType && selectedFuelType !== 'all') newFilters.fuelType = selectedFuelType as any
    if (selectedTransmission && selectedTransmission !== 'all') newFilters.transmission = selectedTransmission as any

    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      setDeleting(true)
      await deleteCarCatalog(itemToDelete.id)
      toast.success('Car template deleted successfully')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      loadCatalogItems()
    } catch (error: any) {
      console.error('Error deleting catalog item:', error)
      toast.error(error.response?.data?.message || 'Failed to delete car template')
    } finally {
      setDeleting(false)
    }
  }

  const loadUsageStats = async (item: CarCatalogItem) => {
    try {
      setLoadingStats(true)
      const response = await getCarCatalogUsageStats(item.id)
      
      if (response.success && response.data) {
        setUsageStats(response.data)
        setUsageStatsOpen(true)
      } else {
        toast.error('No usage statistics available for this template')
      }
    } catch (error: any) {
      console.error('Error loading usage stats:', error)
      toast.error(error.response?.data?.message || 'Failed to load usage statistics')
    } finally {
      setLoadingStats(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setFilters(prev => ({ ...prev, page, limit: itemsPerPage }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedFuelType('all')
    setSelectedTransmission('all')
    setShowInactive(false)
    setFilters({ page: 1, limit: itemsPerPage, isActive: true })
    setCurrentPage(1)
  }

  // Use catalogItems directly since we're using backend search
  const filteredItems = catalogItems

  const totalPages = Math.ceil(totalItems / itemsPerPage)


  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Car Template
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this car template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {itemToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {itemToDelete.imageUrl ? (
                  <img
                    src={itemToDelete.imageUrl}
                    alt={itemToDelete.carName}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Car className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{itemToDelete.carName}</div>
                  <div className="text-sm text-gray-600">{itemToDelete.carMaker} • {itemToDelete.carModelYear}</div>
                  <div className="text-sm text-gray-500">{itemToDelete.category} • {itemToDelete.fuelType}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setItemToDelete(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Car Catalog</h1>
          <p className="text-gray-600 mt-2">
            Manage car templates and specifications
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/car-catalog/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Car Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or maker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Array.isArray(categories) && categories.map(category => (
                    <SelectItem key={category.category} value={category.category}>
                      {category.category.charAt(0).toUpperCase() + category.category.slice(1)} 
                      {/* ({category.totalTemplates}) */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Fuel Type</label>
              <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="All fuel types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fuel types</SelectItem>
                  {fuelTypes.map(fuel => (
                    <SelectItem key={fuel} value={fuel}>
                      {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Transmission</label>
              <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
                <SelectTrigger>
                  <SelectValue placeholder="All transmissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All transmissions</SelectItem>
                  {transmissions.map(transmission => (
                    <SelectItem key={transmission} value={transmission}>
                      {transmission.charAt(0).toUpperCase() + transmission.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Car Catalog Items</CardTitle>
          <CardDescription>
            {totalItems} total items found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No car catalog items found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first car template.</p>
              <Button onClick={() => router.push('/dashboard/car-catalog/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Car Template
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Car Details</TableHead>
                      <TableHead>Specifications</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.carName}
                              className="w-16 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Car className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.carName}</div>
                            <div className="text-sm text-gray-600">{item.carMaker}</div>
                            <div className="text-sm text-gray-500">{item.carModelYear}</div>
                            <Badge variant="secondary" className="mt-1">
                              {item.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Fuel className="h-4 w-4 text-gray-400" />
                              {item.fuelType}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Settings className="h-4 w-4 text-gray-400" />
                              {item.transmission}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-gray-400" />
                              {item.seats} seats
                            </div>
                            {item.engineCapacity && (
                              <div className="text-sm text-gray-600">
                                {item.engineCapacity}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-600">Platform: </span>
                              <span className="font-medium">₹{item.carPlatformPrice}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Vendor: </span>
                              <span className="font-medium">₹{item.carVendorPrice}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadUsageStats(item)}
                              disabled={loadingStats}
                              className="hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                              title="View Usage Statistics"
                            >
                              {loadingStats ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <BarChart3 className="h-4 w-4" />
                              )}
                            </Button> */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/car-catalog/edit/${item.id}`)}
                              className="hover:bg-blue-50 hover:border-blue-300"
                              title="Edit Template"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setItemToDelete(item)
                                setDeleteDialogOpen(true)
                              }}
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                              title="Delete Template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics Modal */}
      <Dialog open={usageStatsOpen} onOpenChange={setUsageStatsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Template Usage Statistics
            </DialogTitle>
            <DialogDescription>
              Detailed analytics for this car template
            </DialogDescription>
          </DialogHeader>
          
          {usageStats ? (
            <div className="space-y-6">
              {/* Template Info */}
              {usageStats.catalog && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    {usageStats.catalog.imageUrl ? (
                      <img
                        src={usageStats.catalog.imageUrl}
                        alt={usageStats.catalog.carName}
                        className="w-20 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{usageStats.catalog.carName}</h3>
                      <p className="text-gray-600">{usageStats.catalog.carMaker} • {usageStats.catalog.carModelYear}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">{usageStats.catalog.category}</Badge>
                        <Badge variant="outline">{usageStats.catalog.fuelType}</Badge>
                        <Badge variant="outline">{usageStats.catalog.transmission}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Car Statistics */}
              {usageStats.usage && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Cars</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{usageStats.usage.totalCars || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-600">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{usageStats.usage.availableCars || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600">Booked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{usageStats.usage.bookedCars || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-orange-600">Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{usageStats.usage.maintenanceCars || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Booking Statistics */}
              {usageStats.usage && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{usageStats.usage.totalBookings || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600">Active Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{usageStats.usage.activeBookings || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{usageStats.usage.completedBookings || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Bookings */}
              {usageStats.recentBookings && usageStats.recentBookings.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-4">Recent Bookings</h4>
                  <div className="space-y-2">
                    {usageStats.recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{booking.car.name} - {booking.car.number}</div>
                          <div className="text-sm text-gray-600">
                            {booking.user.name || booking.user.number} • {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{booking.totalPrice}</div>
                          <Badge variant={booking.status === 'active' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Usage Statistics Available</h3>
              <p className="text-gray-600">Usage statistics are not available for this template at the moment.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsageStatsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
