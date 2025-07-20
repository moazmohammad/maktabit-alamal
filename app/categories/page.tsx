"use client"

import { useEffect, useState } from "react"
import { getCategories, type Category } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب التصنيفات: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل التصنيفات...</p>
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
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">تصفح حسب التصنيف</h1>

      {categories.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد تصنيفات متاحة حاليًا.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${encodeURIComponent(category.name)}`}>
              <Card className="h-full flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600 line-clamp-3">{category.description || "لا يوجد وصف."}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
