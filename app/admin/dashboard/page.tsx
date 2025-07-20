"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProducts, getOrders } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboardPage() {
  const { logout, loading: authLoading, error: authError } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin")
      }
      // TODO: Implement actual role-based access control here
    })

    const fetchDashboardData = async () => {
      setDataLoading(true)
      setDataError(null)
      try {
        // Fetch products count
        const products = await getProducts()
        setTotalProducts(products.length)

        // Fetch orders count and total sales
        const orders = await getOrders()
        setTotalOrders(orders.length)
        const sales = orders.reduce((sum, order) => sum + order.totalPrice, 0)
        setTotalSales(sales)
      } catch (err: any) {
        setDataError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب بيانات لوحة التحكم: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()

    return () => unsubscribeAuth()
  }, [router, toast])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">لوحة تحكم المدير</h1>
      <p className="text-lg text-gray-700 mb-8">مرحباً بك في مركز قيادة مكتبة الأمل.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>إضافة، تعديل، وحذف المنتجات.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/products">
              <Button className="w-full">اذهب إلى المنتجات</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إدارة التصنيفات</CardTitle>
            <CardDescription>إضافة، تعديل، وحذف تصنيفات المنتجات.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/categories">
              <Button className="w-full">اذهب إلى التصنيفات</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إدارة الطلبات</CardTitle>
            <CardDescription>عرض وتحديث حالة الطلبات.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/orders">
              <Button className="w-full">اذهب إلى الطلبات</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إجمالي المنتجات</CardTitle>
            <CardDescription>عدد المنتجات المتوفرة في المتجر.</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <p className="text-gray-500">جاري التحميل...</p>
            ) : dataError ? (
              <p className="text-red-500">خطأ</p>
            ) : (
              <div className="text-4xl font-bold">{totalProducts}</div>
            )}
            <p className="text-sm text-gray-500 mt-2">منتج</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إجمالي الطلبات</CardTitle>
            <CardDescription>عدد الطلبات التي تم استلامها.</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <p className="text-gray-500">جاري التحميل...</p>
            ) : dataError ? (
              <p className="text-red-500">خطأ</p>
            ) : (
              <div className="text-4xl font-bold">{totalOrders}</div>
            )}
            <p className="text-sm text-gray-500 mt-2">طلب</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إجمالي المبيعات</CardTitle>
            <CardDescription>إجمالي الإيرادات من الطلبات.</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <p className="text-gray-500">جاري التحميل...</p>
            ) : dataError ? (
              <p className="text-red-500">خطأ</p>
            ) : (
              <div className="text-4xl font-bold">{totalSales.toFixed(2)} جنيه</div>
            )}
            <p className="text-sm text-gray-500 mt-2">إيرادات</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إدارة المحتوى</CardTitle>
            <CardDescription>التحكم في أقسام الصفحة الرئيسية والمدونة.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/content">
              {" "}
              {/* تم تغيير الرابط */}
              <Button className="w-full">اذهب إلى المحتوى</Button> {/* تم تغيير النص وإزالة disabled */}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إدارة المستخدمين</CardTitle>
            <CardDescription>عرض وإدارة حسابات المستخدمين.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">اذهب إلى المستخدمين</Button>
            </Link>
          </CardContent>
        </Card>
        {/* Add more cards for other modules as needed */}
      </div>
      <div className="mt-8">
        <Button onClick={handleLogout} disabled={authLoading} variant="destructive">
          {authLoading ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
        </Button>
        {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
      </div>
    </div>
  )
}
