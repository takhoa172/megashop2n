# VIETSHOP — Audit Report

> Generated: 2026-06-02
> Tổng quan toàn bộ dự án: backend (13 apps), frontend (14 routes), template matching (6 templates)

---

## I. TỔNG QUAN

| Thành phần | Trạng thái |
|-----------|-----------|
| Backend apps | 13 apps, 14 models, 33 API endpoints |
| Frontend routes | 7 public + 7 admin = 14 routes |
| Template matching | ~78% (trung bình 6 templates) |
| Docker | 4 services (postgres, django, nextjs, nginx) |
| Auth | JWT client-side, localStorage |
| Images | Cloudinary (cloud=dx1hqlg5a) |

---

## II. BACKEND ISSUES

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

## III. FRONTEND ISSUES

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
| F8 | **API endpoint mismatch** | `services/api.ts:31` | `${api.defaults.baseURL}/auth/refresh` — baseURL đã có `/api`, kết quả là `/api/auth/refresh` (đúng). Nhưng không handle refresh token fail gracefully |
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

## IV. TEMPLATE MATCHING STATUS

### Home (`template/home.html` ↔ `(public)/page.tsx`)

| Item | Template | Frontend | Status |
|------|----------|----------|--------|
| Hero slider | Full-width, overlay text | ✅ Matching | ✅ |
| Featured cards layout | Grid 2+2+1 | ✅ Matching | ✅ |
| Product grid columns | `lg:grid-cols-5` | `md:grid-cols-4` (user choice) | ⚠️ |
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
| Product grid | 5 columns | 4 columns (chưa verify) | ❓ |
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

## V. ADMIN COMPLETENESS

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

## VI. PRIORITY FIX ORDER

### Phase 1 — P0 (Critical)
1. **P0-F1**: Thêm trang `/account` + `/cart` routes (tránh 404)
2. **P0-F2**: Fix Auth race condition — xử lý refresh token fail trong getMe()
3. **P0-F3**: Thêm "Số điện thoại" field trong register form
4. **P0-B1**: Fix most_viewed/suggested/price_zero permissions (public → AllowAny)

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

## VII. QUY TẮC

- Header (PublicNavbar) + Footer (PublicFooter) **cố định** — không thay đổi
- Template HTML trong `frontend/public/template/` là reference chuẩn
- Màu sắc từ `globals.css` `@theme` — không hardcode
- API qua Nginx proxy (`/api/*`)
- JWT client-side, localStorage
- Không redirect 401 trên public pages
