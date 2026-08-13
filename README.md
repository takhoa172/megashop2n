# VIETSHOP — Hệ thống Quản lý Nhập hàng, Tồn kho & Bán hàng

Hệ thống quản lý nhập hàng, tồn kho, bán hàng và thống kê lợi nhuận. Phục vụ cho nhóm kinh doanh hàng hóa (đồ chơi, mô hình, đồ sưu tầm, đồ cũ,...). Website bán hàng cho khách liên hệ người bán qua Zalo / Facebook / Telegram / điện thoại, với thanh toán khi nhận hàng (COD) hoặc chuyển khoản.

## 🏗 Công nghệ

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12, Django 5, DRF, PostgreSQL 16 |
| **Frontend** | Next.js (App Router), TypeScript, TailwindCSS, Shadcn UI |
| **Auth** | JWT (SimpleJWT) — access + refresh token |
| **Search** | PostgreSQL Full-Text Search + bộ lọc nâng cao |
| **Recommendation** | Lịch sử xem hàng (theo IP / người dùng) + cùng danh mục |
| **Notify** | Email (SMTP) + SMS (API nhà cung cấp VN) khi có đơn hàng |
| **Image** | Cloudinary (storage) |
| **Cache** | Redis (django-redis) |
| **Infra** | Docker, Docker Compose, Nginx |

## 📁 Cấu trúc thư mục

```
project-root/
├── backend/
│   ├── apps/
│   │   ├── users/           # Custom User (UUID, role-based)
│   │   ├── categories/      # Danh mục sản phẩm
│   │   ├── products/        # Sản phẩm + ảnh Cloudinary + full-text search
│   │   ├── product_views/   # Xem nhiều nhất, gợi ý, gợi ý tìm kiếm, cho bạn, liên quan
│   │   ├── purchases/       # Nhập hàng
│   │   ├── sales/           # Bán hàng
│   │   ├── orders/          # Đơn hàng (COD / chuyển khoản)
│   │   ├── notifications/   # Email/SMS + thông báo banner
│   │   ├── dashboard/       # Thống kê biểu đồ
│   │   ├── audit_logs/      # Audit log tự động
│   │   ├── blogs/           # Bài viết blog
│   │   ├── sliders/         # Slider banner (Admin quản lý)
│   │   └── settings/        # Cấu hình hệ thống (footer, ...)
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
cp .env.example .env
```

### 2. Điền các biến môi trường vào `.env`
```
# Database
POSTGRES_DB=inventory_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=strong_password

# Django
DJANGO_SECRET_KEY=long-random-secret-key
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP) — bật thông báo đơn hàng
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_shop@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=VIETSHOP <your_shop@gmail.com>

# SMS — bật thông báo qua SMS (ESMS hoặc nhà cung cấp tương thích)
SMS_API_URL=https://esms.vn/SmsAPI/SendSms
SMS_API_KEY=your_sms_api_key
SMS_SENDER=your_sms_brandname
```

> **Lưu ý email/SMS**: hệ thống gửi không đồng bộ (`transaction.on_commit`) và **không chặn luồng đơn hàng** nếu gửi thất bại. Để trống `EMAIL_HOST_*` / `SMS_*` thì tính năng gửi sẽ được bỏ qua.

### 3. Chạy
```bash
docker-compose up --build
```

### 4. Truy cập
- **Web**: http://localhost
- **Admin Django**: http://localhost/django-admin/

### 5. Tài khoản mặc định (seed)
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
| GET | `/api/products/` | DS sản phẩm (filter: `status`, `category`, `keyword`, `q`, `sale_price__lte`, ...) |
| POST | `/api/products/` | Tạo sản phẩm |
| PUT | `/api/products/{id}` | Sửa sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |
| POST | `/api/products/{id}/upload-image` | Upload ảnh (Cloudinary) |
| DELETE | `/api/products/{id}/remove-image` | Xóa ảnh |
| GET | `/api/products/most-viewed` | Sản phẩm xem nhiều nhất |
| GET | `/api/products/suggested` | Sản phẩm gợi ý (is_suggested) |
| GET | `/api/products/price-zero` | Hàng thanh lý |
| GET | `/api/products/suggest?q=...` | Gợi ý tìm kiếm (autocomplete) |
| GET | `/api/products/for-you` | Gợi ý cá nhân theo lịch sử xem |
| GET | `/api/products/related/{product_id}` | Sản phẩm cùng danh mục |

> **Tìm kiếm nâng cao**: truyền `?q=<từ khóa>` để dùng PostgreSQL Full-Text Search trên `name`/`sku` (có rank sắp xếp), kết hợp các bộ lọc như `category`, `status`, `min_price`, `max_price`, `sale_price__lte`, ... — tương đương `?keyword=` tìm kiếm thường.

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/orders/` | Danh sách đơn hàng |
| POST | `/api/orders/` | Tạo đơn (tự động gửi email/SMS thông báo) |
| GET | `/api/orders/{id}` | Chi tiết đơn hàng |
| PATCH | `/api/orders/{id}/status/` | Cập nhật trạng thái (gửi email/SMS theo trạng thái) |
| PATCH | `/api/orders/{id}/payment/` | Đánh dấu đã thanh toán / chưa thanh toán |
| POST | `/api/orders/{id}/cancel/` | Hủy đơn (gửi email/SMS hủy) |

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

### Blogs / Sliders / Settings / Notifications
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/blogs/` | Danh sách bài viết |
| POST | `/api/blogs/` | Tạo bài viết |
| GET | `/api/blogs/{slug}` | Chi tiết bài viết |
| PUT | `/api/blogs/{id}` | Sửa bài viết |
| DELETE | `/api/blogs/{id}` | Xóa bài viết |
| GET | `/api/sliders/` | Danh sách slider (active) |
| POST | `/api/sliders/` | Tạo slider |
| GET | `/api/settings/footer` | Thông tin footer |
| PUT | `/api/settings/footer` | Cập nhật footer |
| GET | `/api/notifications/active` | Thông báo đang hoạt động |
| POST | `/api/contact` | Gửi liên hệ |

