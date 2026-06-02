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

## XI. QUY TẮC PHÁT TRIỂN

1. **Template first** — Luôn đối chiếu file template trước khi sửa public page
2. **Header + Footer cố định** — Không thay đổi
3. **Theme tokens** — Dùng màu sắc/spacing/typography từ `globals.css`, không hardcode
4. **API proxy** — Tất cả API gọi qua `/api/*` (Nginx), không gọi trực tiếp Django
5. **Cục bộ trước** — Ưu tiên sửa trong `page.tsx`, không động tới `globals.css` nếu không cần global
6. **Build & verify** — `docker compose up --build -d nextjs` sau mỗi lần sửa
7. **JWT client-side** — Token trong localStorage, không BFF, không session cookie
8. **Không redirect 401** — Public pages không redirect `/login` khi token hết hạn
