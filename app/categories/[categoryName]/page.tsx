"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getProductsByCategory, type Product } from "@/lib/firestore"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon } from "lucide-react"

export default function ProductsByCategoryPage() {
  const params = useParams()
  const categoryName = decodeURIComponent(params.categoryName as string) // Decode the category name from URL
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProductsByCategory(categoryName)
        setProducts(fetchedProducts)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب المنتجات للتصنيف "${categoryName}": ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (categoryName) {
      fetchProducts()
    }
  }, [categoryName, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل المنتجات في تصنيف "{categoryName}"...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 text-center">حدث خطأ: {error}</p>
        <Link href="/categories" className="mt-4">
          <Button variant="outline">
            <ChevronLeftIcon className="w-4 h-4 ml-2" />
            العودة إلى التصنيفات
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/categories">
          <Button variant="outline" size="icon">
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="sr-only">العودة إلى التصنيفات</span>
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">منتجات في تصنيف: {categoryName}</h1>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد منتجات في هذا التصنيف حاليًا.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-full h-48 relative mb-4">
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain" }}
                      className="rounded-md"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xl font-bold text-gray-800">{product.price.toFixed(2)} جنيه</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {product.stock > 0 ? `متوفر: ${product.stock}` : "نفد المخزون"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
