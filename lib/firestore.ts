// lib/firestore.ts
import { db, storage } from "@/lib/firebase" // Import storage
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  type QueryFieldFilterConstraint,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

// Define Product type for better type safety
export interface Product {
  id?: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  seoTitle?: string
  seoDescription?: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}

// Define Category type
export interface Category {
  id?: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Define CartItem type (for storing in order)
export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string | null  // Changed from undefined to null
}

export type Order = {
  id?: string
  items: OrderItem[]
  totalPrice: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  updatedAt: Date
  paymentMethod: string
  shippingAddress: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  customerInfo: {
    name: string
    email: string
    phone: string
  }
}

const productsCollectionRef = collection(db, "products")
const categoriesCollectionRef = collection(db, "categories")
const ordersCollectionRef = collection(db, "orders") // New collection reference for orders

// Function to add a new product
export async function addProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const newProduct: Product = {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const docRef = await addDoc(productsCollectionRef, newProduct)
    return docRef.id
  } catch (e) {
    console.error("Error adding document: ", e)
    throw new Error("Failed to add product.")
  }
}

// Function to get all products with optional search and category filters (UPDATED)
export async function getProducts(searchTerm?: string, category?: string): Promise<Product[]> {
  try {
    const queryConstraints: QueryFieldFilterConstraint[] = []

    if (category && category !== "all") {
      queryConstraints.push(where("category", "==", category))
    }

    const q = query(productsCollectionRef, ...queryConstraints, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    let products: Product[] = []
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })

    // Client-side filtering for search term if present
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          product.description.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }

    return products
  } catch (e) {
    console.error("Error getting documents: ", e)
    throw new Error("Failed to fetch products.")
  }
}

// Function to get products by category (kept for direct use if needed, but getProducts now handles it)
export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  try {
    const q = query(productsCollectionRef, where("category", "==", categoryName), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const products: Product[] = []
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })
    return products
  } catch (e) {
    console.error(`Error getting products for category ${categoryName}: `, e)
    throw new Error(`Failed to fetch products for category ${categoryName}.`)
  }
}

// Function to get a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product
    } else {
      return null
    }
  } catch (e) {
    console.error("Error getting document: ", e)
    throw new Error("Failed to fetch product by ID.")
  }
}

// Function to update a product
export async function updateProduct(
  id: string,
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  try {
    const productRef = doc(db, "products", id)
    const updatedData = {
      ...productData,
      price: productData.price !== undefined ? Number(productData.price) : undefined,
      stock: productData.stock !== undefined ? Number(productData.stock) : undefined,
      updatedAt: new Date(),
    }
    await updateDoc(productRef, updatedData)
  } catch (e) {
    console.error("Error updating document: ", e)
    throw new Error("Failed to update product.")
  }
}

// Function to delete a product
export async function deleteProduct(id: string): Promise<void> {
  try {
    const productRef = doc(db, "products", id)
    await deleteDoc(productRef)
  } catch (e) {
    console.error("Error deleting document: ", e)
    throw new Error("Failed to delete product.")
  }
}

// Function to upload a product image to Firebase Storage (kept for reference, but not used with external URLs)
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  try {
    console.log(`[uploadProductImage] Starting upload for file: ${file.name}, product: ${productId}`)
    const storageRef = ref(storage, `products/${productId}/original/${file.name}`)
    console.log(`[uploadProductImage] Storage reference created: ${storageRef.fullPath}`)

    const snapshot = await uploadBytes(storageRef, file)
    console.log(
      `[uploadProductImage] Upload bytes complete for ${file.name}. Bytes transferred: ${snapshot.bytesTransferred}`,
    )

    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log(`[uploadProductImage] Download URL obtained: ${downloadURL}`)
    return downloadURL
  } catch (e) {
    console.error(`[uploadProductImage] Error uploading image ${file.name}: `, e)
    throw new Error(`Failed to upload image ${file.name}.`)
  }
}

// Function to delete an image from Firebase Storage (kept for reference)
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (e) {
    console.error("Error deleting image from storage: ", e)
    throw new Error("Failed to delete image from storage.")
  }
}

// --- Category Management Functions ---

// Function to add a new category
export async function addCategory(categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const newCategory: Category = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const docRef = await addDoc(categoriesCollectionRef, newCategory)
    return docRef.id
  } catch (e) {
    console.error("Error adding category: ", e)
    throw new Error("Failed to add category.")
  }
}

// Function to get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(categoriesCollectionRef, orderBy("name", "asc")) // Order by name alphabetically
    const querySnapshot = await getDocs(q)
    const categories: Category[] = []
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category)
    })
    return categories
  } catch (e) {
    console.error("Error getting categories: ", e)
    throw new Error("Failed to fetch categories.")
  }
}

// Function to get a single category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const docRef = doc(db, "categories", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category
    } else {
      return null
    }
  } catch (e) {
    console.error("Error getting category: ", e)
    throw new Error("Failed to fetch category by ID.")
  }
}

// Function to update a category
export async function updateCategory(
  id: string,
  categoryData: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  try {
    const categoryRef = doc(db, "categories", id)
    const updatedData = {
      ...categoryData,
      updatedAt: new Date(),
    }
    await updateDoc(categoryRef, updatedData)
  } catch (e) {
    console.error("Error updating category: ", e)
    throw new Error("Failed to update category.")
  }
}

// Function to delete a category
export async function deleteCategory(id: string): Promise<void> {
  try {
    const categoryRef = doc(db, "categories", id)
    await deleteDoc(categoryRef)
  } catch (e) {
    console.error("Error deleting category: ", e)
    throw new Error("Failed to delete category.")
  }
}

// --- Order Management Functions ---

// Function to add a new order
export async function addOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const newOrder = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const docRef = await addDoc(ordersCollectionRef, newOrder)
    return docRef.id
  } catch (e) {
    console.error("Error adding order: ", e)
    throw new Error("Failed to add order.")
  }
}

// Function to get all orders
export async function getOrders(): Promise<Order[]> {
  try {
    const q = query(ordersCollectionRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const orders: Order[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as any).toDate() : new Date(), // Safely convert or default
        updatedAt: data.updatedAt ? (data.updatedAt as any).toDate() : new Date(), // Safely convert or default
      } as Order)
    })
    return orders
  } catch (e) {
    console.error("Error getting orders: ", e)
    throw new Error("Failed to fetch orders.")
  }
}

// Function to get a single order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, "orders", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as any).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as any).toDate() : new Date(),
      } as Order
    } else {
      return null
    }
  } catch (e) {
    console.error("Error getting order by ID: ", e)
    throw new Error("Failed to fetch order by ID.")
  }
}

// Function to update an order
export async function updateOrder(
  id: string,
  orderData: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>,
): Promise<void> {
  try {
    const orderRef = doc(db, "orders", id)
    const updatedData = {
      ...orderData,
      updatedAt: serverTimestamp(),
    }
    await updateDoc(orderRef, updatedData)
  } catch (e) {
    console.error("Error updating order: ", e)
    throw new Error("Failed to update order.")
  }
}

// Function to delete an order
export async function deleteOrder(id: string): Promise<void> {
  try {
    const orderRef = doc(db, "orders", id)
    await deleteDoc(orderRef)
  } catch (e) {
    console.error("Error deleting order: ", e)
    throw new Error("Failed to delete order.")
  }
}
