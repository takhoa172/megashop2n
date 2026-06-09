# Onboarding — VIETSHOP V2

Tài liệu dành cho thành viên mới tham gia dự án. Đọc xong là có thể nắm được tổng quan, chạy được project và biết bắt đầu từ đâu.

---

## 1. Giới thiệu dự án

**VIETSHOP** là hệ thống quản lý nhập hàng, tồn kho, bán hàng và thống kê lợi nhuận — phục vụ cho nhóm kinh doanh hàng hóa (đồ chơi, mô hình, đồ sưu tầm, đồ cũ...).

**V2 (đang phát triển):** Nâng cấp lên nền tảng e-commerce hoàn chỉnh — thêm role CUSTOMER, giỏ hàng, checkout, thanh toán VNPay, quản lý đơn hàng.

---

## 2. Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Backend | Python 3.12, Django 5, Django REST Framework |
| Database | PostgreSQL 16 |
| Frontend | Next.js 16 (App Router), React 19 |
| Ngôn ngữ FE | TypeScript (strict) |
| Style | TailwindCSS 4 + Shadcn UI (Radix primitives) |
| Auth | JWT (SimpleJWT) — access token + refresh token |
| State + Data fetching | TanStack React Query |
| Charts | Recharts |
| Images | Cloudinary |
| Payment | VNPay |
| Container | Docker, Docker Compose |
| Reverse proxy | Nginx (Alpine) |

---

## 3. Kiến trúc

```
User ──> Nginx (:80)
              ├── /api/*       ──> Django container (:8000)
              ├── /admin/{page} ──> Next.js container (:3000)
              ├── /admin/*     ──> Django Admin
              ├── /static/*    ──> Django static files
              ├── /media/*     ──> Uploaded files
              └── /*           ──> Next.js container (:3000)
```

Docker Compose gồm 4 services:

| Service | Image | Cổng | Chức năng |
|---------|-------|:----:|-----------|
| `postgres` | postgres:16-alpine | 5432 | Database |
| `django` | build từ `./backend/Dockerfile` | 8000 | REST API |
| `nextjs` | build từ `./frontend/Dockerfile` | 3000 | Web app |
| `nginx` | nginx:alpine | 80 | Reverse proxy |

---

## 4. Cấu trúc thư mục

### Backend (`backend/`)

```
backend/
├── apps/
│   ├── users/          # User model, auth, roles
│   ├── categories/     # Danh mục sản phẩm
│   ├── products/       # Sản phẩm, images
│   ├── purchases/      # Nhập hàng
│   ├── sales/          # Bán hàng
│   ├── orders/         # (V2) Đơn hàng, VNPay
│   ├── dashboard/      # Thống kê, charts
│   ├── blogs/          # Bài viết
│   ├── sliders/        # Banner
│   ├── settings/       # Cài đặt hệ thống
│   ├── notifications/  # Thông báo
│   ├── product_views/  # Lượt xem sản phẩm
│   ├── audit_logs/     # Lịch sử thao tác
│   └── common/         # Mixins, utils
├── core/
│   ├── settings/       # base.py (chung), dev.py, prod.py
│   ├── urls.py         # API routes
│   ├── permissions.py  # Permission classes
│   └── pagination.py   # Custom pagination
├── scripts/
│   ├── seed.py         # Seed dữ liệu mẫu
│   └── seed_demo.py    # Seed dữ liệu demo
├── requirements.txt
├── Dockerfile
└── manage.py
```

### Frontend (`frontend/`)

```
frontend/src/
├── app/
│   ├── (public)/       # Routes công khai
│   │   ├── page.tsx          # Trang chủ
│   │   ├── login/            # Đăng nhập
│   │   ├── products/         # Danh sách + chi tiết sản phẩm
│   │   ├── cart/             # Giỏ hàng
│   │   ├── checkout/         # (V2) Thanh toán
│   │   ├── order/            # (V2) Kết quả đơn hàng
│   │   ├── account/          # (V2) Lịch sử đơn hàng
│   │   ├── blogs/            # Bài viết
│   │   └── about/            # Giới thiệu
│   └── admin/           # Routes quản trị
│       ├── dashboard/   # Trang tổng quan
│       ├── products/    # Quản lý sản phẩm
│       ├── purchases/   # Nhập hàng
│       ├── sales/       # Bán hàng
│       ├── orders/      # (V2) Đơn hàng
│       ├── blogs/       # Bài viết
│       ├── reports/     # Báo cáo
│       └── settings/    # Cài đặt
├── components/
│   ├── layout/         # Header, Sidebar
│   ├── public/         # Navbar, Footer, Slider
│   ├── charts/         # Biểu đồ (4 charts)
│   ├── tables/         # DataTable
│   └── ui/             # Shadcn components
├── contexts/
│   ├── AuthContext.tsx  # Auth state
│   └── CartContext.tsx  # Giỏ hàng (localStorage)
├── services/           # 15 file API service
├── hooks/              # Custom hooks
├── types/              # TypeScript definitions
└── lib/                # Utils (cn, formatCurrency)
```

---

## 5. User Roles

