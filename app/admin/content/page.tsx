"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function AdminContentPage() {
  const { toast } = useToast()
  const [aboutUsContent, setAboutUsContent] = useState({
    title: "",
    description: "",
  })
  const [contactUsContent, setContactUsContent] = useState({
    email: "",
    phone: "",
    address: "",
  })
  const [loadingAboutUs, setLoadingAboutUs] = useState(true)
  const [savingAboutUs, setSavingAboutUs] = useState(false)
  const [loadingContactUs, setLoadingContactUs] = useState(true)
  const [savingContactUs, setSavingContactUs] = useState(false)

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setLoadingAboutUs(true)
      try {
        const docRef = doc(db, "content", "aboutUs")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setAboutUsContent(docSnap.data() as { title: string; description: string })
        } else {
          console.log("No 'aboutUs' content found, initializing with empty values.")
        }
      } catch (error: any) {
        console.error("Error fetching about us content:", error)
        toast({
          title: "خطأ",
          description: `فشل جلب محتوى "من نحن": ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoadingAboutUs(false)
      }
    }

    const fetchContactUsContent = async () => {
      setLoadingContactUs(true)
      try {
        const docRef = doc(db, "content", "contactUs")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setContactUsContent(docSnap.data() as { email: string; phone: string; address: string })
        } else {
          console.log("No 'contactUs' content found, initializing with empty values.")
        }
      } catch (error: any) {
        console.error("Error fetching contact us content:", error)
        toast({
          title: "خطأ",
          description: `فشل جلب محتوى "اتصل بنا": ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoadingContactUs(false)
      }
    }

    fetchAboutUsContent()
    fetchContactUsContent()
  }, [toast])

  const handleSaveAboutUs = async () => {
    setSavingAboutUs(true)
    try {
      const docRef = doc(db, "content", "aboutUs")
      await setDoc(docRef, aboutUsContent, { merge: true })
      toast({
        title: "نجاح",
        description: "تم حفظ محتوى " + '"من نحن"' + " بنجاح.",
      })
    } catch (error: any) {
      console.error("Error saving about us content:", error)
      toast({
        title: "خطأ",
        description: `فشل حفظ محتوى "من نحن": ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSavingAboutUs(false)
    }
  }

  const handleSaveContactUs = async () => {
    setSavingContactUs(true)
    try {
      const docRef = doc(db, "content", "contactUs")
      await setDoc(docRef, contactUsContent, { merge: true })
      toast({
        title: "نجاح",
        description: "تم حفظ محتوى " + '"اتصل بنا"' + " بنجاح.",
      })
    } catch (error: any) {
      console.error("Error saving contact us content:", error)
      toast({
        title: "خطأ",
        description: `فشل حفظ محتوى "اتصل بنا": ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSavingContactUs(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="icon">
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="sr-only">العودة إلى لوحة التحكم</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">إدارة المحتوى</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>محتوى صفحة "من نحن"</CardTitle>
          <CardDescription>تعديل العنوان والوصف لصفحة "من نحن".</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loadingAboutUs ? (
            <p className="text-gray-500 text-center">جاري تحميل المحتوى...</p>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="aboutUsTitle">العنوان</Label>
                <Input
                  id="aboutUsTitle"
                  value={aboutUsContent.title}
                  onChange={(e) => setAboutUsContent((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="عنوان صفحة من نحن"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="aboutUsDescription">الوصف</Label>
                <Textarea
                  id="aboutUsDescription"
                  value={aboutUsContent.description}
                  onChange={(e) => setAboutUsContent((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="اكتب وصفًا مفصلاً عن متجرك..."
                  rows={6}
                />
              </div>
              <Button onClick={handleSaveAboutUs} disabled={savingAboutUs}>
                {savingAboutUs ? "جاري الحفظ..." : "حفظ محتوى " + '"من نحن"'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>محتوى صفحة "اتصل بنا"</CardTitle>
          <CardDescription>تعديل معلومات الاتصال لصفحة "اتصل بنا".</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loadingContactUs ? (
            <p className="text-gray-500 text-center">جاري تحميل المحتوى...</p>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactUsContent.email}
                  onChange={(e) => setContactUsContent((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="info@yourstore.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">رقم الهاتف</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactUsContent.phone}
                  onChange={(e) => setContactUsContent((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+20 123 456 7890"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactAddress">العنوان</Label>
                <Textarea
                  id="contactAddress"
                  value={contactUsContent.address}
                  onChange={(e) => setContactUsContent((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="الشارع، المدينة، البلد"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveContactUs} disabled={savingContactUs}>
                {savingContactUs ? "جاري الحفظ..." : "حفظ محتوى " + '"اتصل بنا"'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for other content management sections */}
      <Card>
        <CardHeader>
          <CardTitle>أقسام أخرى (قريباً)</CardTitle>
          <CardDescription>إدارة أقسام إضافية مثل المدونة، العروض، أو البانرات.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-lg text-gray-600 mb-4">المزيد من ميزات إدارة المحتوى قادمة قريباً!</p>
          <Button className="mt-6" disabled>
            ميزات جديدة قريباً
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
