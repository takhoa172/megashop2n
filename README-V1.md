# VIETSHOP V1.0 — Hệ thống bán hàng trực tuyến

> **Release:** 08-06-2026
> **Domain:** https://megashop2n.io.vn
> **Repo:** https://github.com/takhoa172/megashop2n

---

## Mục lục

1. [Giới thiệu](#1-gi%E1%BB%9Bi-thi%E1%BB%87u)
2. [Công nghệ](#2-c%C3%B4ng-ngh%E1%BB%87)
3. [Kiến trúc](#3-ki%E1%BA%BFn-tr%C3%BAc)
4. [Cấu trúc thư mục](#4-c%E1%BA%A5u-tr%C3%BAc-th%C6%B0-m%E1%BB%A5c)
5. [Tính năng đã hoàn thành](#5-t%C3%ADnh-n%C4%83ng-%C4%91%C3%A3-ho%C3%A0n-th%C3%A0nh)
6. [Responsive Mobile](#6-responsive-mobile)
7. [Những gì đã sửa chữa](#7-nh%E1%BB%AFng-g%C3%AC-%C4%91%C3%A3-s%E1%BB%ADa-ch%E1%BB%AFa)
8. [Vấn đề còn tồn đọng](#8-v%E1%BA%A5n-%C4%91%E1%BB%81-c%C3%B2n-t%E1%BB%93n-%C4%91%E1%BB%8Dng)
9. [Theme & Design Tokens](#9-theme--design-tokens)
10. [Cách chạy local](#10-c%C3%A1ch-ch%E1%BA%A1y-local)
11. [Deploy Production](#11-deploy-production)
12. [Roadmap V2](#12-roadmap-v2)

---

## 1. Giới thiệu

VIETSHOP là web app quản lý bán hàng trực tuyến, bao gồm:

- **Public website** — Trang chủ, danh sách sản phẩm, chi tiết sản phẩm, blog, giới thiệu, đăng nhập
- **Admin dashboard** — Quản lý sản phẩm, nhập hàng, bán hàng, blog, thống kê, cài đặt
- **Auth & Roles** — JWT client-side, 3 roles: SUPER_ADMIN, MANAGER, STAFF

Phục vụ cho nhóm kinh doanh hàng hóa (đồ chơi, mô hình, đồ sưu tầm, đồ cũ,...).

---

## 2. Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| **Backend** | Python 3.12, Django 5, Django REST Framework, PostgreSQL 16 |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Shadcn UI, Recharts |
| **Auth** | JWT (SimpleJWT) — access token 30 phút + refresh token 1 ngày |
| **Images** | Cloudinary (upload, crop, resize, storage) |
| **Infra** | Docker Compose, Nginx, Cloudflare Tunnel |
| **CI/CD** | GitHub Actions (chưa hoạt động — xem V2) |

---

## 3. Kiến trúc

```
Browser (User)
    │
    ▼
Cloudflare (CDN + SSL Full Strict)
    │
    ▼
Cloudflare Tunnel (cloudflared — kết nối ngược, không mở port)
    │
    ▼
Docker Nginx (:80)
    ├── /api/*      → Django REST API (:8000)
    ├── /admin/*    → Django Admin (:8000)
    └── /*          → Next.js (:3000)
                        │
                        ▼
                    PostgreSQL (:5432)
```

### Luồng request

```
Browser → https://megashop2n.io.vn/products
  → Cloudflare (proxy, SSL)
  → Tunnel (cloudflared trên server)
  → Nginx (container)
  → Next.js (render UI, gọi API /api/products/)
  → Nginx → Django (/api/*)
  → Django → PostgreSQL
  → Response ngược lại browser
```

---

## 4. Cấu trúc thư mục

```
/
├── backend/                          # Django project (Python 3.12)
│   ├── core/                         # Settings, urls gốc, permissions, pagination
│   │   ├── settings/
│   │   │   ├── base.py               # Base settings
│   │   │   ├── local.py              # Dev settings
│   │   │   └── production.py         # Production settings
│   │   ├── permissions.py            # IsSuperAdmin, IsManager, IsStaffOrAdmin
│   │   ├── pagination.py
│   │   └── audit_middleware.py       # Thread-local audit tracking
│   ├── apps/
│   │   ├── users/                    # Custom User (UUID, role-based)
│   │   ├── categories/               # Danh mục sản phẩm
│   │   ├── products/                 # CRUD sản phẩm + Cloudinary upload
│   │   ├── purchases/                # Nhập hàng (auto-update purchase_price)
│   │   ├── sales/                    # Bán hàng (auto-set status=SOLD)
│   │   ├── dashboard/                # API thống kê (revenue, profit, inventory)
│   │   ├── blogs/                    # Blog posts (draft/publish, categories)
│   │   ├── sliders/                  # Hero slider banners (Admin CRUD)
│   │   ├── settings/                 # Footer settings — singleton
│   │   ├── notifications/            # Notification banner (có thời hạn)
│   │   ├── product_views/            # Tracking lượt xem sản phẩm
│   │   ├── common/                   # Admin mixins (crop widget, preview)
│   │   └── audit_logs/               # Audit trail tự động
│   ├── scripts/
│   │   ├── seed.py                   # Tạo users mặc định
│   │   └── seed_demo.py              # Seed 22 products, 9 categories, 3 sliders
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                         # Next.js 16 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout (Inter font + Material Symbols)
│   │   │   ├── globals.css           # Tailwind v4 @theme (design tokens)
│   │   │   ├── (public)/             # Public routes — có Navbar + Footer
│   │   │   │   ├── layout.tsx        # PublicNavbar + PublicFooter wrapper
│   │   │   │   ├── page.tsx          # Home (6 sections: hero, gợi ý, xu hướng, thanh lý, giá rẻ, blog)
│   │   │   │   ├── account/page.tsx  # Thông tin người dùng
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx      # Product list (grid + filter + sort)
│   │   │   │   │   └── [id]/page.tsx # Product detail (image gallery + tabs + reviews)
│   │   │   │   ├── blogs/page.tsx    # Blog list
│   │   │   │   ├── about/page.tsx    # About + Contact form (gọi API)
│   │   │   │   ├── login/page.tsx    # Login + Register tabs
│   │   │   │   └── cart/page.tsx     # Giỏ hàng (client-side localStorage)
│   │   │   ├── admin/                # Admin routes — yêu cầu auth
│   │   │   │   ├── layout.tsx        # Sidebar layout + AuthGuard
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── products/page.tsx
│   │   │   │   ├── purchases/page.tsx
│   │   │   │   ├── sales/page.tsx
│   │   │   │   ├── blogs/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn UI (Card, Button, Dialog, Input, Select...)
│   │   │   ├── charts/               # Recharts components (RevenueLine, ProfitBar, InventoryPie, TopCategoriesBar)
│   │   │   ├── layout/               # Sidebar, AdminNav
│   │   │   └── public/               # PublicNavbar, PublicFooter, SliderHero, NotificationBanner
│   │   ├── services/                 # API calls (api.ts, auth.ts, public.ts, dashboard.ts...)
│   │   ├── contexts/                 # AuthContext (JWT client-side)
│   │   ├── hooks/                    # Custom hooks
│   │   ├── lib/utils.ts              # formatCurrency, stripHtml, truncateText
│   │   └── types/index.ts            # TypeScript interfaces
│   ├── public/template/              # HTML templates gốc để đối chiếu UI
│   │   ├── home.html
│   │   ├── product-list.html
│   │   ├── product-detail.html
│   │   ├── blogs-list.html
│   │   └── us.html
│   └── Dockerfile
│
├── nginx/default.conf                # Reverse proxy config
├── docker-compose.yml                # 4 services: postgres, django, nextjs, nginx
├── .github/workflows/deploy.yml      # CI/CD workflow (chưa hoạt động)
│
├── README.md                         # README gốc (giữ nguyên)
├── README-V1.md                      # Tài liệu V1 (file này)
├── thongtin.md                       # Tài liệu chi tiết cũ
├── huong-dan-deploy.md               # Hướng dẫn deploy A-Z
├── audit.md                          # Audit report gốc
├── fix-notes.md                      # Ghi chép các fix
├── 2026-06-03.md                     # Bán giao dự án
├── 02-06-2026.md                     # Ghi chép 02/06
├── 04-06-2026.md                     # Ghi chép 04/06
└── summary.md                        # Tổng kết cũ
```

---

## 5. Tính năng đã hoàn thành

### 5.1 Admin (8 modules — yêu cầu đăng nhập)

| Trang | Tính năng | CRUD |
|-------|-----------|------|
| **Dashboard** | 4 biểu đồ: Revenue (line), Profit (bar), Inventory (pie), Top Categories (bar) + 4 thẻ tổng quan (today, monthly, yearly, inventory) | ✅ Read |
| **Products** | Danh sách + filter (status, category, keyword, date) + create/edit/delete + upload ảnh Cloudinary + crop ảnh trước khi upload | ✅ Full CRUD |
| **Purchases** | Nhập hàng + datetime picker + validation (không nhập sản phẩm đã sold/in_stock) | ✅ Create + List |
| **Sales** | Bán hàng + select_for_update tránh race condition + datetime picker | ✅ Create + List |
| **Blogs** | Bài viết + danh mục + featured image + draft/publish | ✅ Full CRUD |
| **Reports** | Biểu đồ thống kê (giống Dashboard) | ✅ Read |
| **Settings** | Footer settings (company, address, social links) — singleton, chỉ 1 record | ✅ CRUD |
| **Notifications** | Banner thông báo có thời hạn | ✅ CRUD |

### 5.2 Public (8 pages — không cần đăng nhập)

| Trang | Tính năng chính |
|-------|-----------------|
| **Home** (`/`) | Hero slider (3 slides), sản phẩm gợi ý (grid 5 cột), xu hướng thị trường (grid 2+2+1), hàng thanh lý (grid 4 cột), hàng giá rẻ (horizontal scroll), blog (grid 3 cột) |
| **Products** (`/products`) | Grid 3 cột, filter danh mục (checkbox), sort (mới nhất/giá/bán chạy), badge giảm giá %, pagination |
| **Product Detail** (`/products/[id]`) | Ảnh chính + thumbnails, tabs (Description/Reviews/Shipping), feature cards, related products |
| **Blog** (`/blogs`) | Featured article + blog cards (image, title, excerpt) |
| **About** (`/about`) | Hero section, contact form (gọi API backend), Google Maps, thông tin công ty |
| **Login** (`/login`) | Login + Register tabs, email/password/phone fields, Google login button (UI) |
| **Account** (`/account`) | Thông tin người dùng sau khi đăng nhập |
| **Cart** (`/cart`) | Giỏ hàng client-side (localStorage), tăng/giảm số lượng, xóa, tạm tính |

### 5.3 Seed Data (chạy tự động khi docker start)

- 3 users: SUPER_ADMIN, MANAGER, STAFF
- 9 categories, 22 products với ảnh Cloudinary
- 3 hero sliders
- 3 blog posts
- 1 notification banner
- Footer settings

---

## 6. Responsive Mobile

Đã fix responsive cho tất cả public pages:

| Page | Mobile fix |
|------|-----------|
| **Navbar** | Hamburger menu, ẩn search, padding `px-margin-mobile` |
| **Home** | `aspect-[3/4]`, grid 2 cột, typography mobile (`display-lg-mobile`, `headline-lg-mobile`), horizontal scroll "hàng giá rẻ", rating ẩn text |
| **Products** | Grid 2 cột, card `aspect-[3/4]`, padding mobile |
| **Product Detail** | Thumbnails wrap, image full width |
| **Blog** | Card border/shadow/bg, padding |
| **About** | Map `h-[250px]`, overlay full, padding |
| **Cart** | Layout 2 hàng: [image + info] trên, [quantity + delete] dưới |
| **Footer** | Gap `grid-cols-2`, policy links vertical, newsletter |
| **Login** | Padding, grid single column |

---

## 7. Những gì đã sửa chữa

> Từ Audit ngày 02-06-2026: 18 issues đã xử lý, 0 issue P0 còn tồn đọng.

### Backend (6 issues)

| # | Issue | Fix | File |
|---|-------|-----|------|
| B1 | most_viewed/suggested/price_zero yêu cầu auth | Đổi `IsAuthenticated` → `AllowAny` | `product_views/views.py` |
| B2 | Race condition khi bán hàng | Thêm `select_for_update()` + `transaction.atomic()` | `sales/views.py` |
| B3 | Purchase thiếu field validation | Check `product.status` trước khi save | `purchases/views.py` |
| B4 | AuditLog không ghi user | Tạo middleware thread-local + API endpoint | `audit_logs/` + `audit_middleware.py` |
| B5 | Blog category thiếu detail endpoints | Thêm get/put/patch/delete cho category | `blogs/urls.py` |
| B6 | Product view đếm cả admin/staff | Skip tạo ProductView cho admin/staff | `products/views.py` |

### Frontend (12 issues)

| # | Issue | Fix | File |
|---|-------|-----|------|
| F1 | Thiếu trang /account | Tạo route mới + page | `(public)/account/page.tsx` |
| F2 | Auth race condition | Refresh token fallback trước getMe() | `AuthContext.tsx` |
| F3 | Thiếu số điện thoại register | Thêm phone field (model + UI) | `login/page.tsx` + backend |
| F4 | Admin products thiếu edit mode | Thêm Pencil button + update form | `admin/products/page.tsx` |
| F5 | Admin blogs thiếu edit mode | Thêm Pencil button + update form | `admin/blogs/page.tsx` |
| F6 | Image upload chưa có UI | Thêm file input + preview trong edit | `admin/products/page.tsx` |
| F7 | Purchases/sales hardcode dates | Thay `new Date()` = datetime-local input | `admin/purchases/page.tsx`, `admin/sales/page.tsx` |
| F9 | Thiếu cart badge | Thêm badge đỏ "3" trên cart icon | `PublicNavbar.tsx` |
| F10 | Thiếu "Danh mục" nav link | Thêm link `/products` | `PublicNavbar.tsx` |
| F11 | Public service trùng lặp | Refactor re-export | `services/public.ts` |
| F12 | Dead components | Import NotificationBanner vào layout | `(public)/layout.tsx` |
| F14 | About page alert() | Gọi API `/api/contact` + success message | `about/page.tsx` + backend |

### Post-Deploy Fixes (04-06-2026)

| # | Fix | Chi tiết |
|---|-----|---------|
| 1 | NEXT_PUBLIC_API_URL | `/api` (tương đối) thay vì `http://localhost/api` |
| 2 | Viewport meta | Thêm `width=device-width, initial-scale=1` |
| 3 | Navbar trùng link | Xóa link "Danh mục" trùng với "Sản phẩm" |
| 4 | Responsive mobile Phase 1-3 | Padding, grid, typography, aspect ratio |

---

## 8. Vấn đề còn tồn đọng

### Backend

| Pri | Issue | Mức độ |
|-----|-------|--------|
| P1 | `IsManager` permission dead code | Dead code — không gây hại, chờ dọn |
| P2 | Blog thiếu public detail page (hiện chỉ có list) | Thiếu trải nghiệm |
| P3 | Không có unit test (back-end + front-end) | Technical debt |
| P3 | Không caching (mỗi request query DB) | Performance |
| P3 | Không async views/tasks | Scalability |

### Frontend — Template Matching

| Page | % Khớp | Thiếu |
|------|--------|-------|
| Product list | ~75% | Breadcrumb, price range filter |
| Product detail | ~70% | Image gallery tabs, size/quantity picker |
| Blog list | ~85% | Pagination |
| About | ~90% | Google Maps iframe (có placeholder) |

### CI/CD

- File `.github/workflows/deploy.yml` đã tạo
- GitHub Actions chưa chạy được do SSH timeout (GitHub server Mỹ → server nhà FPT)
- **Giải pháp V2:** GitHub Self-Hosted Runner trên server

---

## 9. Theme & Design Tokens

Định nghĩa trong `frontend/src/app/globals.css` (Tailwind v4 `@theme`).

### Màu sắc

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `primary` | `#2563EB` | Nút, link, giá tiền |
| `secondary` | `#0F172A` | Navbar, footer, heading |
| `accent` | `#F59E0B` | Badge, icon star, nhấn mạnh |
| `background` | `#f8f9ff` | Nền trang |
| `on-surface-variant` | `#45464d` | Text phụ |
| `surface-container-low` | `#eff4ff` | Section nền xanh nhạt |
| `outline-variant` | `#c6c6cd` | Viền card |

### Typography

| Token | Size | Weight |
|-------|------|--------|
| `display-lg` | 48px / mobile: 32px | 700 |
| `headline-lg` | 30px / mobile: 24px | 600 |
| `headline-md` | 20px | 600 |
| `body-lg` | 18px | 400 |
| `body-md` | 16px | 400 |
| `body-sm` | 14px | 400 |
| `label-lg` | 14px | 600 |
| `label-sm` | 12px | 500 |

### Spacing

| Token | Giá trị |
|-------|---------|
| `container-max` | 1280px |
| `margin-desktop` | 80px |
| `margin-mobile` | 16px |
| `gutter` | 24px |
| `section-gap` | 80px |

---

## 10. Cách chạy local

### Yêu cầu

- Docker & Docker Compose
- Tài khoản Cloudinary (free)

### Bước 1: Clone & .env

```bash
git clone https://github.com/takhoa172/megashop2n.git
cd megashop2n
cp .env.example .env
```

Điền Cloudinary credentials vào `.env`:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Bước 2: Build & chạy

```bash
docker compose up --build -d
```

Lần đầu mất 5-10 phút để build. Các lần sau nhanh hơn:

```bash
# Chỉ rebuild frontend (khi sửa frontend code)
docker compose up --build -d nextjs

# Xem log
docker compose logs -f

# Dừng
docker compose down
```

### Bước 3: Truy cập

| URL | Mô tả |
|-----|-------|
| http://localhost | Website |
| http://localhost/admin/ | Django Admin |

### Tài khoản mặc định

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@example.com | admin123 |
| MANAGER | manager@example.com | password123 |
| STAFF | staff@example.com | password123 |

---

## 11. Deploy Production

### Thông tin

| Item | Giá trị |
|------|---------|
| Domain | megashop2n.io.vn |
| Server | Ubuntu, Docker |
| SSL | Cloudflare Full Strict |
| Tunnel | Cloudflare Tunnel (cloudflared) |
| Deploy guide | `huong-dan-deploy.md` (743 dòng, A-Z) |

### Kiến trúc deploy

```
Browser → Cloudflare (proxy, SSL) → Cloudflare Tunnel → Docker:
  ├── Nginx (http://localhost:80 → nội bộ)
  ├── Django (API + Admin)
  ├── Next.js (UI)
  └── PostgreSQL (Database)
```

### Update code trên server (thủ công)

```bash
ssh ssh.megashop2n.io.vn
cd /opt/vietshop
git pull origin main
docker compose up -d --build
```

### Các lệnh thường dùng

```bash
# Kiểm tra trạng thái
docker compose ps

# Xem log
docker compose logs django
docker compose logs nextjs
docker compose logs nginx

# Restart service
docker compose restart nginx

# Backup database
docker compose exec postgres pg_dump -U admin inventory_db > backup_$(date +%Y%m%d).sql
```

---

## 12. Roadmap V2

Xem `README-V2.md` cho kế hoạch chi tiết.

### Tổng quan

| Phase | Mục tiêu | Thời gian dự kiến |
|-------|----------|-------------------|
| **A** | Phân quyền CUSTOMER + Order System | 3-4 ngày |
| **B** | Cart → Checkout → Payment (VNPay) | 3-4 ngày |
| **C** | CI/CD (GitHub Self-Hosted Runner) | 1 ngày |
| **D** | Testing (pytest + vitest) | 2-3 ngày |
| **E** | Template Matching hoàn thiện | 2 ngày |
| **F** | Tối ưu (caching, async, image) | 2 ngày |

---

> **Tài liệu V1 — 08-06-2026**
> Xem thêm: `README.md` (gốc), `thongtin.md` (chi tiết cũ), `huong-dan-deploy.md` (deploy guide)
