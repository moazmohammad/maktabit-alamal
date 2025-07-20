"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getProductById, type Product } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCartIcon, StarIcon } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/store/cart" // Import the cart store
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { toast } = useToast()
  const addItemToCart = useCartStore((state) => state.addItem) // Get addItem action from store

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mainImage, setMainImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getProductById(productId)
        if (fetchedProduct) {
          setProduct(fetchedProduct)
          if (fetchedProduct.images && fetchedProduct.images.length > 0) {
            setMainImage(fetchedProduct.images[0])
          }
        } else {
          setError("المنتج غير موجود.")
          toast({
            title: "خطأ",
            description: "المنتج المطلوب غير موجود.",
            variant: "destructive",
          })
        }
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب بيانات المنتج: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (productId) {
      fetchProduct()
    }
  }, [productId, toast])

  const handleAddToCart = () => {
    if (product) {
      addItemToCart(product)
      toast({
        title: "تمت الإضافة إلى السلة",
        description: `تمت إضافة "${product.name}" إلى سلة التسوق.`,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل المنتج...</p>
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

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">المنتج غير موجود.</p>
      </div>
    )
  }

  const stockStatus =
    product.stock > 10 ? "متوفر" : product.stock > 0 ? `كمية محدودة (${product.stock})` : "نفد المخزون"
  const stockColor = product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-orange-500" : "text-red-600"

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 pr-6">
        <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الصفحة الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">المنتجات</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      

        {/* Product Image Gallery */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md aspect-square relative overflow-hidden rounded-lg border">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              style={{ objectFit: "contain" }}
              className="transition-transform duration-300 hover:scale-105"
              priority // Prioritize loading for main product image
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 flex-shrink-0 rounded-md border overflow-hidden relative ${
                    mainImage === img ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    style={{ objectFit: "contain" }}
                    className="transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-semibold text-gray-800">{product.price.toFixed(2)} جنيه</p>
          <p className={`text-sm font-medium ${stockColor}`}>{stockStatus}</p>

          <Separator />

          <div className="prose max-w-none text-gray-700">
            <h2 className="text-xl font-semibold mb-2">الوصف</h2>
            <p>{product.description}</p>
          </div>

          <Button
            size="lg"
            className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-white"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCartIcon className="w-5 h-5 ml-2" />
            أضف إلى السلة
          </Button>

          {/* Customer Reviews Section (Placeholder) */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">تقييمات ومراجعات العملاء</h2>
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                <StarIcon className="w-5 h-5 fill-current" />
                <StarIcon className="w-5 h-5 fill-current" />
                <StarIcon className="w-5 h-5 fill-current" />
                <StarIcon className="w-5 h-5 fill-current" />
                <StarIcon className="w-5 h-5 text-gray-300" />
                <span className="text-gray-600 ml-2">(4.0 من 5 نجوم)</span>
              </div>
              <p className="text-gray-500">لا توجد مراجعات بعد. كن أول من يراجع هذا المنتج!</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                اكتب مراجعة
              </Button>
            </CardContent>
          </Card>

          {/* Related Products Section (Placeholder) */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">قد يعجبك أيضًا</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Placeholder for related products */}
                <div className="flex flex-col items-center text-center">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="منتج ذو صلة"
                    width={100}
                    height={100}
                    className="rounded-md mb-2"
                  />
                  <p className="text-sm font-medium">منتج ذو صلة 1</p>
                  <p className="text-xs text-gray-600">25.00 جنيه</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="منتج ذو صلة"
                    width={100}
                    height={100}
                    className="rounded-md mb-2"
                  />
                  <p className="text-sm font-medium">منتج ذو صلة 2</p>
                  <p className="text-xs text-gray-600">30.00 جنيه</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