### System
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health/` | Kiểm tra sức khỏe hệ thống |

## 💳 Thanh toán & Đơn hàng

- **Phương thức**: `COD` (thanh toán khi nhận hàng) hoặc `CHUYEN_KHOAN` (chuyển khoản ngân hàng — chỉ hiển thị thông tin tài khoản, không có cổng thanh toán trực tuyến).
- **Trạng thái thanh toán**: `unpaid` / `paid` — Admin đánh dấu thủ công qua nút **"Cập nhật thanh toán"** trong trang đơn hàng (`PATCH /api/orders/{id}/payment/`).
- **Mua hàng**: khách liên hệ người bán qua Zalo / Facebook / Telegram / điện thoại (nút liên hệ trên trang sản phẩm). Form đặt hàng/giỏ hàng trực tuyến chưa được xây dựng.

## 👥 Roles & Permissions

| Role | Quyền |
|------|-------|
| **SUPER_ADMIN** | Toàn quyền hệ thống |
| **MANAGER** | Quản lý sản phẩm, đơn hàng, bán hàng, xem báo cáo |
| **STAFF** | Tạo sản phẩm, cập nhật trạng thái, upload ảnh |

## 📦 Thông báo đơn hàng

- Gửi **email** (SMTP) và **SMS** (API ESMS-style) khi:
  - Tạo đơn hàng mới
  - Cập nhật trạng thái đơn (xác nhận, đang giao, hoàn thành, ...)
  - Hủy đơn hàng
- Gửi bất đồng bộ sau khi commit giao dịch; lỗi gửi chỉ ghi log `warning`, không ảnh hưởng đơn hàng.
- Cấu hình: `EMAIL_HOST_*`, `DEFAULT_FROM_EMAIL`, `SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER` trong `.env`.

## 🔍 Tìm kiếm & Gợi ý

- **Full-text search**: `SearchVector(name, sku)` + `SearchQuery` (rank) → kết quả sắp theo độ liên quan.
- **Autocomplete**: `/api/products/suggest?q=...` → dropdown trên thanh tìm kiếm navbar (debounce 300ms).
- **Gợi ý cá nhân** (`for-you`): dựa trên lịch sử xem hàng theo IP/session của khách (đăng nhập hoặc ẩn danh) — ưu tiên các danh mục đã xem.
- **Sản phẩm liên quan** (`related/{id}`): ngẫu nhiên 8 sản phẩm cùng danh mục.

## 🛠 Business Rules

- `purchase_price >= 0`, `sale_price >= 0`
- Không được sửa `purchase_price` sau khi sản phẩm đã SOLD
- Mỗi sản phẩm chỉ có 1 ảnh chính
- Tạo Purchase → auto-update product purchase_price
- Tạo Sale → auto-set product.status=SOLD, product.sale_price=sale_price
- Chỉ bán được sản phẩm chưa SOLD
- Đơn hàng hủy → cập nhật lại tồn kho/trạng thái sản phẩm nếu đã giữ hàng

## 🔒 Security & Hardening

- JWT Authentication (access + refresh, refresh-token replay protected)
- Role Based Access Control (RBAC)
- Password validation (strong password policy) + throttling login/register
- Rate Limiting (django-ratelimit) trên endpoint nhạy cảm
- UUID Primary Keys
- Audit Logging
- File upload validate (MIME + size)
- Nginx: chặn truy cập ngoài `/django-admin`, không expose port DB ra ngoài
- Backend chạy non-root trong container
- Redis dùng cho cache + sessions

## 🐳 Docker Services

| Service | Port | Mô tả |
|---------|------|-------|
| Nginx | 80 | Reverse proxy |
| Django | 8000 | REST API |
| Next.js | 3000 | Frontend |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |

## 🚀 CI/CD

Workflow GitHub Actions (`.github/workflows/deploy.yml`):
1. **CI**: lint + typecheck + build frontend, kiểm tra config.
2. **Deploy**: `git fetch origin main && git reset --hard origin/main` trên server → build image → `docker compose up -d` → check `/api/health/`.

## 🧪 Kiểm thử & Dev

```bash
# Backend
cd backend
python3 -m py_compile apps/**/*.py core/**/*.py   # kiểm tra cú pháp
DJANGO_SETTINGS_MODULE=core.settings.dev python3 manage.py makemigrations
DJANGO_SETTINGS_MODULE=core.settings.dev python3 manage.py test

# Frontend
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

## 🌱 Seed Data

Chạy tự động khi khởi tạo Docker:
- 1 Super Admin, 1 Manager, 1 Staff
- 5 danh mục mẫu
