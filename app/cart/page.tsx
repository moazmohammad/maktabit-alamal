"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCartStore } from "@/store/cart"
import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon"

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, clearCart, getTotalItems, getTotalPrice } = useCartStore()

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateItemQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeItem(productId)
  }

  const handleClearCart = () => {
    if (confirm("هل أنت متأكد أنك تريد مسح عربة التسوق بالكامل؟")) {
      clearCart()
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4 text-center">
        <ShoppingCartIcon className="w-24 h-24 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">عربة التسوق فارغة</h1>
        <p className="text-lg text-gray-600 mb-8">يبدو أنك لم تضف أي شيء بعد. ابدأ بالتسوق!</p>
        <Link href="/products">
          <Button size="lg" className="bg-gray-800 hover:bg-gray-700 text-white">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">عربة التسوق الخاصة بك</h1>

      <Card className="mb-8">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] hidden sm:table-cell">المنتج</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead className="text-center">الكمية</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      style={{ objectFit: "contain" }}
                      className="rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/products/${item.productId}`} className="hover:underline">
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell>{item.price.toFixed(2)} جنيه</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id!, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id!, item.quantity + 1)}
                        disabled={item.quantity >= item.stock} // Disable if quantity reaches stock limit
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)} جنيه</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveItem(item.id!)}>
                      <TrashIcon className="w-4 h-4" />
                      <span className="sr-only">إزالة</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="text-lg font-semibold">
          <p>إجمالي عدد المنتجات: {getTotalItems()}</p>
          <p className="text-2xl font-bold mt-2">الإجمالي الكلي: {getTotalPrice().toFixed(2)} جنيه</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearCart} disabled={items.length === 0}>
            مسح عربة التسوق
          </Button>
          {/* زر متابعة الشراء - تم إزالة خاصية disabled */}
          <Link href="/checkout">
            {" "}
            {/* إضافة رابط لصفحة الدفع */}
            <Button size="lg" className="bg-gray-800 hover:bg-gray-700 text-white" disabled={items.length === 0}>
              متابعة الشراء
            </Button>
          </Link>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-gray-600">
        <p>
          <Link href="/products" className="text-blue-600 hover:underline">
            الاستمرار في التسوق
          </Link>
        </p>
      </div>
    </div>
  )
}
