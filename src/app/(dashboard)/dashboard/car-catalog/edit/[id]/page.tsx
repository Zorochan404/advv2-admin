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
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { 
  getCarCatalogById, 
  updateCarCatalog, 
  type CarCatalogItem,
  type CarCatalogUpdateData 
} from '../../api'
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary'

interface CarCatalogFormData {
  carName: string
  carMaker: string
  carModelYear: number
  carVendorPrice: number
  carPlatformPrice: number
  transmission: 'manual' | 'automatic'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  seats: number
  engineCapacity: string
  mileage: string
  features: string
  imageUrl: string
  category: string
  isActive: boolean
}

export default function EditCarCatalogPage() {
  const router = useRouter()
  const params = useParams()
  const catalogId = parseInt(params.id as string)
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState(false)
  
  const [formData, setFormData] = useState<CarCatalogFormData>({
    carName: '',
    carMaker: '',
    carModelYear: new Date().getFullYear(),
    carVendorPrice: 0,
    carPlatformPrice: 0,
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    engineCapacity: '',
    mileage: '',
    features: '',
    imageUrl: '',
    category: 'sedan',
    isActive: true
  })

  const categories = [
    'sedan', 'suv', 'hatchback', 'luxury', 'sports', 'convertible', 'truck', 'van'
  ]

  useEffect(() => {
    if (catalogId) {
      loadCatalogItem()
    }
  }, [catalogId])

  const loadCatalogItem = async () => {
    try {
      setInitialLoading(true)
      const response = await getCarCatalogById(catalogId)
      
      if (response.success && response.data) {
        const item = response.data
        setFormData({
          carName: item.carName,
          carMaker: item.carMaker,
          carModelYear: item.carModelYear,
          carVendorPrice: parseFloat(item.carVendorPrice),
          carPlatformPrice: parseFloat(item.carPlatformPrice),
          transmission: item.transmission,
          fuelType: item.fuelType,
          seats: item.seats,
          engineCapacity: item.engineCapacity || '',
          mileage: item.mileage || '',
          features: item.features || '',
          imageUrl: item.imageUrl || '',
          category: item.category,
          isActive: item.isActive
        })
      } else {
        toast.error('Failed to load car catalog item')
        router.push('/dashboard/car-catalog')
      }
    } catch (error: any) {
      console.error('Error loading catalog item:', error)
      toast.error('Failed to load car catalog item')
      router.push('/dashboard/car-catalog')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData: CarCatalogUpdateData = {
        carName: formData.carName,
        carMaker: formData.carMaker,
        carModelYear: formData.carModelYear,
        carVendorPrice: formData.carVendorPrice,
        carPlatformPrice: formData.carPlatformPrice,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: formData.seats,
        engineCapacity: formData.engineCapacity || undefined,
        mileage: formData.mileage || undefined,
        features: formData.features || undefined,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category,
        isActive: formData.isActive
      }

      const response = await updateCarCatalog(catalogId, updateData)

      if (response.success) {
        toast.success('Car catalog item updated successfully!')
        router.push('/dashboard/car-catalog')
      } else {
        toast.error('Failed to update car catalog item')
      }
    } catch (error: any) {
      console.error('Update catalog error:', error)
      toast.error(error.response?.data?.message || 'An error occurred while updating the catalog item')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CarCatalogFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const uploadImage = async (file: File) => {
    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setImageLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'car-rental/catalog')
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.data!.secure_url
        }))
        toast.success('Image uploaded successfully!')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setImageLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Car Template</h1>
          <p className="text-gray-600 mt-2">
            Update the car template information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Car Template Information</CardTitle>
          <CardDescription>
            Update the details for this car template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carName">Car Name *</Label>
                  <Input
                    id="carName"
                    value={formData.carName}
                    onChange={(e) => handleInputChange('carName', e.target.value)}
                    placeholder="Hyundai Creta"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="carMaker">Car Maker *</Label>
                  <Input
                    id="carMaker"
                    value={formData.carMaker}
                    onChange={(e) => handleInputChange('carMaker', e.target.value)}
                    placeholder="Hyundai"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carModelYear">Model Year *</Label>
                  <Input
                    id="carModelYear"
                    type="number"
                    value={formData.carModelYear}
                    onChange={(e) => handleInputChange('carModelYear', parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="transmission">Transmission *</Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fuelType">Fuel Type *</Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seats">Seats *</Label>
                  <Input
                    id="seats"
                    type="number"
                    value={formData.seats}
                    onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="engineCapacity">Engine Capacity</Label>
                  <Input
                    id="engineCapacity"
                    value={formData.engineCapacity}
                    onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
                    placeholder="1.5L"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    placeholder="15 kmpl"
                  />
                </div>
                <div>
                  <Label htmlFor="features">Features</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => handleInputChange('features', e.target.value)}
                    placeholder="AC, GPS, Bluetooth, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing (Daily Rates)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carVendorPrice">Vendor Price (₹) *</Label>
                  <Input
                    id="carVendorPrice"
                    type="number"
                    value={formData.carVendorPrice}
                    onChange={(e) => handleInputChange('carVendorPrice', parseFloat(e.target.value))}
                    placeholder="2000"
                    min="0"
                    step="0.01"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">Amount vendor receives per day</p>
                </div>
                <div>
                  <Label htmlFor="carPlatformPrice">Platform Price (₹) *</Label>
                  <Input
                    id="carPlatformPrice"
                    type="number"
                    value={formData.carPlatformPrice}
                    onChange={(e) => handleInputChange('carPlatformPrice', parseFloat(e.target.value))}
                    placeholder="3000"
                    min="0"
                    step="0.01"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">Amount customers pay per day</p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Image</h3>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <div className="mt-2">
                  <input
                    type="file"
                    id="image-file"
                    accept="image/*,.pdf"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-file"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm w-fit"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </label>
                  {imageLoading && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                </div>
                
                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Car preview"
                        className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: any) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading || imageLoading} 
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update Car Template'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/car-catalog')}
                disabled={loading || imageLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

