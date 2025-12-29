'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getUserById, updateUser, User } from '../../api'
import { toast } from 'sonner'
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Shield, FileText, Upload } from 'lucide-react'
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary'

interface UserFormData {
  name: string
  email: string
  number: string
  age: number | null
  role: string
  isverified: boolean
  locality: string
  city: string
  state: string
  country: string
  pincode: string
  lat: number | null
  lng: number | null
  avatar: string
  aadharNumber: string
  aadharimg: string
  dlNumber: string
  dlimg: string
  passportNumber: string
  passportimg: string
  parkingid: number | null
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [aadharLoading, setAadharLoading] = useState(false)
  const [dlLoading, setDlLoading] = useState(false)
  const [passportLoading, setPassportLoading] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    number: '',
    age: null,
    role: 'user',
    isverified: false,
    locality: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    lat: null,
    lng: null,
    avatar: '',
    aadharNumber: '',
    aadharimg: '',
    dlNumber: '',
    dlimg: '',
    passportNumber: '',
    passportimg: '',
    parkingid: null
  })

  // Fetch existing user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const response = await getUserById(parseInt(userId))
        if (response.success && response.data) {
          // Handle both array and direct object responses
          const userData = Array.isArray(response.data) ? response.data[0] : response.data
          const user = userData as User
          console.log(user)
          setFormData({
            name: user.name || '',
            email: user.email || '',
            number: user.number?.toString() || '',
            age: user.age,
            role: user.role,
            isverified: user.isverified,
            locality: user.locality || '',
            city: user.city || '',
            state: user.state || '',
            country: user.country || '',
            pincode: user.pincode?.toString() || '',
            lat: user.lat,
            lng: user.lng,
            avatar: user.avatar || '',
            aadharNumber: user.aadharNumber || '',
            aadharimg: user.aadharimg || '',
            dlNumber: user.dlNumber || '',
            dlimg: user.dlimg || '',
            passportNumber: user.passportNumber || '',
            passportimg: user.passportimg || '',
            parkingid: user.parkingid
          })
        } else {
          toast.error(response.message || 'Failed to load user details')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Failed to load user details')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId])

  const handleInputChange = (field: keyof UserFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Image upload handlers
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setAvatarLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'users/avatars')
      if (result.success && result.data?.secure_url) {
        setFormData(prev => ({ ...prev, avatar: result.data!.secure_url }))
        toast.success('Avatar uploaded successfully!')
      } else {
        toast.error(result.error || 'Failed to upload avatar')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setAadharLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'users/documents/aadhar')
      if (result.success && result.data?.secure_url) {
        setFormData(prev => ({ ...prev, aadharimg: result.data!.secure_url }))
        toast.success('Aadhar document uploaded successfully!')
      } else {
        toast.error(result.error || 'Failed to upload aadhar document')
      }
    } catch (error) {
      console.error('Aadhar upload error:', error)
      toast.error('Failed to upload aadhar document')
    } finally {
      setAadharLoading(false)
    }
  }

  const handleDLUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setDlLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'users/documents/dl')
      if (result.success && result.data?.secure_url) {
        setFormData(prev => ({ ...prev, dlimg: result.data!.secure_url }))
        toast.success('Driver license uploaded successfully!')
      } else {
        toast.error(result.error || 'Failed to upload driver license')
      }
    } catch (error) {
      console.error('Driver license upload error:', error)
      toast.error('Failed to upload driver license')
    } finally {
      setDlLoading(false)
    }
  }

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) {
      toast.error('Invalid file. Please upload a valid image (JPEG, PNG, WebP) or PDF under 10MB.')
      return
    }

    setPassportLoading(true)
    try {
      const result = await uploadImageToCloudinary(file, 'users/documents/passport')
      if (result.success && result.data?.secure_url) {
        setFormData(prev => ({ ...prev, passportimg: result.data!.secure_url }))
        toast.success('Passport uploaded successfully!')
      } else {
        toast.error(result.error || 'Failed to upload passport')
      }
    } catch (error) {
      console.error('Passport upload error:', error)
      toast.error('Failed to upload passport')
    } finally {
      setPassportLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.number) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const userData = {
        ...formData,
        pincode: formData.pincode || null,
        lat: formData.lat || null,
        lng: formData.lng || null,
        avatar: formData.avatar || null,
        aadharNumber: formData.aadharNumber || null,
        aadharimg: formData.aadharimg || null,
        dlNumber: formData.dlNumber || null,
        dlimg: formData.dlimg || null,
        passportNumber: formData.passportNumber || null,
        passportimg: formData.passportimg || null
      }

      console.log('Updating user data:', userData)
      const res = await updateUser(parseInt(userId), userData)

      if (res.success) {
        toast.success('User updated successfully!')
        router.push(`/dashboard/users`)
      } else {
        toast.error(res.message || 'Failed to update user. Please try again.')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-medium">Loading user details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/users')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600 mt-2">
            Update user information and settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update user's basic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="number">Phone Number *</Label>
                <Input
                  id="number"
                  type="tel"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter age"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Upload user's profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*,.pdf"
                onChange={handleAvatarUpload}
                disabled={avatarLoading}
              />
              {avatarLoading && <p className="text-sm text-gray-600">Uploading...</p>}
              {formData.avatar && (
                <div className="mt-2">
                  <img src={formData.avatar} alt="Avatar" className="w-20 h-20 object-cover rounded" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role and Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Verification
            </CardTitle>
            <CardDescription>
              Set user role and verification status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="parkingincharge">Parking Incharge</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isverified"
                  checked={formData.isverified}
                  onCheckedChange={(checked) => handleInputChange('isverified', checked)}
                />
                <Label htmlFor="isverified">Verified User</Label>
              </div>
              <div>
                <Label htmlFor="parkingid">Parking ID</Label>
                <Input
                  id="parkingid"
                  type="number"
                  value={formData.parkingid || ''}
                  onChange={(e) => handleInputChange('parkingid', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter parking ID"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Upload and manage user documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aadharNumber">Aadhar Number</Label>
                <Input
                  id="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                  placeholder="Enter aadhar number"
                />
              </div>
              <div>
                <Label htmlFor="aadharimg">Aadhar Document</Label>
                <Input
                  id="aadharimg"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleAadharUpload}
                  disabled={aadharLoading}
                />
                {aadharLoading && <p className="text-sm text-gray-600">Uploading...</p>}
                {formData.aadharimg && (
                  <div className="mt-2">
                    <img src={formData.aadharimg} alt="Aadhar" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="dlNumber">Driver License Number</Label>
                <Input
                  id="dlNumber"
                  value={formData.dlNumber}
                  onChange={(e) => handleInputChange('dlNumber', e.target.value)}
                  placeholder="Enter driver license number"
                />
              </div>
              <div>
                <Label htmlFor="dlimg">Driver License Document</Label>
                <Input
                  id="dlimg"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDLUpload}
                  disabled={dlLoading}
                />
                {dlLoading && <p className="text-sm text-gray-600">Uploading...</p>}
                {formData.dlimg && (
                  <div className="mt-2">
                    <img src={formData.dlimg} alt="Driver License" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  placeholder="Enter passport number"
                />
              </div>
              <div>
                <Label htmlFor="passportimg">Passport Document</Label>
                <Input
                  id="passportimg"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePassportUpload}
                  disabled={passportLoading}
                />
                {passportLoading && <p className="text-sm text-gray-600">Uploading...</p>}
                {formData.passportimg && (
                  <div className="mt-2">
                    <img src={formData.passportimg} alt="Passport" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
            <CardDescription>
              Update user's location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) => handleInputChange('locality', e.target.value)}
                  placeholder="Enter locality"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat || ''}
                  onChange={(e) => handleInputChange('lat', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Enter latitude"
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng || ''}
                  onChange={(e) => handleInputChange('lng', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </div>
  )
} 