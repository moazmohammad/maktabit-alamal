"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { BookIcon, MenuIcon, ShoppingCartIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { useCartStore } from "@/store/cart"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const { logout } = useAuth()
  const getTotalItems = useCartStore((state) => state.getTotalItems)

  useEffect(() => {
    if (typeof window !== "undefined" && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
      })
      return () => unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await logout()
  }
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <BookIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">مكتبة الأمل</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-primary dark:text-gray-300" prefetch={false}>
            المنتجات
          </Link>
          <Link href="/categories" className="text-gray-600 hover:text-primary dark:text-gray-300" prefetch={false}>
            التصنيفات
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-primary dark:text-gray-300" prefetch={false}>
            من نحن
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-primary dark:text-gray-300" prefetch={false}>
            اتصل بنا
          </Link>
          {user && (
            <Link href="/orders" className="text-gray-600 hover:text-primary dark:text-gray-300" prefetch={false}>
              طلباتي
            </Link>
          )}
          {user &&
            user.email === "admin@example.com" && ( // Simple admin check
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-primary dark:text-gray-300"
                prefetch={false}
              >
                لوحة التحكم
              </Link>
            )}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative" prefetch={false}>
            <Button variant="ghost" size="icon">
              <ShoppingCartIcon className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
              <span className="sr-only">عربة التسوق</span>
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">قائمة المستخدم</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile" prefetch={false}>
                    ملفي الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>تسجيل الخروج</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" prefetch={false}>
                <Button variant="outline" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">قائمة التنقل</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/products" prefetch={false}>
                  المنتجات
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/categories" prefetch={false}>
                  التصنيفات
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/about" prefetch={false}>
                  من نحن
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/contact" prefetch={false}>
                  اتصل بنا
                </Link>
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem>
                  <Link href="/orders" prefetch={false}>
                    طلباتي
                  </Link>
                </DropdownMenuItem>
              )}
              {user && user.email === "admin@example.com" && (
                <DropdownMenuItem>
                  <Link href="/admin/dashboard" prefetch={false}>
                    لوحة التحكم
                  </Link>
                </DropdownMenuItem>
              )}
              {user ? (
                <>
                  <DropdownMenuItem>
                    <Link href="/profile" prefetch={false}>
                      ملفي الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>تسجيل الخروج</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem>
                  <Link href="/login" prefetch={false}>
                    تسجيل الدخول
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
