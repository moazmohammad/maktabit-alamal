"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon } from "lucide-react"

interface AboutUsContent {
  title: string
  description: string
}

export default function AboutUsPage() {
  const { toast } = useToast()
  const [content, setContent] = useState<AboutUsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAboutUsContent = async () => {
      setLoading(true)
      setError(null)
      try {
        const docRef = doc(db, "content", "aboutUs")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setContent(docSnap.data() as AboutUsContent)
        } else {
          setContent({ title: "من نحن", description: "لم يتم إضافة محتوى لصفحة من نحن بعد." })
        }
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب محتوى "من نحن": ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAboutUsContent()
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري تحميل محتوى "من نحن"...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 text-center">حدث خطأ: {error}</p>
        <Link href="/" className="mt-4">
          <Button variant="outline">
            <ChevronLeftIcon className="w-4 h-4 ml-2" />
            العودة إلى الصفحة الرئيسية
          </Button>
        </Link>
      </div>
    )
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{content?.title || "من نحن"}</h1>
      </div>

      <Card>
        <CardContent className="p-6 text-gray-700 leading-relaxed">
          <p>
            {content?.description || "لم يتم إضافة محتوى لصفحة من نحن بعد. يرجى زيارة لوحة تحكم المدير لإضافة المحتوى."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
