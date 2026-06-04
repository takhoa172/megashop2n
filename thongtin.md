# THÔNG TIN DỰ ÁN VIETSHOP

---

## I. TỔNG QUAN

VIETSHOP — Web bán hàng trực tuyến.

| Thành phần | Công nghệ |
|-----------|-----------|
| Backend | Django DRF (Python) |
| Frontend | Next.js (TypeScript + Tailwind v4) |
| Proxy | Nginx |
| DB | PostgreSQL |
| Deploy | Docker Compose (4 services) |
| Images | Cloudinary |

---

## II. CẤU TRÚC DỰ ÁN

```
/
├── backend/
│   ├── core/                  # Cấu hình Django (settings.py, urls.py)
│   ├── apps/
│   │   ├── users/             # User, auth, JWT register/login
│   │   ├── products/          # Products, categories, Cloudinary upload
│   │   ├── purchases/         # Purchases (orders)
│   │   ├── sales/             # Sales (admin bán hàng)
│   │   ├── blogs/             # Blog posts
│   │   ├── sliders/           # Hero sliders
│   │   ├── settings/          # Footer settings (company, social links)
│   │   ├── notifications/     # Notifications
│   │   ├── product_views/     # Product view tracking
│   │   ├── dashboard/         # Dashboard thống kê API
│   │   └── audit_logs/        # Audit trail
│   ├── scripts/
│   │   ├── seed.py            # Seed users
│   │   └── seed_demo.py       # Seed demo data (22 products, 9 categories, ...)
│   ├── requirements.txt
│   └── Dockerfile.django
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout — Inter font + Material Symbols
│   │   │   ├── globals.css              # Tailwind v4 @theme (toàn bộ design tokens)
│   │   │   ├── (public)/               # Public route group (có Navbar + Footer)
│   │   │   │   ├── layout.tsx          # PublicNavbar + PublicFooter wrapper
│   │   │   │   ├── page.tsx            # Home (6 sections)
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx        # Product list
│   │   │   │   │   └── [id]/page.tsx   # Product detail
│   │   │   │   ├── blogs/
│   │   │   │   │   └── page.tsx        # Blog list
│   │   │   │   ├── about/page.tsx      # About / Contact
│   │   │   │   └── login/page.tsx      # Login + Register tabs
│   │   │   ├── admin/                  # Admin dashboard (yêu cầu auth)
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── products/page.tsx
│   │   │   │   ├── purchases/page.tsx
│   │   │   │   ├── sales/page.tsx
│   │   │   │   ├── blogs/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   └── public/
│   │   │       ├── PublicNavbar.tsx     # Navbar (4 links, search, cart, account)
│   │   │       └── PublicFooter.tsx     # Footer (4 columns, social, newsletter)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx          # Auth state (login, register, logout, getMe)
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios instance + interceptor
│   │   │   ├── auth.ts                 # Auth API (login, register, refreshToken, getMe)
│   │   │   └── public.ts               # Public API (products, blogs, sliders, footer)
│   │   └── lib/
│   │       └── utils.ts                # formatCurrency, helpers
│   ├── public/template/                # HTML templates để đối chiếu UI
│   │   ├── home.html
│   │   ├── product-list.html
│   │   ├── product-detail.html
│   │   ├── blogs-list.html
│   │   └── us.html
│   ├── Dockerfile.nextjs
│   └── next.config.ts
│
├── nginx/
│   └── default.conf          # /api → django, /* → nextjs
│
├── docker-compose.yml        # 4 services: postgres, django, nextjs, nginx
└── .env                      # Cloudinary credentials, secrets
```

---

## III. THEME — Tailwind v4 `@theme`

Định nghĩa trong `frontend/src/app/globals.css`.

### Màu sắc

| Token | Giá trị |
|-------|---------|
| `primary` | `#2563EB` |
| `on-primary` | `#ffffff` |
| `secondary` | `#0F172A` |
| `on-secondary` | `#ffffff` |
| `accent` | `#F59E0B` |
| `on-accent` | `#ffffff` |
| `background` | `#f8f9ff` |
| `on-background` | `#0F172A` |
| `on-surface-variant` | `#45464d` |
| `outline-variant` | `#c6c6cd` |
| `surface-container-low` | `#eff4ff` |

