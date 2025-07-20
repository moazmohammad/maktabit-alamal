"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { deleteProduct, getProducts, type Product } from "@/lib/firestore" // Import Firestore functions
import { useToast } from "@/hooks/use-toast" // Assuming you have useToast hook from shadcn/ui

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts()
        setProducts(fetchedProducts)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب المنتجات: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [toast])

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟")) {
      return
    }
    try {
      await deleteProduct(id)
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id))
      toast({
        title: "نجاح",
        description: "تم حذف المنتج بنجاح.",
      })
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: `فشل حذف المنتج: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل المنتجات...</p>
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
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <Link href="/admin/products/new">
          <Button>
            <PlusIcon className="w-4 h-4 ml-2" />
            إضافة منتج جديد
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>عرض وتعديل وحذف المنتجات الموجودة في المتجر.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد منتجات بعد. ابدأ بإضافة منتج جديد!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.price.toFixed(2)} جنيه</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <PencilIcon className="w-4 h-4" />
                            <span className="sr-only">تعديل</span>
                          </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                          <TrashIcon className="w-4 h-4" />
                          <span className="sr-only">حذف</span>
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
