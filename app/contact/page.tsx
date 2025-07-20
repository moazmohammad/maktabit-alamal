"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ChevronLeftIcon, MailIcon, PhoneIcon, MapPinIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface ContactUsContent {
  email: string
  phone: string
  address: string
}

export default function ContactUsPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactContent, setContactContent] = useState<ContactUsContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [errorContent, setErrorContent] = useState<string | null>(null)

  useEffect(() => {
    const fetchContactUsContent = async () => {
      setLoadingContent(true)
      setErrorContent(null)
      try {
        const docRef = doc(db, "content", "contactUs")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setContactContent(docSnap.data() as ContactUsContent)
        } else {
          // Default content if not found in Firestore
          setContactContent({
            email: "info@maktabat-al-amal.com", // Fallback default
            phone: "+20 109 12345678", // Fallback default
            address: "القاهرة, مصر", // Fallback default
          })
          console.log("No 'contactUs' document found in Firestore. Using default fallback values.")
        }
      } catch (err: any) {
        setErrorContent(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب محتوى "اتصل بنا": ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoadingContent(false)
      }
    }
    fetchContactUsContent()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "تم إرسال رسالتك!",
          description: result.message,
          variant: "success",
        })
        setFormData({ name: "", email: "", subject: "", message: "" }) // Clear form
      } else {
        throw new Error(result.message || "فشل إرسال الرسالة.")
      }
    } catch (err: any) {
      console.error("Error submitting contact form:", err)
      toast({
        title: "خطأ في الإرسال",
        description: `فشل إرسال رسالتك: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="sr-only">العودة إلى الصفحة الرئيسية</span>
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">اتصل بنا</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أرسل لنا رسالة</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" placeholder="اسمك الكامل" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">الموضوع</Label>
                <Input id="subject" placeholder="موضوع رسالتك" value={formData.subject} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">رسالتك</Label>
                <Textarea
                  id="message"
                  placeholder="اكتب رسالتك هنا..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الاتصال</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-gray-700">
            {loadingContent ? (
              <p className="text-gray-500 text-center">جاري تحميل معلومات الاتصال...</p>
            ) : errorContent ? (
              <p className="text-red-500 text-center">حدث خطأ: {errorContent}</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <MailIcon className="w-5 h-5 text-gray-600" />
                  <span>{contactContent?.email || "غير متوفر"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-600" />
                  <span>{contactContent?.phone || "غير متوفر"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-600" />
                  <span>{contactContent?.address || "غير متوفر"}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
