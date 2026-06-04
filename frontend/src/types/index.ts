export interface User {
  id: string
  email: string
  username: string
  full_name: string
  phone?: string
  role: "SUPER_ADMIN" | "MANAGER" | "STAFF"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface ProductImage {
  id: string
  image_url: string
  public_id: string
  is_primary: boolean
  created_at: string
}

export interface Product {
  id: string
  sku: string
  category: string | null
  category_name: string
  name: string
  description: string | null
  purchase_price: number
  sale_price: number | null
  status: "pending_price" | "in_stock" | "sold" | "cancelled"
  quantity: number
  notes: string | null
  created_by: string | null
  created_by_name: string
  images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  product: string
  product_name: string
  payer: string | null
  payer_name: string
  purchase_price: number
  purchased_at: string
  note: string | null
  created_at: string
}

export interface Sale {
  id: string
  product: string
  product_name: string
  sale_price: number
  sold_at: string
  sold_by: string | null
  sold_by_name: string
  customer_name: string
  note: string | null
  created_at: string
}

export interface DashboardSummary {
  today: {
    revenue: number
    cost: number
    profit: number
    products_sold: number
  }
  monthly: {
    revenue: number
    cost: number
    profit: number
  }
  yearly: {
    revenue: number
    cost: number
    profit: number
  }
  inventory: {
    total_products: number
    in_stock: number
    sold: number
    pending_price: number
  }
}

export interface ChartDataPoint {
  month: string
  revenue?: number
  profit?: number
  cost?: number
}

export interface InventoryChartItem {
  name: string
  value: number
  color: string
}

export interface TopCategory {
  name: string
  count: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string | null
  category_name: string
  content: string
  excerpt: string | null
  featured_image: string | null
  featured_image_public_id: string | null
  author: string | null
  author_name: string
  status: "draft" | "published"
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  created_at: string
}
