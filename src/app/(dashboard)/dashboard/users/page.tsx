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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { User, Search, Eye, Edit, Trash2, Mail, Phone, MapPin, Shield, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { getUsers, deleteUser, User as UserType } from './api'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await getUsers()
        if (result.success && result.data) {
          // Handle both array and direct array responses
          const usersData = Array.isArray(result.data) ? result.data : [result.data]
          setUsers(usersData)
        } else {
          toast.error(result.message || 'Failed to fetch users')
        }
      } catch (error) {
        console.error('Error loading users:', error)
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  // Filtered users logic
  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.number && user.number.toString().includes(searchTerm)) ||
      (user.id && user.id.toString().includes(searchTerm))

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && user.isverified) ||
      (verificationFilter === 'unverified' && !user.isverified)

    return matchesSearch && matchesRole && matchesVerification
  })

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const result = await deleteUser(userId)
        if (result.success) {
          toast.success('User deleted successfully!')
          const usersArray = Array.isArray(users) ? users : []
          setUsers(usersArray.filter(user => user.id !== userId))
        } else {
          toast.error(result.message || 'Failed to delete user')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'user':
        return 'bg-blue-100 text-blue-800'
      case 'vendor':
        return 'bg-green-100 text-green-800'
      case 'parkingincharge':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all registered users in the system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold">{(Array.isArray(users) ? users : []).filter(u => u.isverified).length}</p>
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
                <p className="text-sm font-medium text-gray-600">Unverified</p>
                <p className="text-2xl font-bold">{(Array.isArray(users) ? users : []).filter(u => !u.isverified).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendors</p>
                <p className="text-2xl font-bold">{(Array.isArray(users) ? users : []).filter(u => u.role === 'vendor').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Manage and monitor all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="parkingincharge">Parking Incharge</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || ''} alt={user.name || 'User'} />
                          <AvatarFallback>
                            {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || 'Unnamed User'}</p>
                          <p className="text-sm text-gray-600">ID: {user.id}</p>
                          {user.age && <p className="text-sm text-gray-600">Age: {user.age}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-500" />
                            {user.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-500" />
                          {user.number || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={user.isverified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {user.isverified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.locality ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span>{user.locality}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                Complete information for {user.name || 'User'}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* User Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage src={selectedUser.avatar || ''} alt={selectedUser.name || 'User'} />
                                      <AvatarFallback className="text-lg">
                                        {selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-semibold">{selectedUser.name || 'Unnamed User'}</h3>
                                      <p className="text-gray-600">ID: {selectedUser.id}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge className={getRoleBadgeColor(selectedUser.role)}>
                                          {selectedUser.role}
                                        </Badge>
                                        <Badge 
                                          className={selectedUser.isverified 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                          }
                                        >
                                          {selectedUser.isverified ? 'Verified' : 'Unverified'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Contact Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    {selectedUser.email && (
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedUser.email}</p>
                                      </div>
                                    )}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Phone Number</p>
                                      <p className="font-medium">{selectedUser.number}</p>
                                    </div>
                                    {selectedUser.age && (
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Age</p>
                                        <p className="font-medium">{selectedUser.age}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Location Information */}
                                {(selectedUser.locality || selectedUser.city || selectedUser.state || selectedUser.country) && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      Location Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedUser.locality && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600">Locality</p>
                                          <p className="font-medium">{selectedUser.locality}</p>
                                        </div>
                                      )}
                                      {selectedUser.city && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600">City</p>
                                          <p className="font-medium">{selectedUser.city}</p>
                                        </div>
                                      )}
                                      {selectedUser.state && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600">State</p>
                                          <p className="font-medium">{selectedUser.state}</p>
                                        </div>
                                      )}
                                      {selectedUser.country && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600">Country</p>
                                          <p className="font-medium">{selectedUser.country}</p>
                                        </div>
                                      )}
                                      {selectedUser.pincode && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600">Pincode</p>
                                          <p className="font-medium">{selectedUser.pincode}</p>
                                        </div>
                                      )}
                                      {(selectedUser.lat && selectedUser.lng) && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600">Coordinates</p>
                                          <p className="font-medium">{selectedUser.lat}, {selectedUser.lng}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Documents */}
                                {(selectedUser.aadharNumber || selectedUser.dlNumber || selectedUser.passportNumber) && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Documents
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {selectedUser.aadharNumber && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600 mb-2">Aadhar Number</p>
                                          <p className="font-medium">{selectedUser.aadharNumber}</p>
                                          {selectedUser.aadharimg && (
                                            <div className="mt-2">
                                              <img src={selectedUser.aadharimg} alt="Aadhar" className="w-full h-32 object-cover rounded" />
                                              <a 
                                                href={selectedUser.aadharimg} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                              >
                                                View Full Size
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {selectedUser.dlNumber && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600 mb-2">Driver License</p>
                                          <p className="font-medium">{selectedUser.dlNumber}</p>
                                          {selectedUser.dlimg && (
                                            <div className="mt-2">
                                              <img src={selectedUser.dlimg} alt="Driver License" className="w-full h-32 object-cover rounded" />
                                              <a 
                                                href={selectedUser.dlimg} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                              >
                                                View Full Size
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {selectedUser.passportNumber && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-600 mb-2">Passport Number</p>
                                          <p className="font-medium">{selectedUser.passportNumber}</p>
                                          {selectedUser.passportimg && (
                                            <div className="mt-2">
                                              <img src={selectedUser.passportimg} alt="Passport" className="w-full h-32 object-cover rounded" />
                                              <a 
                                                href={selectedUser.passportimg} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                              >
                                                View Full Size
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Business Information */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Business Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Parking ID</p>
                                      <p className="font-medium">{selectedUser.parkingid || 'Not assigned'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">User ID</p>
                                      <p className="font-medium">{selectedUser.id}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Timestamps */}
                                <div>
                                  <h4 className="font-medium mb-3">Timestamps</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Created At</p>
                                      <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Updated At</p>
                                      <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
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
                          onClick={() => router.push(`/dashboard/users/edit/${user.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user.id)}
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