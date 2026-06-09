# VIETSHOP V2 — Kế hoạch chi tiết

> **Mục tiêu:** Nâng cấp từ hệ thống quản lý kho → Sàn thương mại điện tử hoàn chỉnh
> **Trọng tâm:** Phân quyền khách hàng (CUSTOMER) + Giỏ hàng & Thanh toán (VNPay)

---

## Mục lục

1. [Tổng quan V2](#1-t%E1%BB%95ng-quan-v2)
2. [Phase A — Phân quyền & Order System (Backend)](#2-phase-a--ph%C3%A2n-quy%E1%BB%81n--order-system-backend)
3. [Phase B — Checkout & Payment (Frontend)](#3-phase-b--checkout--payment-frontend)
4. [Phase C — CI/CD hoàn thiện](#4-phase-c--cicd-ho%C3%A0n-thi%E1%BB%87n)
5. [Phase D — Testing](#5-phase-d--testing)
6. [Phase E — Template Matching hoàn thiện](#6-phase-e--template-matching-ho%C3%A0n-thi%E1%BB%87n)
7. [Phase F — Tối ưu & Nâng cấp](#7-phase-f--t%E1%BB%91i-%C6%B0u--n%C3%A2ng-c%E1%BA%A5p)
8. [Tổng tiến độ & Phân công](#8-t%E1%BB%95ng-ti%E1%BA%BFn-%C4%91%E1%BB%99--ph%C3%A2n-c%C3%B4ng)

---

## 1. Tổng quan V2

### Vấn đề hiện tại (V1)

- **Không có phân quyền người mua** — chỉ có admin/staff, không có customer role
- **Không có giỏ hàng thật** — cart client-side (localStorage), chưa có backend order
- **Không có thanh toán** — chưa tích hợp VNPay
- **CI/CD chưa chạy** — SSH timeout do server nhà (FPT)
- **Chưa có test** — không có unit test backend hay frontend
- **Template chưa khớp hoàn toàn** — product list, detail, about

### Hệ thống roles sau V2

```
Users
├── SUPER_ADMIN      ← Chủ shop (toàn quyền)
├── MANAGER          ← Quản lý (bán hàng, báo cáo)
├── STAFF            ← Nhân viên (tạo sản phẩm, ảnh)
└── CUSTOMER [V2]    ← Khách hàng (mua hàng, xem đơn hàng)
```

---

## 2. Phase A — Phân quyền & Order System (Backend)

> 🎯 **Mục tiêu:** Tạo backend order system + phân quyền CUSTOMER
> ⏱ **Dự kiến:** 3-4 ngày

### A1: Thêm role CUSTOMER [1 ngày]

Task nào?

- [ ] 1. Thêm `CUSTOMER = "customer"` vào User model role choices
- [ ] 2. Tạo serializer + view cho customer register (khác admin register)
- [ ] 3. Tạo permission class `IsCustomer` (chỉ customer được đặt hàng)
- [ ] 4. Phân quyền API:
  - Public API (products, blogs, sliders...) → AllowAny (như V1)
  - Order API → yêu cầu `IsCustomer` hoặc `IsStaffOrAdmin`
  - Admin API → yêu cầu `IsStaffOrAdmin` (như V1)
- [ ] 5. Migration + seed (thêm 1 customer mẫu)

**File ảnh hưởng:**

| File | Thay đổi |
|------|----------|
| `backend/apps/users/models.py` | Thêm `CUSTOMER` vào role choices |
| `backend/apps/users/serializers.py` | Tạo `CustomerRegisterSerializer` |
| `backend/apps/users/views.py` | Tạo customer register view |
| `backend/apps/users/urls.py` | Thêm route `/api/auth/register/customer/` |
| `backend/apps/core/permissions.py` | Thêm `IsCustomer` class |
| `backend/scripts/seed.py` | Thêm seed customer |

### A2: Order System — Models & API [1.5 ngày]

Task nào?

- [ ] 1. Tạo app `orders`
- [ ] 2. Model `Order`:

```python
class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Chờ xác nhận"),
        ("confirmed", "Đã xác nhận"),
        ("shipped", "Đang giao"),
        ("delivered", "Đã giao"),
        ("cancelled", "Đã hủy"),
    ]
    user = ForeignKey(User, null=True, blank=True)  # customer
    guest_email = EmailField(null=True, blank=True)  # khách vãng lai
    status = CharField(choices=STATUS_CHOICES, default="pending")
    subtotal = DecimalField(max_digits=15, decimal_places=2)
    shipping_fee = DecimalField(max_digits=15, decimal_places=2, default=0)
    total = DecimalField(max_digits=15, decimal_places=2)
    shipping_name = CharField(max_length=255)
    shipping_phone = CharField(max_length=20)
    shipping_address = TextField()
    note = TextField(blank=True)
    payment_method = CharField(max_length=20, choices=[("cod", "COD"), ("vnpay", "VNPay")])
    payment_status = CharField(max_length=20, default="unpaid")
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

- [ ] 3. Model `OrderItem`:

```python
class OrderItem(models.Model):
    order = ForeignKey(Order, related_name="items")
    product = ForeignKey(Product, on_delete=SET_NULL, null=True)
    product_name = CharField(max_length=255)  # snapshot
    product_image = URLField(max_length=500, blank=True)  # snapshot
    quantity = PositiveIntegerField()
    unit_price = DecimalField(max_digits=15, decimal_places=2)
    subtotal = DecimalField(max_digits=15, decimal_places=2)
```

- [ ] 4. Serializer: `OrderSerializer` (create + list + detail)
  - Create: nhận items từ cart payload → tự tính subtotal
- [ ] 5. ViewSet: `OrderViewSet`
  - `GET /api/orders/` → orders của customer hiện tại
  - `POST /api/orders/` → tạo đơn hàng mới
  - `GET /api/orders/{id}/` → chi tiết
  - `PATCH /api/orders/{id}/status/` → admin update status
- [ ] 6. URLs + register app
- [ ] 7. Signal: khi order confirmed → auto-update product status

**File ảnh hưởng:**

| File | Thay đổi |
|------|----------|
| `backend/apps/orders/models.py` | Mới: Order, OrderItem |
| `backend/apps/orders/serializers.py` | Mới |
| `backend/apps/orders/views.py` | Mới |
| `backend/apps/orders/urls.py` | Mới |
| `backend/apps/orders/signals.py` | Mới |
| `backend/core/settings/base.py` | Thêm `orders` vào INSTALLED_APPS |

### A3: Payment — VNPay Integration [0.5 ngày]

Task nào?

- [ ] 1. Model `Payment`:

```python
class Payment(models.Model):
    order = ForeignKey(Order, related_name="payments")
    amount = DecimalField(max_digits=15, decimal_places=2)
    method = CharField(max_length=20, choices=[("cod", "COD"), ("vnpay", "VNPay")])
    transaction_id = CharField(max_length=255, blank=True)
    vnpay_tmn_code = CharField(max_length=50, blank=True)
    vnpay_txn_ref = CharField(max_length=100, unique=True, blank=True)
    status = CharField(max_length=20, default="pending")
    paid_at = DateTimeField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

- [ ] 2. Helper `orders/payment.py`:
  - `create_payment_url(order, request)` → tạo URL VNPay
  - `verify_return(params)` → xác thực response từ VNPay
- [ ] 3. API endpoints:
  - `POST /api/payment/init/` → trả về URL VNPay
  - `GET /api/payment/return/` → VNPay redirect về đây, verify + update payment_status
- [ ] 4. Thêm cấu hình VNPay vào `.env`:
  - `VNPAY_TMN_CODE`
  - `VNPAY_HASH_SECRET`
  - `VNPAY_RETURN_URL`

---

## 3. Phase B — Checkout & Payment (Frontend)

> 🎯 **Mục tiêu:** Hoàn thiện luồng mua hàng từ cart → thanh toán → xác nhận
> ⏱ **Dự kiến:** 3-4 ngày

### B1: Checkout Page [1 ngày]

- [ ] 1. Tạo `(public)/checkout/page.tsx`:
  - Form thông tin giao hàng: họ tên, SĐT, địa chỉ, ghi chú
  - Chọn phương thức thanh toán: COD / VNPay
  - Order summary: danh sách sản phẩm, tạm tính, phí ship, tổng cộng
  - Nút "Đặt hàng"
- [ ] 2. Service `services/orders.ts`:
  - `createOrder(data)` → POST `/api/orders/`
  - `getOrders()` → GET `/api/orders/`
  - `getOrder(id)` → GET `/api/orders/{id}/`
- [ ] 3. Service `services/payment.ts`:
  - `initPayment(orderId, method)` → POST `/api/payment/init/`

### B2: Cart → Checkout Flow [0.5 ngày]

- [ ] 1. Nút "Tiến hành đặt hàng" trong `cart/page.tsx`
  - Nếu chưa login → redirect `/login?redirect=/checkout`
  - Nếu đã login → redirect `/checkout`
- [ ] 2. Cart trong Checkout page:
  - Đọc từ CartContext → hiển thị danh sách sản phẩm
  - Cho phép chỉnh sửa số lượng
- [ ] 3. Xử lý không có hàng trong kho:
  - Check tồn kho trước khi tạo order
  - Nếu hết hàng → thông báo + xóa khỏi cart

### B3: Order Confirmation [0.5 ngày]

- [ ] 1. Tạo `(public)/order/success/page.tsx`:
  - Hiển thị thông báo đặt hàng thành công
  - Mã đơn hàng, tổng tiền, phương thức thanh toán
  - Nút "Xem đơn hàng" → `/account/orders/{id}`
  - Nút "Tiếp tục mua sắm" → `/products`
- [ ] 2. Nếu chọn VNPay: redirect sang cổng VNPay
  - Sau khi thanh toán xong, VNPay redirect về `/order/success`

### B4: Order History & Detail [1 ngày]

- [ ] 1. Tạo `(public)/account/orders/page.tsx`:
  - Danh sách đơn hàng của user hiện tại
  - Bảng: mã đơn, ngày, tổng tiền, trạng thái, payment status
  - Click → chi tiết
- [ ] 2. Tạo `(public)/account/orders/[id]/page.tsx`:
  - Thông tin đơn hàng
  - Danh sách sản phẩm (ảnh + tên + số lượng + giá)
  - Thông tin giao hàng
  - Timeline trạng thái (pending → confirmed → shipped → delivered)
  - Nút "Hủy đơn" (nếu status = pending)

### B5: Admin Order Management [1 ngày]

- [ ] 1. Tạo `admin/orders/page.tsx`:
  - DataTable: tất cả đơn hàng
  - Filter: status, payment method, date range
  - Search: mã đơn, tên khách hàng
- [ ] 2. Tạo `admin/orders/[id]/page.tsx`:
  - Xem chi tiết đơn hàng + items
  - Cập nhật trạng thái (dropdown + button)
  - Thông tin khách hàng + giao hàng
- [ ] 3. Service `services/orders.ts` (admin):
  - `getAllOrders()` → GET `/api/orders/admin/`
  - `updateOrderStatus(id, status)` → PATCH `/api/orders/{id}/status/`

---

## 4. Phase C — CI/CD hoàn thiện

> 🎯 **Mục tiêu:** Tự động deploy khi push code lên main
> ⏱ **Dự kiến:** 1 ngày
> ⚠️ **Vấn đề V1:** GitHub Actions SSH timeout do server nhà (FPT)

### C1: GitHub Self-Hosted Runner [0.5 ngày]

Giải pháp: Cài GitHub Actions Runner **trên chính server** thay vì SSH từ GitHub cloud.

- [ ] 1. Lên GitHub → Settings → Actions → Runners → New self-hosted runner
- [ ] 2. SSH vào server, chạy script cài runner:

```bash
# Tạo user riêng cho runner
sudo useradd -m -s /bin/bash ghrunner
sudo -u ghrunner mkdir -p /home/ghrunner/actions-runner
cd /home/ghrunner/actions-runner

# Tải + cấu hình (lấy link từ GitHub UI)
curl -o actions-runner-linux-x64-2.xyz.tar.gz -L https://github.com/actions/runner/releases/...
tar xzf actions-runner-linux-x64-2.xyz.tar.gz
./config.sh --url https://github.com/takhoa172/megashop2n --token <TOKEN>
```

- [ ] 3. Cài runner làm service:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

- [ ] 4. Kiểm tra: GitHub UI thấy runner online (xanh lá)

### C2: Cập nhật workflow [0.5 ngày]

- [ ] 1. Sửa `.github/workflows/deploy.yml`: dùng `self-hosted` runner
- [ ] 2. Thêm steps: build Docker, chạy migration, dọn dẹp
- [ ] 3. Test: push 1 commit → kiểm tra workflow chạy OK

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: self-hosted           # ← Chạy trên server, không SSH
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy
        working-directory: /opt/vietshop
        run: |
          git pull origin main
          docker compose up -d --build
          docker system prune -f
```

---

## 5. Phase D — Testing

> 🎯 **Mục tiêu:** Có test cơ bản cho backend + frontend
> ⏱ **Dự kiến:** 2-3 ngày

### D1: Backend — pytest [1.5 ngày]

- [ ] 1. Setup: `pytest`, `pytest-django`, `pytest-cov` → `requirements.txt`
- [ ] 2. Tạo `pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = core.settings.local
python_files = tests.py test_*.py *_tests.py
```

- [ ] 3. Model tests: `backend/apps/*/tests/test_models.py`
  - Test User creation, role validation
  - Test Product status workflow
  - Test Order creation + total calculation
- [ ] 4. API tests: `backend/apps/*/tests/test_api.py`
  - Test CRUD endpoints
  - Test permissions (admin vs customer vs anonymous)
  - Test filters, sort, pagination
- [ ] 5. Workflow tests:
  - Test Purchase → auto-update purchase_price
  - Test Sale → auto-set status=SOLD
  - Test Order → auto-calculate totals

### D2: Frontend — vitest [1 ngày]

- [ ] 1. Setup: `vitest`, `@testing-library/react`, `jsdom` → `package.json`

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] 2. Component tests: `frontend/src/**/*.test.tsx`
  - `ProductCard.test.tsx` — render, click add to cart
  - `Cart.test.tsx` — add/remove items, tính tổng
  - `Login.test.tsx` — form validation
  - `Navbar.test.tsx` — render links, responsive
- [ ] 3. Service tests:
  - `api.test.ts` — interceptor, refresh token
  - `auth.test.ts` — login, register, getMe

---

## 6. Phase E — Template Matching hoàn thiện

> 🎯 **Mục tiêu:** Các public page khớp 100% với template HTML gốc
> ⏱ **Dự kiến:** 2 ngày

### E1: Product List (~75% → 95%)

| Item | Template | Hiện tại | Việc cần làm |
|------|----------|----------|-------------|
| Breadcrumb | `Sản phẩm / Danh mục` | ❌ Thiếu | Thêm breadcrumb component |
| Price range filter | Thanh trượt giá | ❌ Thiếu | Thêm range slider (min/max input) |
| Grid columns | 5 columns | 3 columns (mobile: 2) | Giữ nguyên 3 (user choice) |

### E2: Product Detail (~70% → 95%)

| Item | Template | Hiện tại | Việc cần làm |
|------|----------|----------|-------------|
| Image gallery | Click thumbnail → đổi ảnh chính | ✅ Có | Kiểm tra/hoàn thiện |
| Tabs | Mô tả / Đánh giá / Vận chuyển | ✅ Có | Kiểm tra nội dung |
| Size/Quantity | Select size + số lượng | ❌ Thiếu | Thêm quantity input + size selector |
| Share buttons | Chia sẻ FB/Twitter/Zalo | ❌ Thiếu | Thêm share links |

### E3: Blog List (~85% → 100%)

| Item | Template | Hiện tại | Việc cần làm |
|------|----------|----------|-------------|
| Pagination | Phân trang | ❌ Chưa verify | Kiểm tra + fix nếu cần |

### E4: About (~90% → 100%)

| Item | Template | Hiện tại | Việc cần làm |
|------|----------|----------|-------------|
| Google Maps | Iframe bản đồ | ✅ Có placeholder | Thêm API key thật |

---

## 7. Phase F — Tối ưu & Nâng cấp

> 🎯 **Mục tiêu:** Cải thiện performance + chuẩn bị cho scale
> ⏱ **Dự kiến:** 2 ngày

### F1: Caching (Backend)

- [ ] 1. Thêm `django-redis` + cấu hình Redis trong docker-compose
- [ ] 2. Cache API products, blogs (cache 5 phút)
- [ ] 3. Cache dashboard stats (cache 1 giờ)

### F2: Image Optimization (Frontend)

- [ ] 1. Lazy load images: `loading="lazy"` trên tất cả `<img>`
- [ ] 2. Next.js Image component cho product images
- [ ] 3. Placeholder/blur while loading

### F3: Async Tasks

- [ ] 1. Thêm `celery` + Redis cho async tasks
- [ ] 2. Async: send email xác nhận đơn hàng, cleanup logs

### F4: SEO

- [ ] 1. Dynamic meta tags cho mỗi trang (tiêu đề, description, og:image)
- [ ] 2. Sitemap.xml tự động
- [ ] 3. robots.txt

---

## 8. Tổng tiến độ & Phân công

### Timeline

```
Phase A (Phân quyền + Order BE)     ████████░░░░   3.5 ngày
Phase B (Checkout + Payment FE)      ░░░░████████   4 ngày
Phase C (CI/CD)                      ░░░░░░░░████   1 ngày
Phase D (Testing)                    ░░░░░░░░░███   2.5 ngày
Phase E (Template matching)          ░░░░░░░░░░██   2 ngày
Phase F (Tối ưu)                     ░░░░░░░░░░░█   2 ngày
                                     ─────────────────
Tổng cộng:                            ~15 ngày
```

### Priority bắt buộc

| Phải có V2 | Nên có | Thì có |
|------------|--------|--------|
| Phase A — Phân quyền + Order | Phase D — Testing | Phase F — Tối ưu |
| Phase B — Checkout + Payment | Phase E — Template | |
| Phase C — CI/CD | | |

### Các file sẽ tạo trong V2

```
backend/apps/orders/
├── __init__.py
├── models.py          # Order, OrderItem, Payment
├── serializers.py     # OrderSerializer, PaymentSerializer
├── views.py           # OrderViewSet, PaymentViewSet
├── urls.py            # /api/orders/, /api/payment/
├── payment.py         # VNPay helper
├── signals.py         # Auto-update product status
└── tests/
    ├── test_models.py
    └── test_api.py

frontend/src/app/(public)/
├── checkout/page.tsx           # Trang thanh toán
├── order/success/page.tsx      # Xác nhận đơn hàng
└── account/orders/
    ├── page.tsx                # Lịch sử đơn hàng
    └── [id]/page.tsx           # Chi tiết đơn hàng

frontend/src/app/admin/orders/
├── page.tsx                    # Quản lý đơn hàng
└── [id]/page.tsx               # Chi tiết đơn (admin)

frontend/src/services/
├── orders.ts                   # API orders
└── payment.ts                  # API payment
```

### Lưu ý khi phát triển V2

1. **Không sửa file V1** — tất cả tính năng V1 vẫn hoạt động
2. **Template first** — đối chiếu `public/template/` trước khi sửa public page
3. **Theme tokens** — dùng `globals.css`, không hardcode
4. **JWT client-side** — không BFF, không session cookie
5. **Không redirect 401** — public pages không redirect `/login`
6. **Test trước khi merge** — ít nhất chạy thử manual

---

> **Kế hoạch V2 — 08-06-2026**
> Xem thêm: `README-V1.md` (tổng quan V1)
