# VIETSHOP — Fix Notes

> File theo dõi tiến trình sửa lỗi
> Bắt đầu: 2026-06-02

---

## Phase 1 — P0 (Critical) ✅ Hoàn thành

| # | Issue | File | Status | Ghi chú |
|---|-------|------|--------|---------|
| B1 | most_viewed/suggested/price_zero yêu cầu auth | `backend/apps/product_views/views.py` | ✅ | Đổi IsAuthenticated → AllowAny |
| F1 | Thiếu trang /account | `frontend/src/app/(public)/account/page.tsx` | ✅ | Tạo route + page hiển thị thông tin user |
| F2 | Auth race condition | `frontend/src/contexts/AuthContext.tsx` | ✅ | Thêm refresh token fallback trước getMe() |
| F3 | Thiếu Số điện thoại trong register | `frontend/src/app/(public)/login/page.tsx` + backend | ✅ | Thêm phone field: model + serializer + UI |

## Phase 2 — P1 (Important) ✅ Hoàn thành

| # | Issue | File | Status | Ghi chú |
|---|-------|------|--------|---------|
| B2 | Race condition khi bán hàng | `backend/apps/sales/views.py` | ✅ | Thêm transaction.atomic + select_for_update |
| B3 | Purchase thiếu field validation | `backend/apps/purchases/views.py` | ✅ | Check product.status (sold/in_stock) |
| B4 | AuditLog không ghi user | `backend/apps/audit_logs/signals.py` + middleware | ✅ | Tạo AuditMiddleware thread-local + views/serializers/urls API |
| B5 | Blog category thiếu endpoints | `backend/apps/blogs/urls.py` | ✅ | Thêm cat_detail với get/put/patch/delete |
| B6 | Product view đếm admin/staff | `backend/apps/products/views.py` | ✅ | Filter: chỉ count nếu user không phải staff |
| B7 | IsManager permission dead code | `backend/apps/core/permissions.py` | ✅ | Đã xoá khỏi code (commit 580950b) |
| F9 | Cart badge trên navbar | `frontend/src/components/public/PublicNavbar.tsx` | ✅ | Thêm badge đỏ động từ CartContext |
| F10 | "Danh mục" nav link | `frontend/src/components/public/PublicNavbar.tsx` | ❌ | **Chưa thêm** vào `defaultNavLinks` — cần sửa |
| F14 | About page alert() | `frontend/src/app/(public)/about/page.tsx` | ✅ | Gọi API `/api/contact` thay vì alert(), thêm backend ContactView |

## Phase 3 — P2 + Template ✅ Đã hoàn thành

| # | Issue | File | Status | Ghi chú |
|---|-------|------|--------|---------|
| F4 | Admin products edit mode | `frontend/src/app/admin/products/page.tsx` | ✅ | Thêm edit button + update mutation + form populate |
| F5 | Admin blogs edit mode | `frontend/src/app/admin/blogs/page.tsx` | ✅ | Thêm edit button + update mutation + form populate |
| F6 | Image upload UI | `frontend/src/app/admin/products/page.tsx` | ✅ | Thêm file input + uploadImage + replace/set-primary |
| F7 | Date picker purchases/sales | `admin/purchases/page.tsx`, `admin/sales/page.tsx` | ✅ | Thay hardcode date = datetime-local input |
| B8 | sale_price=0 validation | `backend/apps/products/models.py` | ⚠️ | Chỉ thêm help_text, chưa có validation logic |
| B9 | Blog URLs conflict | `backend/apps/blogs/urls.py` | ✅ | Consolidate slug + UUID lookup trong 1 pattern |
| B10 | Unit test | — | ⏸️ | Ngoài phạm vi |
| B11 | Caching | — | ⏸️ | Ngoài phạm vi |
| F11 | Public service trùng lặp | `frontend/src/services/public.ts` | ✅ | Refactor: re-export từ canonical services |
| F12 | Dead components | `frontend/src/components/public/` | ✅ | Cả NotificationBanner + SliderHero đều được import |
| F13 | Rating hardcode | `frontend/src/app/(public)/page.tsx` | ⚠️ | Sao đã động (5 filled) nhưng text "4.8 (120)" vẫn hardcode |

## 📋 Tồn đọng (chưa xử lý)

