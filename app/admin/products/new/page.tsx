"use client"

import type React from "react"
import { useState, useEffect } from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeftIcon, XIcon } from "lucide-react"
import { addProduct, getCategories, type Category } from "@/lib/firestore" // Import getCategories and Category type
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Import Select components

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "", // This will store the selected category ID or name
    seoTitle: "",
    seoDescription: "",
    images: [], // To store image URLs
  })
  const [newImageUrl, setNewImageUrl] = useState("") // State for new image URL input
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([]) // State to store fetched categories
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)
      } catch (err: any) {
        setCategoriesError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب التصنيفات: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategoriesData()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setProduct((prev) => ({ ...prev, [id]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setProduct((prev) => ({ ...prev, category: value }))
  }

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && !product.images.includes(newImageUrl.trim())) {
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }))
      setNewImageUrl("") // Clear input after adding
      toast({
        title: "تمت إضافة الرابط",
        description: "تمت إضافة رابط الصورة بنجاح.",
      })
    } else if (newImageUrl.trim() && product.images.includes(newImageUrl.trim())) {
      toast({
        title: "تنبيه",
        description: "هذا الرابط موجود بالفعل.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const productData = {
        ...product,
        price: Number.parseFloat(product.price),
        stock: Number.parseInt(product.stock),
        images: product.images, // Use the URLs directly
      }
      const productId = await addProduct(productData)
      console.log("Product added with ID:", productId)

      toast({
        title: "نجاح",
        description: "تم إضافة المنتج بنجاح.",
      })
      router.push("/admin/products")
    } catch (err: any) {
      console.error("Error during product submission:", err)
      toast({
        title: "خطأ",
        description: `فشل إضافة المنتج: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="sr-only">العودة</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">إضافة منتج جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>تفاصيل المنتج</CardTitle>
            <CardDescription>املأ المعلومات الأساسية للمنتج.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم المنتج</Label>
              <Input id="name" placeholder="قلم حبر جاف" value={product.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                placeholder="وصف مفصل للمنتج..."
                value={product.description}
                onChange={handleChange}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">السعر (جنيه)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="15.00"
                  value={product.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">الكمية في المخزون</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="100"
                  value={product.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">القسم</Label>
              {categoriesLoading ? (
                <p className="text-gray-500">جاري تحميل التصنيفات...</p>
              ) : categoriesError ? (
                <p className="text-red-500">خطأ في تحميل التصنيفات: {categoriesError}</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500">لا توجد تصنيفات. يرجى إضافة تصنيف أولاً.</p>
              ) : (
                <Select value={product.category} onValueChange={handleCategoryChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قسمًا" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {" "}
                        {/* Using category name as value */}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>الصور و SEO</CardTitle>
            <CardDescription>أضف صور المنتج ومعلومات تحسين محركات البحث.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">رابط صورة المنتج</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button type="button" onClick={handleAddImageUrl}>
                  إضافة
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Product Image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">إزالة الصورة</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoTitle">عنوان SEO (Meta Title)</Label>
              <Input id="seoTitle" placeholder="عنوان جذاب للمنتج" value={product.seoTitle} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoDescription">وصف SEO (Meta Description)</Label>
              <Textarea
                id="seoDescription"
                placeholder="وصف موجز للمنتج لمحركات البحث"
                value={product.seoDescription}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end gap-2">
          <Link href="/admin/products">
            <Button variant="outline">إلغاء</Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? "جاري الإضافة..." : "حفظ المنتج"}
          </Button>
        </div>
      </form>
    </div>
  )
}