### Typography

| Token | Size | Weight |
|-------|------|--------|
| `display-lg` | 48px | 700 |
| `display-lg-mobile` | 32px | 700 |
| `headline-lg` | 30px | 600 |
| `headline-lg-mobile` | 24px | 600 |
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
| `margin-desktop` | 48px |
| `margin-mobile` | 16px |
| `gutter` | 24px |
| `section-gap` | 80px |

---

## IV. TEMPLATE MATCHING

- File template HTML gốc nằm trong `frontend/public/template/`
- Mọi public page PHẢI đối chiếu với template trước khi sửa
- Header (PublicNavbar) và Footer (PublicFooter) giống nhau trên mọi public page
- Không thay đổi màu sắc thương hiệu
- Không tự thiết kế layout mới nếu không được yêu cầu

---

## V. AUTH

| Thông tin | Giá trị |
|-----------|---------|
| Cơ chế | JWT, client-side, localStorage |
| Endpoints | `/api/auth/login/`, `/api/auth/register/`, `/api/auth/token/refresh/`, `/api/auth/me/` |
| Axios interceptor | Tự động refresh token; KHÔNG redirect `/login` trên 401 (public pages) |
| Admin guard | Admin layout redirect `/login` nếu chưa auth |

---

## VI. API ENDPOINTS (PUBLIC)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/products/` | Danh sách sản phẩm |
| GET | `/api/products/{id}/` | Chi tiết sản phẩm |
| GET | `/api/products/suggested/` | Sản phẩm gợi ý |
| GET | `/api/products/most_viewed/` | Sản phẩm xem nhiều |
| GET | `/api/products/price_zero/` | Sản phẩm giá 0 (thanh lý) |
| GET | `/api/sliders/` | Hero sliders |
| GET | `/api/blogs/` | Danh sách blog |
| GET | `/api/footer/` | Footer settings |
| POST | `/api/auth/register/` | Đăng ký |
| POST | `/api/auth/login/` | Đăng nhập (JWT) |
| POST | `/api/auth/token/refresh/` | Refresh token |

---

## VII. DOCKER

### Services

| Service | Port | Mô tả |
|---------|------|-------|
| postgres | 5432 | Database |
| django | 8000 | API backend |
| nextjs | 3000 | Frontend |
| nginx | **80** | Entry point (proxy) |

### Lệnh

```bash
# Build và start toàn bộ
docker compose up --build -d

# Chỉ rebuild frontend (nhanh hơn)
docker compose up --build -d nextjs

# Xem log
docker compose logs -f

# Dừng
docker compose down
```

### Seed data
- Chạy tự động khi django container start
- 22 products, 9 categories, 3 sliders, 3 blog posts, 1 notification, footer settings

---

## VIII. TÀI KHOẢN SEED

| Vai trò | Email | Password |
|---------|-------|----------|
| Admin | `admin@example.com` | `admin123` |
| Manager | `manager@example.com` | `password123` |
| Staff | `staff@example.com` | `password123` |

---

## IX. ROUTES

### Public (6 routes — có Navbar + Footer)
| Path | File | Mô tả |
|------|------|-------|
| `/` | `(public)/page.tsx` | Trang chủ |
| `/products` | `(public)/products/page.tsx` | Danh sách sản phẩm |
| `/products/[id]` | `(public)/products/[id]/page.tsx` | Chi tiết sản phẩm |
| `/blogs` | `(public)/blogs/page.tsx` | Blog |
| `/about` | `(public)/about/page.tsx` | Giới thiệu / Liên hệ |
| `/login` | `(public)/login/page.tsx` | Đăng nhập / Đăng ký |

