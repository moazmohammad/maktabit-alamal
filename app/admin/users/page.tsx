"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ar } from "date-fns/locale" // For Arabic locale

interface User {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  disabled: boolean
  emailVerified: boolean
  creationTime: string
  lastSignInTime: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/users")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch users")
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "خطأ",
          description: `فشل جلب المستخدمين: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">إدارة المستخدمين</CardTitle>
          <CardDescription>عرض وإدارة حسابات المستخدمين المسجلين.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">جاري تحميل المستخدمين...</p>
          ) : error ? (
            <p className="text-center text-red-500">خطأ: {error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500">لا يوجد مستخدمون لعرضهم.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>اسم العرض</TableHead>
                    <TableHead>معرف المستخدم (UID)</TableHead>
                    <TableHead>تم التحقق من البريد</TableHead>
                    <TableHead>معطل</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>آخر تسجيل دخول</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.email || "غير متوفر"}</TableCell>
                      <TableCell>{user.displayName || "غير متوفر"}</TableCell>
                      <TableCell className="text-sm text-gray-500">{user.uid}</TableCell>
                      <TableCell>{user.emailVerified ? "نعم" : "لا"}</TableCell>
                      <TableCell>{user.disabled ? "نعم" : "لا"}</TableCell>
                      <TableCell>
                        {user.creationTime
                          ? format(new Date(user.creationTime), "dd MMMM yyyy, hh:mm a", { locale: ar })
                          : "غير متوفر"}
                      </TableCell>
                      <TableCell>
                        {user.lastSignInTime
                          ? format(new Date(user.lastSignInTime), "dd MMMM yyyy, hh:mm a", { locale: ar })
                          : "غير متوفر"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
