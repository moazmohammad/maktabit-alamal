"use client"

import { useEffect, useState } from "react"
import { getProducts, getCategories, type Product, type Category } from "@/lib/firestore" // Import getCategories
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input" // Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Import Select components
import { useToast } from "@/hooks/use-toast"
import { ShoppingCartIcon } from "lucide-react" // Import ShoppingCartIcon
import { useCartStore } from "@/store/cart" // Import the cart store

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all") // State for selected category
  const { toast } = useToast()
  const addItemToCart = useCartStore((state) => state.addItem) // Get addItem action from store

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch products based on search term and selected category
        const fetchedProducts = await getProducts(searchTerm, selectedCategory)
        setProducts(fetchedProducts)

        // Fetch categories for the filter dropdown
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب المنتجات أو التصنيفات: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProductsAndCategories()
  }, [searchTerm, selectedCategory, toast]) // Re-fetch when search term or category changes

  const handleAddToCart = (product: Product) => {
    addItemToCart(product)
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة "${product.name}" إلى سلة التسوق.`,
    })
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
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">جميع المنتجات</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="ابحث عن منتجات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="تصفية حسب التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التصنيفات</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد منتجات مطابقة لمعايير البحث أو التصفية.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
              <Link href={`/products/${product.id}`} className="block">
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
              </Link>
              <div className="p-4 pt-0">
                <Button
                  size="sm"
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCartIcon className="w-4 h-4 ml-2" />
                  أضف إلى السلة
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