### Admin (8 routes — yêu cầu auth)
| Path | Mô tả |
|------|-------|
| `/admin/dashboard` | Dashboard |
| `/admin/products` | Quản lý sản phẩm |
| `/admin/purchases` | Quản lý nhập hàng |
| `/admin/sales` | Quản lý bán hàng |
| `/admin/blogs` | Quản lý blog |
| `/admin/reports` | Báo cáo thống kê |
| `/admin/settings` | Cài đặt |

---

## X. UI BUG CÒN TỒN ĐỌNG

- [ ] **Hero slider**: text có thể wrap trên mobile rất nhỏ (< 360px)
- [ ] **Product list page**: chưa đối chiếu `template/product-list.html`
- [ ] **Product detail page**: chưa đối chiếu `template/product-detail.html`
- [ ] **Blog list page**: chưa đối chiếu `template/blogs-list.html`
- [ ] **About page**: chưa đối chiếu `template/us.html`
- [ ] **Responsive**: kiểm tra toàn bộ trên tablet + mobile
- [ ] **Admin pages**: không có template để đối chiếu

---

---

## XI. BACKEND ISSUES (từ Audit)

### P0 — Cần sửa gấp

| # | Issue | App | File | Mô tả |
|---|-------|-----|------|-------|
| B1 | **most_viewed / suggested / price_zero yêu cầu auth** | product_views | `views.py:11,24,32` | 3 API public dùng `@permission_classes([IsAuthenticated])` — frontend gọi không token → 401. Home page không load được suggested, most_viewed, price_zero |
| B2 | **Race condition khi bán hàng** | sales | `views.py:12-17` | Giữa `serializer.save()` và `product.save()` không có lock — request khác có thể bán cùng sản phẩm |
| B3 | **Purchase thiếu field validation** | purchases | `views.py:12-18` | Không check product.status trước khi set purchase_price |

### P1 — Quan trọng

| # | Issue | App | File | Mô tả |
|---|-------|-----|------|-------|
| B4 | **AuditLog signal không ghi được user** | audit_logs | `signals.py:57-64` | `_audit_user` không bao giờ được set → AuditLog.user luôn null. Không có views/serializers/URLs → không xem được log qua API |
| B5 | **Blog category không có detail endpoint** | blogs | `urls.py:18` | `cat_list` chỉ có list + create, không update/delete |
| B6 | **Product view đếm cả admin/staff** | products | `views.py:31-36` | `retrieve()` tạo ProductView cho mọi request kể cả admin → làm sai thống kê |
| B7 | **IsManager permission dead code** | core | `permissions.py:9-14` | Defined nhưng không được dùng ở bất kỳ view nào |

### P2 — Nên cải thiện

| # | Issue | App | File | Mô tả |
|---|-------|-----|------|-------|
| B8 | **Thiếu validation sale_price=0 là thanh lý hay lỗi?** | products | `models.py` | `sale_price=0` không rõ ý đồ — có thể là "giá 0" (thanh lý) hoặc "chưa set" |
| B9 | **Blog URLs conflict: slug vs UUID pk** | blogs | `urls.py:14-15` | `path("<slug:slug>")` và `path("<uuid:pk>")` có thể match cùng request |
| B10 | **Không có unit test** | — | — | Toàn bộ codebase backend không có test |
| B11 | **Không caching** | — | — | API products, blogs không cache — mỗi request query DB |
| B12 | **Không async** | — | — | Django synchronous, không dùng async views/tasks |

---

## XII. FRONTEND ISSUES (từ Audit)

### P0 — Cần sửa gấp

| # | Issue | File | Mô tả |
|---|-------|------|-------|
| F1 | **Thiếu trang /account** | `PublicNavbar.tsx:84` | Link `/account` dẫn đến 404 khi user đã login |
| F2 | **Auth race condition** | `AuthContext.tsx:30-44` | `getMe()` fail sau refresh token → user bị set null dù refresh token mới thành công |
| F3 | **Thiếu "Số điện thoại" trong register** | `login/page.tsx` | Template có phone field, frontend chỉ có full_name, email, password |

### P1 — Quan trọng

