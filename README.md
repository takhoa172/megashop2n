# Inventory & Sales Management System

Hệ thống quản lý nhập hàng, tồn kho, bán hàng và thống kê lợi nhuận. Phục vụ cho nhóm kinh doanh hàng hóa (đồ chơi, mô hình, đồ sưu tầm, đồ cũ,...).

## 🏗 Công nghệ

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12, Django 5, DRF, PostgreSQL 16 |
| **Frontend** | Next.js 16 (App Router), TypeScript, TailwindCSS, Shadcn UI |
| **Auth** | JWT (SimpleJWT) — access + refresh token |
| **Image** | Cloudinary (storage) |
| **Infra** | Docker, Docker Compose, Nginx |

## 📁 Cấu trúc thư mục

```
project-root/
├── backend/
│   ├── apps/
│   │   ├── users/           # Custom User (UUID, role-based)
│   │   ├── categories/      # Danh mục sản phẩm
│   │   ├── products/        # Sản phẩm + ảnh Cloudinary
│   │   ├── purchases/       # Nhập hàng
│   │   ├── sales/           # Bán hàng
│   │   ├── dashboard/       # Thống kê biểu đồ
│   │   ├── audit_logs/      # Audit log tự động
│   │   ├── blogs/           # Bài viết blog
│   │   ├── sliders/         # Slider banner (Admin quản lý)
│   │   ├── settings/        # Cấu hình hệ thống (footer, ...)
│   │   └── notifications/   # Thông báo banner
│   ├── core/                # Config Django (settings, permissions, pagination)
│   ├── scripts/seed.py      # Seed data mẫu
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Pages
│   │   ├── components/      # UI, Charts, Layout, Tables
│   │   ├── services/        # API calls
│   │   ├── contexts/        # AuthContext
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utils
│   │   └── types/           # TypeScript interfaces
│   └── Dockerfile
├── nginx/default.conf
├── docker-compose.yml
└── .env
```

## 🚀 Quick Start

### Yêu cầu
- Docker & Docker Compose
- Tài khoản Cloudinary (free)

### 1. Clone & cấu hình
```bash
git clone <repo-url>
cd project-root
```

### 2. Điền Cloudinary credentials vào `.env`
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Chạy
```bash
docker-compose up --build
```

### 4. Truy cập
- **Web**: http://localhost
- **Admin Django**: http://localhost/admin/

### 5. Tài khoản mặc định
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | admin123 |
| Manager | manager@example.com | password123 |
| Staff | staff@example.com | password123 |

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Thông tin user hiện tại |

### Users
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/auth/users` | Danh sách users |
| POST | `/api/auth/users` | Tạo user |
| PUT | `/api/auth/users/{id}` | Sửa user |
| DELETE | `/api/auth/users/{id}` | Xóa user |

### Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories/` | Danh sách danh mục |
| POST | `/api/categories/` | Tạo danh mục |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products/` | DS sản phẩm (filter: status, category, keyword, date) |
| POST | `/api/products/` | Tạo sản phẩm |
| PUT | `/api/products/{id}` | Sửa sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |
| POST | `/api/products/{id}/upload-image` | Upload ảnh (Cloudinary) |
| DELETE | `/api/products/{id}/remove-image` | Xóa ảnh |
| GET | `/api/products/most-viewed` | Sản phẩm xem nhiều nhất |

### Purchases
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/purchases/` | Lịch sử nhập hàng |
| POST | `/api/purchases/` | Nhập hàng (auto-update product price) |

### Sales
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/sales/` | Lịch sử bán hàng |
| POST | `/api/sales/` | Bán hàng (auto-set status=SOLD) |

### Dashboard
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/dashboard/summary` | Tổng quan (today, monthly, yearly) |
| GET | `/api/dashboard/revenue` | Doanh thu theo tháng (line chart) |
| GET | `/api/dashboard/profit` | Lợi nhuận theo tháng (bar chart) |
| GET | `/api/dashboard/inventory` | Tồn kho (pie chart) |
| GET | `/api/dashboard/top-categories` | Top danh mục (bar chart) |

### Blogs
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/blogs/` | Danh sách bài viết |
| POST | `/api/blogs/` | Tạo bài viết |
| GET | `/api/blogs/{slug}` | Chi tiết bài viết |
| PUT | `/api/blogs/{id}` | Sửa bài viết |
| DELETE | `/api/blogs/{id}` | Xóa bài viết |

### Sliders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/sliders/` | Danh sách slider (active) |
| POST | `/api/sliders/` | Tạo slider |
| PUT | `/api/sliders/{id}` | Sửa slider |
| DELETE | `/api/sliders/{id}` | Xóa slider |

### Settings
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/settings/footer` | Thông tin footer |
| PUT | `/api/settings/footer` | Cập nhật footer |

### Notifications
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notifications/active` | Thông báo đang hoạt động |

## 👥 Roles & Permissions

| Role | Quyền |
|------|-------|
| **SUPER_ADMIN** | Toàn quyền hệ thống |
| **MANAGER** | Quản lý sản phẩm, bán hàng, xem báo cáo |
| **STAFF** | Tạo sản phẩm, cập nhật trạng thái, upload ảnh |

## 📊 Biểu đồ Dashboard
- Revenue By Month (Line Chart)
- Profit By Month (Bar Chart)
- Inventory Status (Pie Chart)
- Top Categories (Bar Chart)

## 🧩 Modules

### Blog
- Quản lý bài viết với danh mục
- Rich text content
- Featured image (Cloudinary)
- Draft/Publish workflow

### Slider
- Quản lý slider banner từ Admin
- Upload ảnh + link đích
- Sắp xếp thứ tự hiển thị
- Bật/tắt từng slider

### Footer Settings
- Cấu hình footer: tên công ty, địa chỉ, phone, email, social links
- Chỉnh sửa trực tiếp từ Django Admin

### Notification Banner
- Admin tạo thông báo với thời gian hiệu lực
- Client hiển thị banner khi vào trang
- Tắt thông báo → lưu localStorage 24h

## 🛠 Business Rules

- `purchase_price >= 0`, `sale_price >= 0`
- Không được sửa `purchase_price` sau khi sản phẩm đã SOLD
- Mỗi sản phẩm chỉ có 1 ảnh chính
- Tạo Purchase → auto-update product purchase_price
- Tạo Sale → auto-set product.status=SOLD, product.sale_price=sale_price
- Chỉ bán được sản phẩm chưa SOLD

## 🔒 Security
- JWT Authentication
- Role Based Access Control (RBAC)
- CSRF Protection
- Rate Limiting
- UUID Primary Keys
- Audit Logging

## 🐳 Docker Services
| Service | Port | Mô tả |
|---------|------|-------|
| Nginx | 80 | Reverse proxy |
| Django | 8000 | REST API |
| Next.js | 3000 | Frontend |
| PostgreSQL | 5432 | Database |

## 🌱 Seed Data
Chạy tự động khi khởi tạo Docker:
- 1 Super Admin, 1 Manager, 1 Staff
- 5 danh mục mẫu
