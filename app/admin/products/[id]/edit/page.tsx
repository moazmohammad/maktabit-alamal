"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeftIcon, XIcon } from "lucide-react"
import { getProductById, updateProduct, getCategories, type Product, type Category } from "@/lib/firestore" // Import getCategories and Category type
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Import Select components

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("") // State for new image URL input
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([]) // State to store fetched categories
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        // Fetch product data
        const fetchedProduct = await getProductById(productId)
        if (fetchedProduct) {
          setProduct(fetchedProduct)
        } else {
          setError("المنتج غير موجود.")
          toast({
            title: "خطأ",
            description: "المنتج المطلوب غير موجود.",
            variant: "destructive",
          })
        }

        // Fetch categories
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب البيانات: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setCategoriesLoading(false)
      }
    }
    if (productId) {
      fetchProductAndCategories()
    }
  }, [productId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setProduct((prev) => (prev ? { ...prev, [id]: value } : null))
  }

  const handleCategoryChange = (value: string) => {
    setProduct((prev) => (prev ? { ...prev, category: value } : null))
  }

  const handleAddImageUrl = () => {
    if (!product) return
    if (newImageUrl.trim() && !product.images.includes(newImageUrl.trim())) {
      setProduct((prev) => (prev ? { ...prev, images: [...(prev.images || []), newImageUrl.trim()] } : null))
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
    if (!product) return
    // No need to delete from storage as we are using external URLs
    setProduct((prev) => (prev ? { ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) } : null))
    toast({
      title: "نجاح",
      description: "تم حذف رابط الصورة بنجاح.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !productId) return

    setSubmitting(true)
    try {
      await updateProduct(productId, {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        category: product.category, // Save the updated category
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        images: product.images, // Save the updated image URLs
      })
      toast({
        title: "نجاح",
        description: "تم تحديث المنتج بنجاح.",
      })
      router.push("/admin/products")
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: `فشل تحديث المنتج: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل بيانات المنتج...</p>
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
        <p className="text-gray-500">المنتج غير موجود أو حدث خطأ غير متوقع.</p>
      </div>
    )
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
        <h1 className="text-3xl font-bold">تعديل المنتج: {product.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>تفاصيل المنتج</CardTitle>
            <CardDescription>عدّل المعلومات الأساسية للمنتج.</CardDescription>
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
            <CardDescription>عدّل صور المنتج ومعلومات تحسين محركات البحث.</CardDescription>
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
                {product.images &&
                  product.images.map((img, index) => (
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
              <Input
                id="seoTitle"
                placeholder="عنوان جذاب للمنتج"
                value={product.seoTitle || ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoDescription">وصف SEO (Meta Description)</Label>
              <Textarea
                id="seoDescription"
                placeholder="وصف موجز للمنتج لمحركات البحث"
                value={product.seoDescription || ""}
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
            {submitting ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </form>
    </div>
  )
}