| # | Issue | File | Mô tả |
|---|-------|------|-------|
| F4 | **Admin products thiếu edit mode** | `admin/products/page.tsx` | Chỉ có create + delete, không có UI để edit product |
| F5 | **Admin blogs thiếu edit mode** | `admin/blogs/page.tsx` | Chỉ có create + delete, không có UI để edit blog |
| F6 | **Image upload chưa có UI** | `admin/products/page.tsx` | Service `uploadImage` tồn tại nhưng không được gọi từ UI |
| F7 | **Admin purchases/sales hardcode dates** | `admin/purchases/page.tsx`, `admin/sales/page.tsx` | `new Date().toISOString()` — user không chọn được ngày |
| F8 | **API endpoint mismatch** | `services/api.ts:31` | `${api.defaults.baseURL}/auth/refresh` — không handle refresh token fail gracefully |
| F9 | **Thiếu cart badge trên navbar** | `PublicNavbar.tsx:80-82` | Template có badge "3" trên cart icon, frontend chỉ là icon trơn |
| F10 | **Thiếu "Danh mục" nav link** | `PublicNavbar.tsx:10-15` | Template có link "Danh mục" nhưng frontend không có |

### P2 — Nên cải thiện

| # | Issue | File | Mô tả |
|---|-------|------|-------|
| F11 | **Public service trùng lặp** | `services/public.ts` | Trùng với `products.ts`, `blogs.ts`, `sliders.ts` |
| F12 | **SliderHero + NotificationBanner không dùng** | `components/public/` | Dead components — không import ở đâu |
| F13 | **Rating hardcode** | `(public)/page.tsx` | Tất cả product card đều hardcode "4.8 (120)" — không gọi API rating |
| F14 | **About page alert()** | `(public)/about/page.tsx` | Contact form dùng `alert()` thay vì gọi API |

---

## XIII. TEMPLATE MATCHING STATUS (chi tiết)

### Home (`template/home.html` ↔ `(public)/page.tsx`)
| Item | Template | Frontend | Status |
|------|----------|----------|--------|
| Hero slider | Full-width, overlay text | ✅ Matching | ✅ |
| Featured cards layout | Grid 2+2+1 | ✅ Matching | ✅ |
| Product grid columns | `lg:grid-cols-5` | `md:grid-cols-4` | ⚠️ |
| "Hot" badge | Có | ✅ Thêm "Hot" | ✅ |
| Rating stars | 1 star + số | ✅ Matching | ✅ |
| Thanh lý strikethrough | Luôn hiện | ✅ Matching | ✅ |
| Thanh lý discount badge | Tính động | ✅ Matching | ✅ |
| Blog dates | 2024 | ✅ Matching | ✅ |
| Horizontal scroll giá rẻ | Có | ❌ Thiếu | ❌ |
| **Overall** | | | **~80%** |

### Product List (`template/product-list.html` ↔ `(public)/products/page.tsx`)
| Item | Template | Frontend | Status |
|------|----------|----------|--------|
| Breadcrumb | Có | ❌ Thiếu | ❌ |
| Sort dropdown | "Bán chạy nhất", "Mới nhất", "Giá thấp", "Giá cao" | ❌ Chưa sort | ❌ |
| Category filter | Checkbox list | ❌ Chưa có | ❌ |
| Price filter | Range slider | ❌ Chưa có | ❌ |
| Product grid | 5 columns | 4 columns | ❓ |
| Pagination | Có | ❌ Chưa verify | ❓ |
| **Overall** | | | **~75%** |

### Product Detail (`template/product-detail.html` ↔ `(public)/products/[id]/page.tsx`)
| Item | Template | Frontend | Status |
|------|----------|----------|--------|
| Image gallery | Main + thumbnails | ❌ Chưa verify | ❓ |
| Product info | Tên, giá, category, SKU | ❌ Chưa verify | ❓ |
| Tabs | Mô tả, đánh giá, vận chuyển | ❌ Chưa verify | ❓ |
| Size/Picker | Có chọn size/số lượng | ❌ Chưa verify | ❓ |
| Related products | Grid 5 columns | ❌ Chưa verify | ❓ |
| **Overall** | | | **~70%** |

