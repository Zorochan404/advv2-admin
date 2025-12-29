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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { 
  CreditCard, 
  Search, 
  Eye, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Calendar,
  User,
  Car,
  MapPin,
  Receipt
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getPayments, Payment } from './api'

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  
  // Date range filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateFilterActive, setDateFilterActive] = useState(false)

  // Fetch payments on component mount
  useEffect(() => {
    const loadPayments = async () => {
      try {
        const result = await getPayments()
        if (result.success && result.data) {
          setPayments(result.data)
        } else {
          toast.error(result.message || 'Failed to fetch payments')
        }
      } catch (error) {
        console.error('Error loading payments:', error)
        toast.error('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [])

  // Filtered payments logic
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      (payment.customerName && payment.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.customerEmail && payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.bookingId && payment.bookingId.toString().includes(searchTerm))

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter

    // Date range filter
    let matchesDateRange = true
    if (dateFilterActive && startDate && endDate) {
      const paymentDate = new Date(payment.createdAt)
      const filterStartDate = new Date(startDate)
      const filterEndDate = new Date(endDate)
      
      matchesDateRange = paymentDate >= filterStartDate && paymentDate <= filterEndDate
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDateRange
  })

  const getStatusBadgeColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodBadgeColor = (method: Payment['method']) => {
    switch (method) {
      case 'razorpay':
        return 'bg-blue-100 text-blue-800'
      case 'stripe':
        return 'bg-purple-100 text-purple-800'
      case 'paypal':
        return 'bg-yellow-100 text-yellow-800'
      case 'upi':
        return 'bg-indigo-100 text-indigo-800'
      case 'card':
        return 'bg-green-100 text-green-800'
      case 'netbanking':
        return 'bg-teal-100 text-teal-800'
      case 'wallet':
        return 'bg-orange-100 text-orange-800'
      case 'cash':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate statistics
  const totalPayments = payments.length
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = payments.filter(p => p.status === 'completed').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const processingPayments = payments.filter(p => p.status === 'processing').length
  const failedPayments = payments.filter(p => p.status === 'failed').length
  const refundedPayments = payments.filter(p => p.status === 'refunded').length

  const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage all payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Payment</p>
                <p className="text-2xl font-bold">{formatCurrency(averagePayment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold">{processingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{failedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Refunded</p>
                <p className="text-2xl font-bold">{refundedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name, email, transaction ID, or booking ID..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex gap-4 items-center">
              <Label className="text-sm font-medium">Filter by Payment Date:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="max-w-xs"
                placeholder="Start Date"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="max-w-xs"
                placeholder="End Date"
              />
              <Button
                onClick={() => {
                  if (startDate && endDate) {
                    setDateFilterActive(true)
                    toast.success('Date filter applied!')
                  } else {
                    toast.error('Please select both start and end dates')
                  }
                }}
                variant="outline"
                size="sm"
              >
                Apply Date Filter
              </Button>
              {dateFilterActive && (
                <Button
                  onClick={() => {
                    setDateFilterActive(false)
                    setStartDate('')
                    setEndDate('')
                    toast.success('Date filter cleared!')
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Clear Date Filter
                </Button>
              )}
            </div>
          </div>

          {/* Payments Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Booking Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium font-mono">{payment.transactionId}</p>
                        <p className="text-sm text-gray-600">#{payment.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={payment.customerAvatar || ''} alt={payment.customerName || 'Customer'} />
                          <AvatarFallback>
                            {payment.customerName ? payment.customerName.split(' ').map(n => n[0]).join('').toUpperCase() : 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{payment.customerName || 'Unknown Customer'}</p>
                          <p className="text-sm text-gray-600">{payment.customerEmail || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Booking #{payment.bookingId}</p>
                        <p className="text-sm text-gray-600">{payment.carName}</p>
                        <p className="text-sm text-gray-600">{payment.pickupLocation}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        {payment.refundAmount > 0 && (
                          <p className="text-sm text-red-600">Refund: {formatCurrency(payment.refundAmount)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMethodBadgeColor(payment.method)}>
                        {payment.method.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDate(payment.createdAt)}</p>
                        <p className="text-sm text-gray-600">{formatDateTime(payment.createdAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                              <DialogDescription>
                                Complete payment information for transaction {payment.transactionId}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedPayment && (
                              <div className="space-y-6">
                                {/* Payment Header */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-xl font-semibold">Transaction {selectedPayment.transactionId}</h3>
                                    <p className="text-gray-600">Payment ID: {selectedPayment.id}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge className={getStatusBadgeColor(selectedPayment.status)}>
                                        {selectedPayment.status}
                                      </Badge>
                                      <Badge className={getMethodBadgeColor(selectedPayment.method)}>
                                        {selectedPayment.method.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold">{formatCurrency(selectedPayment.amount)}</p>
                                    <p className="text-sm text-gray-600">Total Amount</p>
                                  </div>
                                </div>

                                {/* Customer Information */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Customer Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Name</p>
                                      <p className="font-medium">{selectedPayment.customerName || 'Unknown'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Email</p>
                                      <p className="font-medium">{selectedPayment.customerEmail || 'No email'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Phone</p>
                                      <p className="font-medium">{selectedPayment.customerPhone || 'No phone'}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Booking Information */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    Booking Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Booking ID</p>
                                      <p className="font-medium">#{selectedPayment.bookingId}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Car</p>
                                      <p className="font-medium">{selectedPayment.carName}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Pickup Location</p>
                                      <p className="font-medium">{selectedPayment.pickupLocation}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Duration</p>
                                      <p className="font-medium">{selectedPayment.duration} days</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Details */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Details
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Payment Method</p>
                                      <p className="font-medium">{selectedPayment.method.toUpperCase()}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Gateway</p>
                                      <p className="font-medium">{selectedPayment.gateway || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Gateway Transaction ID</p>
                                      <p className="font-medium font-mono">{selectedPayment.gatewayTransactionId || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Gateway Response</p>
                                      <p className="font-medium">{selectedPayment.gatewayResponse || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Refund Information */}
                                {selectedPayment.refundAmount > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4" />
                                      Refund Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-red-600">Refund Amount</p>
                                        <p className="font-medium text-red-800">{formatCurrency(selectedPayment.refundAmount)}</p>
                                      </div>
                                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-red-600">Refund Date</p>
                                        <p className="font-medium text-red-800">{formatDateTime(selectedPayment.refundDate)}</p>
                                      </div>
                                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-red-600">Refund Reason</p>
                                        <p className="font-medium text-red-800">{selectedPayment.refundReason || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Timestamps */}
                                <div>
                                  <h4 className="font-medium mb-3">Timestamps</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-sm text-gray-600">Created At</p>
                                      <p className="font-medium">{formatDateTime(selectedPayment.createdAt)}</p>
                                    </div>
                                    {selectedPayment.updatedAt && (
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Updated At</p>
                                        <p className="font-medium">{formatDateTime(selectedPayment.updatedAt)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
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