| Role | Mô tả | Quyền truy cập |
|------|-------|----------------|
| `SUPER_ADMIN` | Chủ cửa hàng | Full — tất cả menu + Django Admin |
| `MANAGER` | Quản lý | Dashboard, Sản phẩm, Nhập hàng, Bán hàng, Đơn hàng, Bài viết, Báo cáo |
| `STAFF` | Nhân viên | Dashboard, Sản phẩm, Bán hàng, Đơn hàng |
| `CUSTOMER` | Khách hàng (V2) | Chỉ trang public, không vào admin |

---

## 6. API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login/` | Đăng nhập (JWT) |
| POST | `/api/auth/register/customer/` | (V2) Đăng ký khách hàng |
| POST | `/api/auth/token/refresh/` | Refresh JWT |
| GET | `/api/auth/me/` | Thông tin user hiện tại |
| GET/POST | `/api/products/` | Danh sách / Tạo sản phẩm |
| GET/POST | `/api/purchases/` | Nhập hàng |
| GET/POST | `/api/sales/` | Bán hàng |
| GET/POST | `/api/orders/` | (V2) Đơn hàng |
| GET | `/api/dashboard/` | Thống kê dashboard |
| PATCH | `/api/orders/{id}/update-status/` | (V2) Cập nhật trạng thái đơn |

Danh sách đầy đủ: xem `backend/core/urls.py`.

---

## 7. Các khái niệm business

- **Product status**: `pending_price` (chờ định giá) → `in_stock` (đang bán) → `sold` (đã bán) | `cancelled`
- **Order status**: `pending` → `confirmed` → `shipping` → `delivered` | `cancelled`
- **Payment method**: `cod` (thanh toán khi nhận hàng) | `vnpay` (chuyển khoản online)
- **Công thức lợi nhuận**: `profit = sale_price - purchase_price` (từng sản phẩm / tổng hợp)

---

## 8. Những gì đã làm

### V1 (Hoàn thành — tag `v1.0`)
- Toàn bộ hệ thống nhập hàng, bán hàng, tồn kho
- Dashboard với biểu đồ thống kê
- JWT auth, phân quyền SUPER_ADMIN / MANAGER / STAFF
- Audit logs, notifications
- Deploy qua Docker Compose + nginx

### Phase A (V2 — Backend)
- Thêm role `CUSTOMER` + permission `IsCustomer`
- API đăng ký khách hàng: `POST /api/auth/register/customer/`
- App `orders` với models Order, OrderItem, VNPay payment
- Admin cho Order trong Django Admin

### Phase B (V2 — Frontend)
- Checkout page (COD + VNPay)
- Customer order history + detail
- Admin order management (list + detail + update status)
- Nâng cấp Dashboard UI: gradient stat cards, skeletons, tooltips, period summary
- Cải thiện Header/Sidebar UI, phân quyền menu theo role
- Fix charts: TopCategoriesChart dùng `Cell` thay `rect`, bảng màu 8 màu
- Fix layout sidebar: scrollable nav, không bị chồng menu

Chi tiết: xem `09-06-2026.md`, `summary.md`, `README-V2.md`.

---

## 9. Cách chạy project

### Yêu cầu
- Docker + Docker Compose

### Lần đầu
```bash
# Clone repo
git clone https://github.com/takhoa172/megashop2n.git
cd megashop2n

# Tạo file .env từ mẫu (copy từ .env.example)
# Điền các giá trị thật vào .env

# Build & chạy
docker compose up -d --build
```

### Mỗi lần chạy sau
```bash
docker compose up -d
```

### Khi thay đổi code frontend
```bash
docker compose up -d --build nextjs
```

### Khi thay đổi nginx config
```bash
docker compose restart nginx
```

### Khi có migration mới
```bash
docker compose restart django
# (tự động chạy migrate trong startup command)
```

---

## 10. Coding Conventions

### Backend (Python / Django)
- Tuân thủ PEP8
- Dùng service layer pattern (`services.py` trong mỗi app)
- Type hints bắt buộc cho function signatures
- Naming: `snake_case` cho biến/hàm, `PascalCase` cho class
- URL routes: dùng URL prefix theo app name

### Frontend (TypeScript / React)
- Strict mode TypeScript
- Functional components, dùng hooks
- Import alias: `@/` cho `src/`
- Naming: `camelCase` cho biến/hàm, `PascalCase` cho component file
- File component trùng tên export (VD: `RevenueChart.tsx` → `export function RevenueChart`)
- Dùng `"use client"` cho component có state/effect

### Git
- Commit message bằng tiếng Việt, ngắn gọn
- Branch `v2` cho tất cả V2 work
- Branch `main` cho V1 ổn định
- KHÔNG commit `.env` chứa secret thật

---

## 11. Workflow khi nhận task mới

1. **Pull code mới nhất**: `git pull origin v2`
2. **Chạy project**: `docker compose up -d` (nếu chưa chạy)
3. **Tìm hiểu code liên quan**: đọc file, xem component tree
4. **Làm task** trên branch `v2`
5. **Build thử**: `docker compose up -d --build nextjs` và kiểm tra
6. **Commit + Push** lên `v2`

---

## 12. Liên hệ / Hỗ trợ

Xem thêm:
- `summary.md` — giải thích chi tiết kiến trúc, database, business rules
- `README-V2.md` — kế hoạch V2 đầy đủ
- `fix-notes.md` — các lỗi đã gặp và cách fix
- `audit.md` — audit bảo mật codebase
- Các file `DD-MM-YYYY.md` — nhật ký công việc theo ngày