### Blog List (`template/blogs-list.html` ↔ `(public)/blogs/page.tsx`)
| Item | Template | Frontend | Status |
|------|----------|----------|--------|
| Blog cards | Image + title + excerpt + date | ✅ Matching | ✅ |
| Category filter | Có | ❌ Chưa verify | ❓ |
| Pagination | Có | ❌ Chưa verify | ❓ |
| **Overall** | | | **~85%** |

### About / Contact (`template/us.html` ↔ `(public)/about/page.tsx`)
| Item | Template | Frontend | Status |
|------|----------|----------|--------|
| Hero section | Có | ✅ Matching | ✅ |
| Contact form | Name, email, message | ✅ Có (alert() thay vì API) | ⚠️ |
| Map embed | Google Maps iframe | ❌ Chưa verify | ❓ |
| **Overall** | | | **~90%** |

### Login (`template/login.html` ↔ `(public)/login/page.tsx`)
| Item | Template | Frontend | Status |
|------|----------|----------|--------|
| Login/Register tabs | Có | ✅ Có | ✅ |
| Email field | Có | ✅ Có | ✅ |
| Password field | Có | ✅ Có | ✅ |
| Phone field | Có (register tab) | ❌ Thiếu | ❌ |
| Google login button | Có | ✅ Có (UI only) | ⚠️ |
| **Overall** | | | **~70%** |

---

## XIV. ADMIN COMPLETENESS

| Trang | CRUD | Ghi chú |
|-------|------|---------|
| Dashboard | ✅ Charts + summary cards | Gọi API dashboard/stats |
| Products | ⚠️ Chỉ create/delete | Thiếu edit UI + image upload |
| Purchases | ⚠️ Chỉ create | Thiếu edit + date picker |
| Sales | ⚠️ Chỉ create | Thiếu edit + date picker |
| Blogs | ⚠️ Chỉ create/delete | Thiếu edit UI |
| Reports | ✅ Charts + summary | Giống dashboard |
| Settings | ✅ Multi-tab CRUD | Footer, company, slider, notification |

---

## XV. PRIORITY FIX ORDER

### Phase 1 — P0 (Critical)
1. **P0-B1**: Fix most_viewed/suggested/price_zero permissions (public → AllowAny)
2. **P0-F1**: Thêm trang `/account` + `/cart` routes (tránh 404)
3. **P0-F2**: Fix Auth race condition — xử lý refresh token fail trong getMe()
4. **P0-F3**: Thêm "Số điện thoại" field trong register form

### Phase 2 — P1 (Important)
5. **P1-F4**: Admin edit mode cho products
6. **P1-F5**: Admin edit mode cho blogs
7. **P1-F6**: Image upload UI trong admin products
8. **P1-F7**: Date picker cho purchases/sales form
9. **P1-F9**: Thêm cart badge trên navbar
10. **P1-F10**: Thêm "Danh mục" nav link
11. **P1-F14**: Fix about page contact form (gọi API thay vì alert)

### Phase 3 — P2 + Template matching
12. **Template**: Product list page — breadcrumb, sort, filter
13. **Template**: Product detail page — image gallery, tabs, related
14. **Backend**: AuditLog user tracking + API
15. **Backend**: Race condition fix (select_for_update)
16. **Cleanup**: Dead components, duplicate services

---

## XVI. QUY TẮC PHÁT TRIỂN

1. **Template first** — Luôn đối chiếu file template trước khi sửa public page
2. **Header + Footer cố định** — Không thay đổi
3. **Theme tokens** — Dùng màu sắc/spacing/typography từ `globals.css`, không hardcode
4. **API proxy** — Tất cả API gọi qua `/api/*` (Nginx), không gọi trực tiếp Django
5. **Cục bộ trước** — Ưu tiên sửa trong `page.tsx`, không động tới `globals.css` nếu không cần global
6. **Build & verify** — `docker compose up --build -d nextjs` sau mỗi lần sửa
7. **JWT client-side** — Token trong localStorage, không BFF, không session cookie
8. **Không redirect 401** — Public pages không redirect `/login` khi token hết hạn
