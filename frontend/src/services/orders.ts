import api from "./api"

export interface OrderItemInput {
  product_id: string
  quantity: number
}

export interface CreateOrderInput {
  items: OrderItemInput[]
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  note?: string
  payment_method: "cod" | "vnpay"
  guest_email?: string | null
}

export interface Order {
  id: string
  user: string | null
  user_name: string
  user_email: string
  guest_email: string | null
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  subtotal: string
  shipping_fee: string
  total: string
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  note: string
  payment_method: "cod" | "vnpay"
  payment_status: "unpaid" | "paid" | "refunded"
  vnpay_txn_ref: string | null
  vnpay_paid_at: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product: string | null
  product_name: string
  product_image: string
  quantity: number
  unit_price: string
  subtotal: string
}

export async function createOrder(
  data: CreateOrderInput
): Promise<Order> {
  const res = await api.post("/orders/", data)
  return res.data
}

export async function getOrders(): Promise<Order[]> {
  const res = await api.get("/orders/")
  return res.data.results || res.data
}

export async function getOrder(id: string): Promise<Order> {
  const res = await api.get(`/orders/${id}/`)
  return res.data
}

export async function getAllOrders(): Promise<Order[]> {
  const res = await api.get("/orders/")
  return res.data.results || res.data
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  const res = await api.patch(`/orders/${id}/status/`, { status })
  return res.data
}
