# Inventory & Sales Management System

## 1. Project Overview

Xây dựng hệ thống quản lý nhập hàng, tồn kho, bán hàng và thống kê lợi nhuận.

Hệ thống phục vụ cho nhóm kinh doanh hàng hóa (ví dụ đồ chơi, mô hình, đồ sưu tầm, đồ cũ,...).

Mục tiêu:

* Quản lý sản phẩm nhập vào.
* Lưu lịch sử nhập hàng.
* Lưu người chịu trách nhiệm thanh toán vốn.
* Upload nhiều hình ảnh cho sản phẩm.
* Theo dõi trạng thái bán hàng.
* Quản lý giá nhập và giá bán.
* Tính vốn, doanh thu và lợi nhuận.
* Thống kê theo ngày, tháng, năm.
* Dashboard biểu đồ.
* Hỗ trợ nhiều người dùng với phân quyền.

---

# 2. Technology Stack

## Backend

* Python 3.12+
* Django 5+
* Django REST Framework
* PostgreSQL 16
* Django Admin
* Django Simple JWT
* Pillow
* django-filter

## Frontend

* Next.js 15 (App Router)
* TypeScript
* TailwindCSS
* Shadcn UI
* React Query (TanStack Query)
* Recharts

## Infrastructure

* Docker
* Docker Compose
* Nginx
* PostgreSQL
* MinIO (optional for image storage)

---

# 3. Architecture

```text
┌─────────────┐
│   Next.js   │
└──────┬──────┘
       │ REST API
       ▼
┌─────────────┐
│ Django DRF  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘

Django Admin
       │
       ▼
Admin Management
```

---

# 4. User Roles

## SUPER_ADMIN

Toàn quyền hệ thống.

## MANAGER

* Quản lý sản phẩm
* Quản lý bán hàng
* Xem báo cáo

## STAFF

* Tạo sản phẩm
* Cập nhật trạng thái
* Upload ảnh

---

# 5. Product Status

```python
PENDING_PRICE = "pending_price"
IN_STOCK = "in_stock"
SOLD = "sold"
CANCELLED = "cancelled"
```

---

# 6. Database Design

## users

Sử dụng Django Custom User Model.

| Field      | Type         | Constraint   |
| ---------- | ------------ | ------------ |
| id         | UUID         | PK           |
| username   | varchar(150) | unique       |
| email      | varchar(255) | unique       |
| full_name  | varchar(255) | required     |
| role       | varchar(30)  | required     |
| is_active  | boolean      | default=true |
| created_at | datetime     | auto         |
| updated_at | datetime     | auto         |

---

## categories

| Field       | Type         | Constraint |
| ----------- | ------------ | ---------- |
| id          | UUID         | PK         |
| name        | varchar(255) | unique     |
| slug        | varchar(255) | unique     |
| description | text         | nullable   |
| created_at  | datetime     | auto       |

---

## products

| Field          | Type          | Constraint |
| -------------- | ------------- | ---------- |
| id             | UUID          | PK         |
| sku            | varchar(50)   | unique     |
| category_id    | FK            | categories |
| name           | varchar(255)  | required   |
| description    | text          | nullable   |
| purchase_price | decimal(15,2) | >= 0       |
| sale_price     | decimal(15,2) | nullable   |
| status         | varchar(30)   | enum       |
| quantity       | integer       | default=1  |
| notes          | text          | nullable   |
| created_by     | FK            | users      |
| created_at     | datetime      | auto       |
| updated_at     | datetime      | auto       |

---

## product_images

| Field      | Type     | Constraint |
| ---------- | -------- | ---------- |
| id         | UUID     | PK         |
| product_id | FK       | products   |
| image      | file     |            |
| is_primary | boolean  |            |
| created_at | datetime |            |

Rules:

* Một sản phẩm có nhiều ảnh.
* Chỉ được có 1 ảnh chính.

---

## purchases

Lưu thông tin nhập hàng.

| Field          | Type     |
| -------------- | -------- |
| id             | UUID     |
| product_id     | FK       |
| payer_id       | FK users |
| purchase_price | decimal  |
| purchased_at   | datetime |
| note           | text     |

Rules:

* purchase_price phải >= 0
* bắt buộc có payer_id

