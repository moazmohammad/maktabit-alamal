"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getProducts, type Product } from "@/lib/firestore"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

const Carousel = dynamic(() => import("@/components/ui/carousel/Carousel"), {
  loading: () => <p className="w-full h-[500px] bg-gray-200 animate-pulse"></p>,
})

const CarouselButtons = dynamic(
  () => import("@/components/ui/carousel/CarouselButtons"),
  {
    loading: () => <p className="w-full h-full bg-gray-100 animate-pulse"></p>,
  }
)

const CarouselDots = dynamic(
  () => import("@/components/ui/carousel/CarouselDots"),
  {
    loading: () => <p className="w-full h-full bg-gray-100 animate-pulse"></p>,
  }
)

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
   const [user, setUser] = useState<any>(null)
   const { toast } = useToast()
     const addItemToCart = useCartStore((state) => state.addItem) // Get addItem action from store

  const totalItemsInCart = useCartStore((state) => state.getTotalItems()) // Get total items from cart store

   const addToCart = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
         e.preventDefault()
         e.stopPropagation()
         addItemToCart(product)
      toast({
        title: "تمت الإضافة إلى السلة",
        description: `تمت إضافة "${product.name}" إلى سلة التسوق.`,
      })
   }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts()
        setLatestProducts(products.slice(0, 8))
      } catch (err: any) {
        console.error("Failed to fetch products:", err)
        setError("فشل تحميل المنتجات. يرجى المحاولة لاحقاً.")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

    useEffect(() => {
    if (typeof window !== "undefined" && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
      })
      return () => unsubscribe()
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white text-center p-4">
      {/* Header/Navigation (Placeholder - you might have a dedicated Header component) */}

      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-r from-gray-100 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">مرحباً بك في مكتبة الأمل</h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
              وجهتك ومجتمعك الإبداعي، حيث يلتقي الشغف بالمعرفة.
            </p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-gray-800 hover:bg-gray-700 text-white">
                  تصفح المنتجات
                </Button>
              </Link>
              {
                user && (
                                <Link href="/admin">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-800 text-gray-800 hover:bg-gray-100 bg-transparent"
                  >
                    لوحة التحكم
                  </Button>
                </Link>
                )
              }
  
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-12 md:py-16 lg:py-20 container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">وصل حديثًا</h2>
        {loading ? (
          <p className="text-gray-500 text-center">جاري تحميل المنتجات...</p>
        ) : error ? (
          <p className="text-red-500 text-center mb-4">{error}</p>
        ) : latestProducts.length === 0 ? (
          <p className="text-gray-500 text-center">لا توجد منتجات جديدة لعرضها حاليًا.</p>
        ) : (
          <Carousel
            data={latestProducts}
            CustomCard={({ id, name, price, stock, images, description, category, createdAt, updatedAt }: Product) => (
              <Link href={`/products/${id}`}>
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-full h-48 relative mb-4">
                      <Image
                        src={images && images.length > 0 ? images[0] : "/placeholder.svg"}
                        alt={name}
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-md"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{name}</h3>
                    <p className="text-xl font-bold text-gray-800">{price.toFixed(2)} جنيه</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {stock > 0 ? `متوفر: ${stock}` : "نفد المخزون"}
                    </p>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(e, { id, name, price, stock, images, description, category, createdAt, updatedAt });
                      }}
                    >
                      إضافة إلى السلة
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            )}
            CarouselButtons={CarouselButtons}
            CarouselDots={CarouselDots}
          />
        )}
      </section>

      {/* Placeholder for other sections (e.g., Bestsellers, Special Offers) */}
      <section className="py-12 md:py-16 lg:py-20 container mx-auto px-4 md:px-6 bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">الأكثر مبيعًا (قريباً)</h2>
        <p className="text-gray-500 text-center">سيتم عرض المنتجات الأكثر مبيعًا هنا.</p>
      </section>

      <section className="py-12 md:py-16 lg:py-20 container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">عروض خاصة (قريباً)</h2>
        <p className="text-gray-500 text-center">ترقبوا أحدث العروض والخصومات!</p>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-100 text-sm text-gray-500">
        <p>العنوان: ابشواي - الفيوم - مصر</p>
        <p>رقم الهاتف والواتساب وفودافون كاش: 01096126768</p>
      </footer>
    </div>
  )
}
