'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Plus, Upload, X, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import Cookies from 'js-cookie'
import { getBaseUrl, CAR_CATALOG_URLS, VENDOR_URLS, ADMIN_PARKING_URLS } from '@/lib/urls'
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary'
import { FancySingleSelect } from '@/components/ui/fancy-single-select'

interface CarCatalogOption {
  id: number
  carName: string
  carMaker: string
  carModelYear: number
  category: string
  carPlatformPrice: string
}

interface VendorOption {
  id: number
  name: string
  email: string
  number: number
}

interface ParkingOption {
  id: number
  name: string
  locality: string
  city: string
  capacity: number
}

interface CarFormData {
  name: string
  carnumber: string
  price: number
  insurancePrice: number
  discountedprice: number
  color: string
  rcnumber: string
  rcimg: string
  pollutionimg: string
  insuranceimg: string
  inmaintainance: boolean
  isavailable: boolean
  images: string[]
  mainimg: string
  vendorid: number
  parkingid: number | null
  isapproved: boolean
  ispopular: boolean
  catalogId: number | null
  // Additional fields from the new API response
  maker?: string
  year?: number
  transmission?: string
  fuel?: string
  type?: string
  seats?: number
}

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const carId = params.carId as string

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Individual loading states for each image upload
  const [mainImageLoading, setMainImageLoading] = useState(false)
  const [additionalImageLoading, setAdditionalImageLoading] = useState(false)
  const [rcImageLoading, setRcImageLoading] = useState(false)
  const [pollutionImageLoading, setPollutionImageLoading] = useState(false)
  const [insuranceImageLoading, setInsuranceImageLoading] = useState(false)

  // Select options and loading states
  const [carCatalogOptions, setCarCatalogOptions] = useState<{ value: string, label: string }[]>([])
  const [carCatalogData, setCarCatalogData] = useState<CarCatalogOption[]>([])
  const [vendorOptions, setVendorOptions] = useState<{ value: string, label: string }[]>([])
  const [parkingOptions, setParkingOptions] = useState<{ value: string, label: string }[]>([])
  const [loadingOptions, setLoadingOptions] = useState({
    carCatalog: false,
    vendors: false,
    parkings: false
  })

  // Selected values
  const [selectedCarCatalog, setSelectedCarCatalog] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [selectedParking, setSelectedParking] = useState<string | null>(null)

  // Current vendor and parking details from API
  const [currentVendor, setCurrentVendor] = useState<VendorOption | null>(null)
  const [currentParking, setCurrentParking] = useState<ParkingOption | null>(null)

  const [formData, setFormData] = useState<CarFormData>({
    name: '',
    carnumber: '',
    price: 0,
    insurancePrice: 500,
    discountedprice: 0,
    color: '',
    rcnumber: '',
    rcimg: '',
    pollutionimg: '',
    insuranceimg: '',
    inmaintainance: false,
    isavailable: true,
    images: [],
    mainimg: '',
    vendorid: 0,
    parkingid: null,
    isapproved: false,
    ispopular: false,
    catalogId: null,
    // Additional fields
    maker: '',
    year: new Date().getFullYear(),
    transmission: 'manual',
    fuel: 'petrol',
    type: 'sedan',
    seats: 5
  })

  // Fetch car data on component mount
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const baseUrl = getBaseUrl()
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
          toast.error('No access token found')
          router.push('/login')
          return
        }

        const response = await axios.get(`${baseUrl}/admin/cars/${carId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })

        if (response.data.success) {
          const carData = response.data.data
          console.log('Car data received:', carData)
          console.log('Available fields in carData:', Object.keys(carData))
          console.log('CatalogId from API:', carData.catalogId)
          console.log('Main Image from API:', carData.mainimg)
          console.log('Additional Images from API:', carData.images)

          setFormData({
            name: carData.name || '',
            carnumber: carData.carnumber || '',
            price: carData.price || 0,
            insurancePrice: carData.insurancePrice || 500,
            discountedprice: carData.discountedprice || 0,
            color: carData.color || '',
            rcnumber: carData.rcnumber || '',
            rcimg: carData.rcimg || '',
            pollutionimg: carData.pollutionimg || '',
            insuranceimg: carData.insuranceimg || '',
            inmaintainance: carData.inmaintainance || false,
            isavailable: carData.isavailable || true,
            images: carData.images || [],
            mainimg: carData.mainimg || '',
            vendorid: carData.vendor?.id || 0,
            parkingid: carData.parking?.id || null,
            isapproved: carData.isapproved || false,
            ispopular: carData.ispopular || false,
            catalogId: carData.catalogId || null, // Now using the confirmed field name
            // Additional fields from the new API response
            maker: carData.maker || '',
            year: carData.year || new Date().getFullYear(),
            transmission: carData.transmission || 'manual',
            fuel: carData.fuel || 'petrol',
            type: carData.type || 'sedan',
            seats: carData.seats || 5
          })

          // Set selected values for dropdowns using the vendor and parking objects
          setSelectedVendor(carData.vendor?.id ? carData.vendor.id.toString() : null)
          setSelectedParking(carData.parking?.id ? carData.parking.id.toString() : null)

          // Set current vendor and parking details for display
          setCurrentVendor(carData.vendor || null)
          setCurrentParking(carData.parking || null)
          // Note: catalogId will be set when we load the catalog options
        } else {
          toast.error('Failed to fetch car data')
          router.push('/dashboard/cars')
        }
      } catch (error: any) {
        console.error('Fetch car error:', error)
        toast.error(error.response?.data?.message || 'Failed to fetch car data')
        router.push('/dashboard/cars')
      } finally {
        setInitialLoading(false)
      }
    }

    if (carId) {
      fetchCarData()
    }
  }, [carId, router])

  // Load options on component mount
  useEffect(() => {
    fetchCarCatalogOptions()
    fetchVendorOptions()
    fetchParkingOptions()
  }, [])

  // Set catalog selection when both car data and catalog options are loaded
  useEffect(() => {
    if (formData.catalogId && carCatalogData.length > 0) {
      // Find matching catalog item by ID (primary method)
      const matchingCatalog = carCatalogData.find(item =>
        item.id === formData.catalogId
      )
      if (matchingCatalog) {
        setSelectedCarCatalog(matchingCatalog.id.toString())
        console.log('Catalog preselected by ID:', matchingCatalog.carName)
      }
    } else if (formData.name && carCatalogData.length > 0 && !formData.catalogId) {
      // Fallback: Find matching catalog item by name if no catalogId
      const matchingCatalog = carCatalogData.find(item =>
        item.carName.toLowerCase() === formData.name.toLowerCase()
      )
      if (matchingCatalog) {
        setSelectedCarCatalog(matchingCatalog.id.toString())
        console.log('Catalog preselected by name:', matchingCatalog.carName)
      }
    }
  }, [formData.catalogId, formData.name, carCatalogData])

  // Fetch car catalog options
  const fetchCarCatalogOptions = async () => {
    setLoadingOptions(prev => ({ ...prev, carCatalog: true }))
    try {
      const baseUrl = getBaseUrl()
      const accessToken = Cookies.get('accessToken')

      if (!accessToken) {
        toast.error('No access token found')
        return
      }

      const response = await axios.get(CAR_CATALOG_URLS.GET_ALL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (response.data.success && response.data.data && response.data.data.data) {
        const catalogData = response.data.data.data
        const options = catalogData.map((item: CarCatalogOption) => ({
          value: item.id.toString(),
          label: `${item.carName} (${item.carMaker} ${item.carModelYear}) - ${item.category}`
        }))
        setCarCatalogOptions(options)
        setCarCatalogData(catalogData)
        console.log('Car catalog options loaded:', options.length)
      } else {
        console.error('Car catalog API response structure:', response.data)
      }
    } catch (error) {
      console.error('Error fetching car catalog options:', error)
      toast.error('Failed to load car catalog options')
    } finally {
      setLoadingOptions(prev => ({ ...prev, carCatalog: false }))
    }
  }

  // Fetch vendor options
  const fetchVendorOptions = async () => {
    setLoadingOptions(prev => ({ ...prev, vendors: true }))
    try {
      const baseUrl = getBaseUrl()
      const accessToken = Cookies.get('accessToken')

      if (!accessToken) {
        toast.error('No access token found')
        return
      }

      const response = await axios.get(VENDOR_URLS.GET_ALL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (response.data.success && response.data.data && response.data.data.vendors) {
        const options = response.data.data.vendors.map((item: VendorOption) => ({
          value: item.id.toString(),
          label: `${item.name} (${item.email})`
        }))
        setVendorOptions(options)
        console.log('Vendor options loaded:', options.length)
      } else {
        console.error('Vendor API response structure:', response.data)
      }
    } catch (error) {
      console.error('Error fetching vendor options:', error)
      toast.error('Failed to load vendor options')
    } finally {
      setLoadingOptions(prev => ({ ...prev, vendors: false }))
    }
  }

  // Fetch parking options
  const fetchParkingOptions = async () => {
    setLoadingOptions(prev => ({ ...prev, parkings: true }))
    try {
      const baseUrl = getBaseUrl()
      const accessToken = Cookies.get('accessToken')

      if (!accessToken) {
        toast.error('No access token found')
        return
      }

      const response = await axios.get(ADMIN_PARKING_URLS.GET_ALL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (response.data.success && response.data.data && response.data.data.parkings) {
        const options = response.data.data.parkings.map((item: ParkingOption) => ({
          value: item.id.toString(),
          label: `${item.name} (${item.locality}, ${item.city}) - ${item.capacity} cars`
        }))
        setParkingOptions(options)
        console.log('Parking options loaded:', options.length)
      } else {
        console.error('Parking API response structure:', response.data)
      }
    } catch (error) {
      console.error('Error fetching parking options:', error)
      toast.error('Failed to load parking options')
    } finally {
      setLoadingOptions(prev => ({ ...prev, parkings: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const baseUrl = getBaseUrl()
      const accessToken = Cookies.get('accessToken')

      if (!accessToken) {
        toast.error('No access token found')
        return
      }

      // Determine the catalogId to use
      const finalCatalogId = selectedCarCatalog ? parseInt(selectedCarCatalog) : formData.catalogId

      console.log('Debug info:', {
        selectedCarCatalog,
        formDataCatalogId: formData.catalogId,
        finalCatalogId,
        catalogIdType: typeof finalCatalogId
      })

      // Validate required fields
      if (!finalCatalogId) {
        toast.error('Please select a car template. The car must be associated with a catalog template.')
        setLoading(false)
        return
      }

      // Update form data with selected values and fix field names
      const submitData = {
        ...formData,
        number: formData.carnumber, // Backend expects 'number' field
        catalogId: finalCatalogId, // Use the determined catalogId
        vendorid: selectedVendor ? parseInt(selectedVendor) : formData.vendorid,
        parkingid: selectedParking ? parseInt(selectedParking) : formData.parkingid,
        // Ensure image URLs are valid or empty strings
        rcimg: formData.rcimg || '',
        pollutionimg: formData.pollutionimg || '',
        insuranceimg: formData.insuranceimg || '',
        mainimg: formData.mainimg || ''
      }

      console.log('Updating car data:', submitData)

      const response = await axios.put(`${baseUrl}/admin/cars/${carId}`, submitData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        toast.success('Car updated successfully!')
        router.push('/dashboard/cars')
      } else {
        toast.error(response.data.message || 'Failed to update car')
      }
    } catch (error: any) {
      console.error('Update car error:', error)
      toast.error(error.response?.data?.message || 'An error occurred while updating the car')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CarFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Individual upload functions for each image type
  const uploadMainImage = async (file: File) => {
    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setMainImageLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'car-rental/main')
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          mainimg: result.data!.secure_url
        }))
        toast.success('Main image uploaded successfully!')
      } else {
        toast.error('Failed to upload main image')
      }
    } catch (error) {
      console.error('Main image upload error:', error)
      toast.error('Failed to upload main image')
    } finally {
      setMainImageLoading(false)
    }
  }

  const uploadAdditionalImage = async (file: File) => {
    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    try {
      const result = await uploadImageToCloudinary(file, 'car-rental/additional')
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.data!.secure_url]
        }))
        toast.success(`${file.name} uploaded successfully!`)
      } else {
        toast.error(`Failed to upload ${file.name}`)
      }
    } catch (error) {
      console.error('Additional image upload error:', error)
      toast.error(`Failed to upload ${file.name}`)
    }
  }

  const uploadRcImage = async (file: File) => {
    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setRcImageLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'car-rental/documents')
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          rcimg: result.data!.secure_url
        }))
        toast.success('RC document uploaded successfully!')
      } else {
        toast.error('Failed to upload RC document')
      }
    } catch (error) {
      console.error('RC image upload error:', error)
      toast.error('Failed to upload RC document')
    } finally {
      setRcImageLoading(false)
    }
  }

  const uploadPollutionImage = async (file: File) => {
    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setPollutionImageLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'car-rental/documents')
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          pollutionimg: result.data!.secure_url
        }))
        toast.success('Pollution certificate uploaded successfully!')
      } else {
        toast.error('Failed to upload pollution certificate')
      }
    } catch (error) {
      console.error('Pollution image upload error:', error)
      toast.error('Failed to upload pollution certificate')
    } finally {
      setPollutionImageLoading(false)
    }
  }

  const uploadInsuranceImage = async (file: File) => {
    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setInsuranceImageLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'car-rental/documents')
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          insuranceimg: result.data!.secure_url
        }))
        toast.success('Insurance document uploaded successfully!')
      } else {
        toast.error('Failed to upload insurance document')
      }
    } catch (error) {
      console.error('Insurance image upload error:', error)
      toast.error('Failed to upload insurance document')
    } finally {
      setInsuranceImageLoading(false)
    }
  }

  // Handle file input changes
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMainImage(file)
    }
  }

  const handleAdditionalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    setAdditionalImageLoading(true)

    try {
      // Upload all files sequentially
      for (const file of files) {
        await uploadAdditionalImage(file)
      }
    } finally {
      setAdditionalImageLoading(false)
      // Clear the input so the same files can be selected again if needed
      e.target.value = ''
    }
  }

  const handleRcImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadRcImage(file)
    }
  }

  const handlePollutionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadPollutionImage(file)
    }
  }

  const handleInsuranceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadInsuranceImage(file)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/cars')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cars
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Car</h1>
          <p className="text-gray-600">Update car information and details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Car Details */}
        <Card>
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
            <CardDescription>
              Update the basic details of the car
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Car Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Hyundai Creta"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Can be edited independently of the template
                </p>
              </div>
              <div>
                <Label htmlFor="carnumber">Car Number *</Label>
                <Input
                  id="carnumber"
                  value={formData.carnumber}
                  onChange={(e) => handleInputChange('carnumber', e.target.value)}
                  placeholder="DL01AB1234"
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="White"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Specifications (Read-only from API) */}
        <Card>
          <CardHeader>
            <CardTitle>Car Specifications</CardTitle>
            <CardDescription>
              These specifications are loaded from the car data (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Maker</Label>
                <Input
                  value={formData.maker || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  value={formData.year || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Seats</Label>
                <Input
                  value={formData.seats || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Transmission</Label>
                <Input
                  value={formData.transmission || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Input
                  value={formData.fuel || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Car Type</Label>
                <Input
                  value={formData.type || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>
              Update car pricing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price per Day (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  placeholder="1500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Can be edited independently of the template
                </p>
              </div>
              <div>
                <Label htmlFor="insurancePrice">Insurance Price (₹) *</Label>
                <Input
                  id="insurancePrice"
                  type="number"
                  value={formData.insurancePrice}
                  onChange={(e) => handleInputChange('insurancePrice', parseFloat(e.target.value))}
                  placeholder="500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: ₹500, can be edited
                </p>
              </div>
              <div>
                <Label htmlFor="discountedprice">Discounted Price (₹)</Label>
                <Input
                  id="discountedprice"
                  type="number"
                  value={formData.discountedprice}
                  onChange={(e) => handleInputChange('discountedprice', parseFloat(e.target.value))}
                  placeholder="1200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Car Template</CardTitle>
            <CardDescription>
              Select or change the car template (optional for editing)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-4">
                <strong>Optional:</strong> You can change the car template or leave it as is. This will update the car specifications.
              </p>
              {loadingOptions.carCatalog ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Loading car templates...</span>
                </div>
              ) : (
                <FancySingleSelect
                  options={carCatalogOptions}
                  initialSelected={selectedCarCatalog ? carCatalogOptions.find(opt => opt.value === selectedCarCatalog) || null : null}
                  placeholder="Select a car template (optional)..."
                  onChange={setSelectedCarCatalog}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update vendor and parking information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Vendor *</Label>
                {loadingOptions.vendors ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Loading vendors...</span>
                  </div>
                ) : (
                  <FancySingleSelect
                    options={vendorOptions}
                    initialSelected={selectedVendor ? vendorOptions.find(opt => opt.value === selectedVendor) || null : null}
                    placeholder="Select a vendor..."
                    onChange={setSelectedVendor}
                  />
                )}
              </div>
              <div>
                <Label>Parking Location</Label>
                {loadingOptions.parkings ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Loading parking locations...</span>
                  </div>
                ) : (
                  <FancySingleSelect
                    options={parkingOptions}
                    initialSelected={selectedParking ? parkingOptions.find(opt => opt.value === selectedParking) || null : null}
                    placeholder="Select a parking location..."
                    onChange={setSelectedParking}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Vendor & Parking Information (Read-only from API) */}
        <Card>
          <CardHeader>
            <CardTitle>Current Vendor & Parking Information</CardTitle>
            <CardDescription>
              Current vendor and parking details (loaded from API)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Vendor Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {currentVendor?.name || 'No vendor assigned'}</div>
                  <div><span className="font-medium">Email:</span> {currentVendor?.email || 'N/A'}</div>
                  <div><span className="font-medium">Phone:</span> {currentVendor?.number || 'N/A'}</div>
                </div>
              </div>

              {/* Parking Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Parking Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {currentParking?.name || 'No parking assigned'}</div>
                  <div><span className="font-medium">Location:</span> {currentParking ? `${currentParking.locality}, ${currentParking.city}` : 'N/A'}</div>
                  <div><span className="font-medium">Capacity:</span> {currentParking?.capacity || 'N/A'} cars</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Update car documents and certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rcnumber">RC Number *</Label>
                <Input
                  id="rcnumber"
                  value={formData.rcnumber}
                  onChange={(e) => handleInputChange('rcnumber', e.target.value)}
                  placeholder="AS123456789"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rcimg">RC Image</Label>
                <div className="space-y-2">
                  <Input
                    id="rcimg"
                    value={formData.rcimg}
                    onChange={(e) => handleInputChange('rcimg', e.target.value)}
                    placeholder="https://cdn.example.com/docs/rc1.jpg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="rcimg-file"
                      accept="image/*,.pdf"
                      onChange={handleRcImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="rcimg-file"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      Upload RC
                    </label>
                    {rcImageLoading && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* RC Image Preview */}
                  {(formData.rcimg) && (
                    <div className="mt-3">
                      <Label className="text-sm text-gray-600">Preview:</Label>
                      <div className="mt-2 relative inline-block">
                        <img
                          src={formData.rcimg}
                          alt="RC document"
                          className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            if (formData.rcimg) {
                              window.open(formData.rcimg, '_blank')
                            }
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pollutionimg">Pollution Certificate</Label>
                <div className="space-y-2">
                  <Input
                    id="pollutionimg"
                    value={formData.pollutionimg}
                    onChange={(e) => handleInputChange('pollutionimg', e.target.value)}
                    placeholder="https://cdn.example.com/docs/pollution1.jpg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="pollutionimg-file"
                      accept="image/*,.pdf"
                      onChange={handlePollutionImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="pollutionimg-file"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Pollution Cert
                    </label>
                    {pollutionImageLoading && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Pollution Certificate Preview */}
                  {(formData.pollutionimg) && (
                    <div className="mt-3">
                      <Label className="text-sm text-gray-600">Preview:</Label>
                      <div className="mt-2 relative inline-block">
                        <img
                          src={formData.pollutionimg}
                          alt="Pollution certificate"
                          className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            if (formData.pollutionimg) {
                              window.open(formData.pollutionimg, '_blank')
                            }
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="insuranceimg">Insurance</Label>
                <div className="space-y-2">
                  <Input
                    id="insuranceimg"
                    value={formData.insuranceimg}
                    onChange={(e) => handleInputChange('insuranceimg', e.target.value)}
                    placeholder="https://cdn.example.com/docs/insurance1.jpg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="insuranceimg-file"
                      accept="image/*,.pdf"
                      onChange={handleInsuranceImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="insuranceimg-file"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Insurance
                    </label>
                    {insuranceImageLoading && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Insurance Preview */}
                  {(formData.insuranceimg) && (
                    <div className="mt-3">
                      <Label className="text-sm text-gray-600">Preview:</Label>
                      <div className="mt-2 relative inline-block">
                        <img
                          src={formData.insuranceimg}
                          alt="Insurance document"
                          className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            if (formData.insuranceimg) {
                              window.open(formData.insuranceimg, '_blank')
                            }
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Update car images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Image */}
            <div>
              <Label htmlFor="mainimg">Main Image *</Label>
              <div className="space-y-2">
                <Input
                  id="mainimg"
                  value={formData.mainimg}
                  onChange={(e) => handleInputChange('mainimg', e.target.value)}
                  placeholder="https://cdn.example.com/images/creta_main.jpg"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="mainimg-file"
                    accept="image/*,.pdf"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="mainimg-file"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Main Image
                  </label>
                  {mainImageLoading && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Main Image Preview */}
                {(formData.mainimg) && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Current Image:</Label>
                    <div className="mt-2 relative inline-block">
                      <img
                        src={formData.mainimg}
                        alt="Main car image"
                        className="w-48 h-36 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Failed to load main image:', formData.mainimg)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => {
                          if (formData.mainimg) {
                            window.open(formData.mainimg, '_blank')
                          }
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <Label>Additional Images</Label>
              <div className="space-y-2">
                {/* File upload for additional images */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="additional-images"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleAdditionalImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="additional-images"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Additional Images
                  </label>
                  {additionalImageLoading && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Display uploaded files */}
                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm">{image.split('/').pop() || ''}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImageUrl(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional Images Preview */}
                {(formData.images.length > 0) && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {/* Preview uploaded files */}
                      {formData.images.map((image, index) => (
                        <div key={`preview-${index}`} className="relative">
                          <img
                            src={image}
                            alt={`Additional image ${index + 1}`}
                            className="w-24 h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-1 right-1 h-5 w-5 p-0"
                            onClick={() => window.open(image, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Status Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Update car status and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isavailable"
                  checked={formData.isavailable}
                  onCheckedChange={(checked: any) => handleInputChange('isavailable', checked)}
                />
                <Label htmlFor="isavailable">Available</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="inmaintainance"
                  checked={formData.inmaintainance}
                  onCheckedChange={(checked: any) => handleInputChange('inmaintainance', checked)}
                />
                <Label htmlFor="inmaintainance">In Maintenance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isapproved"
                  checked={formData.isapproved}
                  onCheckedChange={(checked: any) => handleInputChange('isapproved', checked)}
                />
                <Label htmlFor="isapproved">Approved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ispopular"
                  checked={formData.ispopular}
                  onCheckedChange={(checked: any) => handleInputChange('ispopular', checked)}
                />
                <Label htmlFor="ispopular">Popular</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading || mainImageLoading || additionalImageLoading || rcImageLoading || pollutionImageLoading || insuranceImageLoading} className="flex-1">
            {loading ? 'Updating Car...' : 'Update Car'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/cars')}
            disabled={loading || mainImageLoading || additionalImageLoading || rcImageLoading || pollutionImageLoading || insuranceImageLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 