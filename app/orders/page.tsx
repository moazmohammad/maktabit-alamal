"use client"

import { CardDescription } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getOrders, updateOrder, deleteOrder, type Order } from "@/lib/firestore" // استيراد updateOrder و deleteOrder
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { EyeIcon, TrashIcon } from "lucide-react" // استيراد TrashIcon
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // استيراد Select

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [toast])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedOrders = await getOrders()
      setOrders(fetchedOrders)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "خطأ",
        description: `فشل جلب الطلبات: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrder(orderId, { status: newStatus })
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
      )
      toast({
        title: "نجاح",
        description: "تم تحديث حالة الطلب بنجاح.",
      })
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: `فشل تحديث حالة الطلب: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return
    }
    try {
      await deleteOrder(orderId)
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
      toast({
        title: "نجاح",
        description: "تم حذف الطلب بنجاح.",
      })
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: `فشل حذف الطلب: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل الطلبات...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">حدث خطأ: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
        {/* <Link href="/admin/orders/new">
          <Button>
            <PlusIcon className="w-4 h-4 ml-2" />
            إضافة طلب جديد (قريباً)
          </Button>
        </Link> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
          <CardDescription>عرض وتتبع الطلبات الواردة.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد طلبات بعد.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>معرف الطلب</TableHead>
                  <TableHead>العميل (معرف المستخدم)</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الطلب</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id?.substring(0, 8)}...</TableCell>
                    <TableCell>{order.totalPrice.toFixed(2)} جنيه</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id!, value as Order["status"])}
                      >
                        <SelectTrigger className="w-[140px] h-auto py-1 px-2 text-sm">
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
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="icon">
                            <EyeIcon className="w-4 h-4" />
                            <span className="sr-only">عرض التفاصيل</span>
                          </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteOrder(order.id!)}>
                          <TrashIcon className="w-4 h-4" />
                          <span className="sr-only">حذف الطلب</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
