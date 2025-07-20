"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/cart"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { addOrder, type OrderItem } from "@/lib/firestore" // Import addOrder and OrderItem

type OrderData = {
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    imageUrl: string | null  // Changed from undefined to null
  }[]
  totalPrice: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { toast } = useToast()
  const router = useRouter()

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Egypt", // Default country
  })
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery") // Default payment method
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setShippingAddress((prev) => ({ ...prev, [id]: value }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
  }

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setCustomerInfo((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "عربة التسوق فارغة. لا يمكن إتمام الطلب.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Prepare order items from cart items
    const orderItems = items.map((item) => ({
      productId: item.id ?? '',  // Provide default empty string if id is null
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.images && item.images.length > 0 ? item.images[0] : null  // Use null instead of undefined
    }))

    const orderData: OrderData = {
      items: orderItems,
      totalPrice: getTotalPrice(),
      status: "pending",
      customerInfo: customerInfo,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod
    }

    try {
      const orderId = await addOrder(orderData)
      toast({
        title: "تم الطلب بنجاح!",
        description: `تم إنشاء طلبك برقم: ${orderId.substring(0, 8)}.`,
      })
      clearCart() // Clear cart after successful order
      router.push(`/orders/${orderId}`) // Redirect to order details page
    } catch (err: any) {
      console.error("Error submitting order:", err)
      toast({
        title: "خطأ في الطلب",
        description: `فشل إتمام طلبك: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">إتمام عملية الشراء</h1>

      <form onSubmit={handleSubmitOrder} className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span>{(item.price * item.quantity).toFixed(2)} جنيه</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>الإجمالي الكلي:</span>
              <span>{getTotalPrice().toFixed(2)} جنيه</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>معلومات الشحن</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                placeholder="الشارع، رقم المبنى، الشقة"
                value={shippingAddress.address}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  placeholder="القاهرة"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">المحافظة</Label>
                <Input
                  id="state"
                  placeholder="الفيوم"
                  value={shippingAddress.state}
                  onChange={handleShippingChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="zipCode">الرمز البريدي</Label>
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={shippingAddress.zipCode}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">البلد</Label>
                <Input
                  id="country"
                  value={shippingAddress.country}
                  onChange={handleShippingChange}
                  disabled // Country is fixed to Egypt for now
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                placeholder="الاسم الكامل"
                value={customerInfo.name}
                onChange={handleCustomerInfoChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="رقم الهاتف"
                value={customerInfo.phone}
                onChange={handleCustomerInfoChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                value={customerInfo.email}
                onChange={handleCustomerInfoChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method & Place Order */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>طريقة الدفع</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">اختر طريقة الدفع</Label>
              <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_on_delivery">الدفع عند الاستلام</SelectItem>
                  {/* <SelectItem value="credit_card">بطاقة الائتمان (قريباً)</SelectItem> */}
                  {/* <SelectItem value="paypal">باي بال (قريباً)</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === "cash_on_delivery" && (
              <p className="text-sm text-gray-600">سيتم الدفع نقدًا عند استلام الطلب.</p>
            )}
            {/* Add more payment method specific fields here if needed */}

            <Separator />

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? "جاري إتمام الطلب..." : "تأكيد الطلب"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
