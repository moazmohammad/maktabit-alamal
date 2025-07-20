"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getOrderById, type Order, type OrderItem, updateOrder } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<Order["status"] | string>("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  console.log("order " , order)
  
     useEffect(() => {
    if (typeof window !== "undefined" && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
      })
      return () => unsubscribe()
    }
  }, [])


  useEffect(() => {
    console.log("OrderDetailPage component is rendering!") // Added for debugging
    const fetchOrder = async () => {
      try {
        const fetchedOrder = await getOrderById(orderId)
        if (fetchedOrder) {
          setOrder(fetchedOrder)
          setSelectedStatus(fetchedOrder.status) // تعيين الحالة الأولية من الطلب
        } else {
          setError("الطلب غير موجود.")
          toast({
            title: "خطأ",
            description: "الطلب المطلوب غير موجود.",
            variant: "destructive",
          })
        }
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب تفاصيل الطلب: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, toast])

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as Order["status"])
  }

  const handleUpdateStatus = async () => {
    if (!order || !order.id || !selectedStatus) return

    setIsUpdatingStatus(true)
    try {
      await updateOrder(order.id, { status: selectedStatus as Order["status"] })
      setOrder((prevOrder) => (prevOrder ? { ...prevOrder, status: selectedStatus as Order["status"] } : null))
      toast({
        title: "نجاح",
        description: "تم تحديث حالة الطلب بنجاح.",
      })
    } catch (err: any) {
      console.error("Error updating order status:", err)
      toast({
        title: "خطأ",
        description: `فشل تحديث حالة الطلب: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل تفاصيل الطلب...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 text-center">حدث خطأ: {error}</p>
        <Link href="/admin/dashboard" className="mt-4">
          <Button variant="outline">
            <ChevronLeftIcon className="w-4 h-4 ml-2" />
            <span className="sr-only">العودة إلى لوحة التحكم</span>
          </Button>
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">الطلب غير موجود أو حدث خطأ غير متوقع.</p>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard">
          {" "}
          {/* Will link to admin orders page later */}
          <Button variant="outline" size="icon">
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="sr-only">العودة</span>
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">تفاصيل الطلب #{order.id?.substring(0, 8)}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>معلومات الطلب</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {
              user ? (
            <p>
              <span className="font-semibold">حالة الطلب:</span>{" "}
              <Select value={selectedStatus} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
                <SelectTrigger className="inline-flex h-auto py-1 px-2 text-sm">
                  <SelectValue placeholder="اختر حالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </p>
              ):(
                <div className="flex items-center justify-center h-12 gap-2 text-lg font-semibold text-gray-800">
                    <p>
                      حالة الطلب:
                    </p>
                                       <span>
        {selectedStatus === "pending" && "قيد الانتظار"}
        {selectedStatus === "processing" && "قيد المعالجة"}
        {selectedStatus === "shipped" && "تم الشحن"}
        {selectedStatus === "delivered" && "تم التسليم"}
        {selectedStatus === "cancelled" && "ملغي"}
      </span>
                </div>
              )
            }

            <p>
              <span className="font-semibold">تاريخ الطلب:</span> {formatDate(order.createdAt)}
            </p>
            <p>
              <span className="font-semibold">آخر تحديث:</span> {formatDate(order.updatedAt)}
            </p>
            <p>
              <span className="font-semibold">إجمالي السعر:</span> {order.totalPrice.toFixed(2)} جنيه
            </p>
            <p>
              <span className="font-semibold">طريقة الدفع:</span> {order.paymentMethod}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>عنوان الشحن</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </CardContent>
        </Card>

<Card className="md:col-span-2 lg:col-span-1">
  <CardHeader>
    <CardTitle>معلومات العميل</CardTitle>
  </CardHeader>
  <CardContent className="grid gap-2 text-sm">
    <p>
      <span className="font-semibold">الاسم:</span>{" "}
      {order.customerInfo.name}
    </p>
    <p>
      <span className="font-semibold">البريد الإلكتروني:</span>{" "}
      {order.customerInfo.email}
    </p>
    <p>
      <span className="font-semibold">رقم الهاتف:</span>{" "}
      {order.customerInfo.phone}
    </p>
  </CardContent>
</Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>المنتجات في الطلب</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell">الصورة</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: OrderItem, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        width={0}
                        height={0}
                        style={{ objectFit: "contain" }}
                        className="rounded-md w-[60px] h-[60px]"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/products/${item.productId}`} className="hover:underline">
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)} جنيه</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
