"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon } from "lucide-react"
import { addCategory, getCategories, updateCategory, deleteCategory, type Category } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
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

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id!, {
          name: categoryName,
          description: categoryDescription,
        })
        toast({
          title: "نجاح",
          description: "تم تحديث التصنيف بنجاح.",
        })
      } else {
        // Add new category
        await addCategory({
          name: categoryName,
          description: categoryDescription,
        })
        toast({
          title: "نجاح",
          description: "تم إضافة التصنيف بنجاح.",
        })
      }
      setIsDialogOpen(false)
      setEditingCategory(null)
      setCategoryName("")
      setCategoryDescription("")
      fetchCategories() // Re-fetch categories to update the list
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: `فشل حفظ التصنيف: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا التصنيف؟")) {
      return
    }
    try {
      await deleteCategory(id)
      toast({
        title: "نجاح",
        description: "تم حذف التصنيف بنجاح.",
      })
      fetchCategories() // Re-fetch categories to update the list
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: `فشل حذف التصنيف: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const openAddDialog = () => {
    setEditingCategory(null)
    setCategoryName("")
    setCategoryDescription("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryDescription(category.description || "")
    setIsDialogOpen(true)
  }

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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="icon">
              <ChevronLeftIcon className="w-4 h-4" />
              <span className="sr-only">العودة إلى لوحة التحكم</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
        </div>
        <Button onClick={openAddDialog}>
          <PlusIcon className="w-4 h-4 ml-2" />
          إضافة تصنيف جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة التصنيفات</CardTitle>
          <CardDescription>عرض وتعديل وحذف التصنيفات الموجودة في المتجر.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد تصنيفات بعد. ابدأ بإضافة تصنيف جديد!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || "لا يوجد وصف"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(category)}>
                          <PencilIcon className="w-4 h-4" />
                          <span className="sr-only">تعديل</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(category.id!)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "عدّل معلومات التصنيف." : "املأ المعلومات لإنشاء تصنيف جديد."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddOrEdit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">اسم التصنيف</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryDescription">الوصف (اختياري)</Label>
              <Textarea
                id="categoryDescription"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