| # | Issue | File | Priority | Ghi chú |
|---|-------|------|----------|---------|
| — | **F10: "Danh mục" nav link** | `PublicNavbar.tsx` | P1 | Chưa có trong `defaultNavLinks` |
| — | **API naming mismatch** | `services/public.ts` | P1 | Frontend gọi `most-viewed`/`price-zero` nhưng backend là `most_viewed`/`price_zero` |
| — | **`/account/orders` dead link** | `account/page.tsx` | P1 | Link đến 404, chưa có route |
| — | **Hero slider mobile** | — | P2 | Text wrap trên mobile <360px |
| — | **Responsive** | — | P2 | Kiểm tra tablet + mobile tổng thể |

---

## Log

| Thời gian | Hành động |
|-----------|-----------|
| 2026-06-02 | Khởi tạo fix-notes.md, cập nhật thongtin.md |
| 2026-06-02 | Fix P0-B1: product_views permissions → AllowAny |
| 2026-06-02 | Fix P0-F1: Tạo /account page |
| 2026-06-02 | Fix P0-F2: AuthContext race condition (refresh token fallback) |
| 2026-06-02 | Fix P0-F3: Thêm phone field (model + serializer + UI + migration) |
| 2026-06-02 | Fix P1-B2: Sales race condition (select_for_update + transaction) |
| 2026-06-02 | Fix P1-B3: Purchase validation (check product.status) |
| 2026-06-02 | Fix P1-B4: AuditLog user tracking + API (middleware + views + urls) |
| 2026-06-02 | Fix P1-B5: Blog category detail endpoints |
| 2026-06-02 | Fix P1-B6: Product view filter admin/staff |
| 2026-06-02 | Fix P1-F9: Cart badge (dynamic count). F10 bỏ sót — chưa thêm Danh mục nav link |
| 2026-06-02 | Fix P1-F14: Contact form API + backend ContactView |
| 2026-06-02 | Fix P2-B8: sale_price help_text clarify |
| 2026-06-02 | Fix P2-B9: Blog URLs reorder (UUID before slug) |
| 2026-06-02 | Fix P2-F4/F5: Admin products + blogs edit mode |
| 2026-06-02 | Fix P2-F6: Image upload UI admin products |
| 2026-06-02 | Fix P2-F7: Date picker purchases + sales |
| 2026-06-02 | Fix P2-F11: Public service refactor (re-export) |
| 2026-06-02 | Fix P2-F12: NotificationBanner → used in layout |
| 2026-06-02 | Fix P2-F13: Rating hardcode → 5 stars dynamic (còn text "4.8 (120)" hardcode) |
| 2026-06-02 | Fix pre-existing TS errors (null checks, queryFn types) |
| 2026-06-09 | Fix Phase A — VNPay: views.py (PaymentReturnView, init_payment), signals.py, urls.py |
| 2026-06-09 | Fix Phase B — VNPay frontend redirect, guest cart, sale_price=None, admin alert, cancel order button |
| 2026-06-09 | Fix error messages → tiếng Việt, order separation admin/customer (get_queryset + ?all=1) |
| 2026-06-09 | Fix Settings tabs key/label, Input component, whitespace-nowrap |
| 2026-06-09 | Fix Sidebar sticky (không mất khi scroll), Footer grid responsive (grid-cols-1 md:grid-cols-2) |
| 2026-06-09 | Fix Django Admin prefix: /admin/ → /django-admin/ (nginx + urls.py) |
| 2026-06-09 | Fix globals.css — thêm @source directives cho Tailwind v4 scan đúng |
| 2026-06-09 | Xoá dead code location /admin/ → Django trong nginx/default.conf
| 2026-06-09 | Bỏ max-w-xl khỏi Settings Site form (root cause: @theme --spacing-xl:32px làm max-w-xl=32px). Đồng thời thay max-w-3xl → max-w-[48rem] ở product detail 3 chỗ. Thêm comment cảnh báo trong globals.css.
| 2026-06-10 | Thêm VNPay config vars (.env), search filter cho OrderViewSet (backend), search input cho Admin Orders page (frontend). Rebuild Docker + verify HTTP 200. |
| 2026-07-06 | Chuyển đổi "Thêm vào giỏ" → "Liên hệ": thêm zalo/telegram vào FooterSettings, tạo ContactButton dropdown, xoá CartContext, redirect cart/checkout/success → / |