---

## sales

Lưu lịch sử bán hàng.

| Field         | Type         |
| ------------- | ------------ |
| id            | UUID         |
| product_id    | FK           |
| sale_price    | decimal      |
| sold_at       | datetime     |
| sold_by       | FK users     |
| customer_name | varchar(255) |
| note          | text         |

Rules:

* Chỉ được tạo sale khi product.status != SOLD
* Sau khi sale thành công:

  * product.status = SOLD
  * product.sale_price = sale_price

---

# 7. Audit Log

## audit_logs

Theo dõi toàn bộ thay đổi.

| Field      | Type         |
| ---------- | ------------ |
| id         | UUID         |
| user_id    | FK           |
| action     | varchar(100) |
| table_name | varchar(100) |
| object_id  | UUID         |
| old_data   | JSONB        |
| new_data   | JSONB        |
| created_at | datetime     |

---

# 8. Business Rules

## Product Creation

Bắt buộc:

* name
* purchase_price
* payer
* status

---

## Price Validation

```python
purchase_price >= 0
sale_price >= 0
```

---

## Sold Product

Không được sửa:

* purchase_price
* payer
* purchase_date

Sau khi đã SOLD.

---

## Profit Formula

```python
profit = sale_price - purchase_price
```

---

# 9. Dashboard Metrics

## Today

* Total Revenue
* Total Cost
* Total Profit
* Products Sold

## Monthly

* Revenue
* Cost
* Profit

## Yearly

* Revenue
* Cost
* Profit

## Inventory

* Total Products
* In Stock
* Sold
* Pending Price

---

# 10. Charts

Frontend sử dụng Recharts.

### Revenue By Month

Line Chart

### Profit By Month

Bar Chart

### Inventory Status

Pie Chart

### Top Categories

Bar Chart

---

# 11. API Modules

## Authentication

```text
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

## Users

```text
GET /api/users
POST /api/users
PUT /api/users/{id}
DELETE /api/users/{id}
```

## Categories

```text
GET /api/categories
POST /api/categories
```

## Products

```text
GET /api/products
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}
```

Filtering:

```text
status
category
date range
keyword
```

## Purchases

```text
GET /api/purchases
POST /api/purchases
```

## Sales

```text
GET /api/sales
POST /api/sales
```

## Dashboard

```text
GET /api/dashboard/summary
GET /api/dashboard/revenue
GET /api/dashboard/profit
GET /api/dashboard/inventory
```

---

# 12. Django Project Structure

```text
backend/

apps/
├── users/
├── categories/
├── products/
├── purchases/
├── sales/
├── dashboard/
├── audit_logs/

core/
├── settings/
├── urls.py
├── permissions.py
├── pagination.py
├── exceptions.py

media/
static/

manage.py
```

---

# 13. NextJS Structure

```text
frontend/

src/

app/
├── login
├── dashboard
├── products
├── purchases
├── sales
├── reports
├── settings

components/
├── ui
├── charts
├── forms
├── tables

services/
├── api.ts
├── auth.ts

hooks/
lib/
types/
```

---

# 14. Docker Structure

```text
project-root/

backend/
frontend/
nginx/

docker-compose.yml
.env
```

---

# 15. Docker Services

## django

Port:

```text
8000
```

## nextjs

Port:

```text
3000
```

## postgres

Port:

```text
5432
```

## nginx

Port:

```text
80
443
```

---

# 16. Security Requirements

* JWT Authentication
* Role Based Access Control (RBAC)
* CSRF Protection
* Rate Limiting
* Secure Cookies
* Audit Logging
* Input Validation
* UUID Primary Keys

---

# 17. Coding Standards

Backend:

* Service Layer Pattern
* Repository Pattern
* Type Hints
* PEP8

Frontend:

* ESLint
* Prettier
* Strict TypeScript
* Feature Based Structure

---

# 18. Future Roadmap

Phase 2:

* Barcode Scanner
* QR Code
* Excel Import
* Excel Export
* Email Notification

Phase 3:

* Multi Warehouse
* Supplier Management
* Customer Management
* Mobile App

The generated code must be production-ready, strongly typed, scalable, follow clean architecture principles, and run completely using Docker Compose.
