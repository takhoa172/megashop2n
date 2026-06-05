# Hướng dẫn đưa VIETSHOP lên Internet (Từ A-Z cho người mới)

> Ngày: 04-06-2026 | Domain: megashop2n.io.vn
> Kiến trúc: Internet → Cloudflare → Cloudflare Tunnel → Ubuntu Server → Docker → Website

---

## Mục lục

1. [Giới thiệu & Kiến trúc](#1-giới-thiệu--kiến-trúc)
2. [Những thứ cần có](#2-những-thứ-cần-có)
3. [Cài Docker trên Server (Bước 1)](#3-cài-docker-trên-server)
4. [Clone dự án về Server (Bước 2)](#4-clone-dự-án-về-server)
5. [Tạo file .env Production (Bước 3)](#5-tạo-file-env-production)
6. [Cấu hình Nginx (Bước 4)](#6-cấu-hình-nginx)
7. [Build & Chạy Docker (Bước 5)](#7-build--chạy-docker)
8. [Cấu hình Cloudflare + Tunnel (Bước 6)](#8-cấu-hình-cloudflare--tunnel)
9. [Cấu hình CI/CD - Tự động deploy (Bước 7)](#9-cấu-hình-cicd---tự-động-deploy)
10. [Bảo trì & Troubleshooting](#10-bảo-trì--troubleshooting)
11. [Kết luận](#11-kết-luận)

---

## 1. Giới thiệu & Kiến trúc

### Kiến trúc tổng thể

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌───────────────────┐
│          │     │          │     │             │     │          │     │  Docker Containers │
│  Bạn     │────▶│Cloudflare│────▶│  Tunnel     │────▶│  Server  │────▶│  ┌─────┐ ┌─────┐  │
│ (Browser)│     │  (Proxy) │     │ (cloudflared)│     │ (Ubuntu) │     │  │Nginx│ │Django│  │
│          │     │          │     │             │     │          │     │  ├─────┤ ├─────┤  │
│          │     │   SSL    │     │   Kết nối   │     │  Không   │     │  │Next │ │Post │  │
│          │     │  miễn    │     │   ngược     │     │  cần mở  │     │  │ .js │ │gres │  │
│          │     │  phí     │     │   ra ngoài  │     │   port   │     │  └─────┘ └─────┘  │
└──────────┘     └──────────┘     └─────────────┘     └──────────┘     └───────────────────┘
```

### Giải thích đơn giản (cho người mới)

| Thành phần | Là gì? | Vai trò |
|-----------|--------|---------|
| **Bạn (Browser)** | Trình duyệt Chrome/Firefox | Gõ `megashop2n.io.vn` để xem web |
| **Cloudflare** | Dịch vụ bảo vệ web | Bảo vệ DDOS, cấp SSL (https) miễn phí, che IP server thật |
| **Cloudflare Tunnel** | Ống kết nối riêng | `cloudflared` trên server tự kết nối ra Cloudflare. **Không cần mở port 80/443** trên server, rất an toàn |
| **Server (Ubuntu)** | Máy tính đặt tại trung tâm dữ liệu | Chạy Docker để chứa website |
| **Docker** | Phần mềm chạy các "container" | Mỗi container là 1 thành phần (Nginx, Django, Next.js, Postgres) |
| **Nginx** | Web server (cánh cửa) | Tiếp nhận request, quyết định gửi đến Django (API) hay Next.js (trang web) |
| **Django** | Backend (bộ não) | Xử lý API, kết nối database, login, quản lý sản phẩm... |
| **Next.js** | Frontend (giao diện) | Render trang web, gửi request lên API |
| **PostgreSQL** | Database (kho chứa) | Lưu sản phẩm, người dùng, đơn hàng... |

### Kiến trúc này tốt thế nào?

| Đặc điểm | Lợi ích |
|----------|---------|
| ✅ **Bảo mật** | Không mở port SSH/Docker ra ngoài, tunnel là kết nối ra (không cho vào) |
| ✅ **SSL miễn phí** | Cloudflare Full Strict tự cấp chứng chỉ HTTPS |
| ✅ **Dễ update** | Muốn deploy code mới chỉ cần `git push`, CI/CD tự làm phần còn lại |
| ✅ **Dễ scale** | Muốn chạy nhiều hơn, thêm container |
| ✅ **Chi phí thấp** | Server rẻ nhất, Cloudflare miễn phí |

---

## 2. Những thứ cần có

Trước khi bắt đầu, bạn cần chuẩn bị:

- [ ] **Một VPS/Server** — Ubuntu 22.04 hoặc 24.04 (tối thiểu 1 CPU, 1GB RAM, 20GB SSD)
- [ ] **Tên miền** — Ví dụ `megashop2n.io.vn` (đã mua và trỏ nameserver về Cloudflare)
- [ ] **Tài khoản Cloudflare** (miễn phí)
- [ ] **Tài khoản GitHub** (chứa source code)
- [ ] **SSH client** — Để kết nối vào server (Terminal trên Mac/Linux, hoặc PuTTY trên Windows)

---

## 3. Cài Docker trên Server

> **Docker là gì?** Docker là phần mềm giúp chạy ứng dụng trong các "container" — giống như những chiếc hộp chứa code, mỗi hộp riêng biệt. Thay vì cài Django, Node.js, Postgres trực tiếp lên máy, Docker chạy chúng trong các hộp riêng, dễ quản lý, dễ xoá, dễ cài lại.

**Bước 1:** SSH vào server

```bash
ssh root@your-server-ip
```

Giải thích: Lệnh này kết nối vào server từ xa, `root` là tài khoản admin, `your-server-ip` là địa chỉ IP của server.

**Bước 2:** Cập nhật hệ thống

```bash
apt update && apt upgrade -y
```

Giải thích: `apt update` — kiểm tra phiên bản mới của các phần mềm. `apt upgrade -y` — cập nhật lên phiên bản mới. `-y` là tự động trả lời "Yes" cho mọi câu hỏi.

**Bước 3:** Cài Docker

```bash
curl -fsSL https://get.docker.com | sh
```

Giải thích: `curl` — tải file từ internet. `-fsSL` — các option để yên lặng và theo dõi redirect. `| sh` — chạy script vừa tải để tự động cài Docker.

**Bước 4:** Cài Docker Compose

```bash
apt install docker-compose-plugin -y
```

Giải thích: Docker Compose là công cụ chạy **nhiều container cùng lúc** (Nginx + Django + Next.js + Postgres) chỉ với 1 lệnh.

**Bước 5:** Kiểm tra

```bash
docker --version
docker compose version
```

Kết quả mong đợi:
```
Docker version 29.5.3 ...
Docker Compose version v5.1.4 ...
```

---

## 4. Clone dự án về Server

> **Git clone là gì?** Giống như bạn tải một folder từ GitHub về máy tính mình. Máy tính ở đây là server.

```bash
cd /opt
git clone https://github.com/takhoa172/megashop2n.git vietshop
cd vietshop
```

Giải thích:
- `cd /opt` — vào thư mục `/opt` (nơi chứa ứng dụng trên Linux)
- `git clone ... vietshop` — tải code từ GitHub về thư mục tên `vietshop`
- `cd vietshop` — vào thư mục vừa tải

Kiểm tra:

```bash
ls -la
```

Phải thấy: `docker-compose.yml`, `nginx/`, `backend/`, `frontend/`, ...

---

## 5. Tạo file .env Production

> **.env là gì?** File chứa các **cấu hình bí mật** (như mật khẩu, khoá API). File này KHÔNG được đưa lên GitHub vì lộ mật khẩu. Mỗi môi trường (máy local, server) có file .env riêng.

### 5.1 Tạo Django Secret Key

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

Giải thích: Lệnh này tạo một chuỗi **khoá bí mật** 50 ký tự, dùng để mã hoá session, mật khẩu của Django. Kết quả sẽ như: `3xK9...hG2`.

Copy chuỗi này (bôi đen → chuột phải copy).

### 5.2 Tạo file .env

```bash
nano .env
```

Giải thích: `nano` là trình soạn thảo văn bản trong terminal (giống Notepad). File `.env` sẽ được tạo mới.

Paste nội dung sau (click chuột phải để paste).

**Nếu bạn dùng Cloudflare Tunnel:**

```env
# Database
POSTGRES_DB=inventory_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=Mk9#pQ2xZ7!vL     # ← Đặt mật khẩu riêng của bạn
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Django
DJANGO_SECRET_KEY=3xK9...            # ← Paste secret key bạn vừa tạo
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=megashop2n.io.vn,www.megashop2n.io.vn

# JWT
JWT_ACCESS_TOKEN_LIFETIME=30
JWT_REFRESH_TOKEN_LIFETIME=1

# Cloudinary (giữ nguyên từ .env trên máy bạn)
CLOUDINARY_CLOUD_NAME=dx1hqlg5a
CLOUDINARY_API_KEY=694799122696242
CLOUDINARY_API_SECRET=ylbYhzKHa7PtuhMQ3l5toN51Uw0

# CORS - Cho phép domain nào được gọi API
CORS_ALLOWED_ORIGINS=https://megashop2n.io.vn,https://www.megashop2n.io.vn

# Frontend - URL API mà trình duyệt gọi đến
NEXT_PUBLIC_API_URL=https://megashop2n.io.vn/api
```

### Giải thích từng dòng trong .env

| Dòng | Ý nghĩa | Giải thích |
|------|---------|-----------|
| `POSTGRES_*` | Cấu hình database | Tên database, user, password — Django dùng để kết nối Postgres |
| `DJANGO_SECRET_KEY` | Khoá bí mật của Django | Dùng để mã hoá session, token. Nếu lộ, kẻ xấu có thể giả mạo user |
| `DJANGO_DEBUG=False` | Tắt chế độ debug | Ở production phải là `False`, nếu không sẽ lộ lỗi chi tiết cho hacker |
| `DJANGO_ALLOWED_HOSTS` | Domain được phép truy cập | Chỉ cho phép `megashop2n.io.vn` gọi vào Django, domain khác từ chối |
| `CLOUDINARY_*` | Cấu hình upload ảnh | Dùng dịch vụ Cloudinary để lưu ảnh sản phẩm |
| `CORS_ALLOWED_ORIGINS` | Cho phép domain nào gọi API | Trình duyệt sẽ chặn nếu không có domain này |
| `NEXT_PUBLIC_API_URL` | Địa chỉ API frontend gọi | Trình duyệt người dùng sẽ gọi `https://megashop2n.io.vn/api/...` |

**Lưu file:** `Ctrl+X` → `Y` → `Enter`

**Kiểm tra:**

```bash
cat .env
```

Phải thấy toàn bộ nội dung bạn vừa paste.

---

## 6. Cấu hình Nginx

> **Nginx là gì?** Nginx là "người gác cửa" — khi có request từ trình duyệt vào, nó quyết định:
> - Nếu là `/api/*` → gửi cho **Django**
> - Nếu là `/admin/*` → gửi cho **Django**
> - Còn lại → gửi cho **Next.js**

Mở file config:

```bash
cd /opt/vietshop
nano nginx/default.conf
```

Tìm dòng:

```
server_name localhost;
```

Sửa thành:

```
server_name megashop2n.io.vn www.megashop2n.io.vn;
```

Giải thích: Nginx cần biết nó đang phục vụ domain nào. Nếu không sửa, chỉ có `localhost` mới truy cập được.

**Lưu file:** `Ctrl+X` → `Y` → `Enter`

---

## 7. Build & Chạy Docker

> **Docker compose là gì?** Lệnh `docker compose up -d --build` đọc file `docker-compose.yml` và làm lần lượt:
> 1. Tải các image (Python, Node, Nginx, Postgres) từ kho Docker Hub
> 2. Cài đặt dependencies trong từng container
> 3. Chạy 4 container cùng lúc

```bash
cd /opt/vietshop
docker compose up -d --build
```

Giải thích:
- `up` — khởi động các container
- `-d` — chạy ngầm (không chiếm terminal)
- `--build` — build lại image (cài dependencies mới) trước khi chạy

Quá trình này mất **5-10 phút** tuỳ tốc độ server.

**Kiểm tra sau khi xong:**

```bash
docker compose ps
```

Bạn phải thấy 4 container đều `Up`:

| NAME | STATUS |
|------|--------|
| vietshop-postgres-1 | Up (healthy) |
| vietshop-django-1 | Up |
| vietshop-nextjs-1 | Up |
| vietshop-nginx-1 | Up |

Nếu có container nào `Exit` hoặc `Restarting`, xem log:

```bash
docker compose logs <tên-container>
# Ví dụ:
docker compose logs django
```

### Các lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `django.db.utils.OperationalError` | Postgres chưa kịp khởi động | Đợi 30s rồi chạy lại `docker compose up -d` |
| `ModuleNotFoundError: No module named '...'` | Thiếu package trong requirements.txt | Cài thủ công hoặc thêm vào file |
| `port is already allocated` | Port 80 hoặc 5432 đã có service chạy | Tắt service đó: `systemctl stop apache2` |

---

## 8. Cấu hình Cloudflare + Tunnel

> **Cloudflare Tunnel là gì?** Thay vì mở cổng server (port 80/443) ra internet (dễ bị hack), Tunnel tạo một **đường ống riêng** từ server ra Cloudflare. Server **chủ động kết nối ra ngoài**, hacker không thể vào server.

### 8.1 Cấu hình DNS trên Cloudflare

Lên **dash.cloudflare.com** → chọn domain `megashop2n.io.vn`:

1. Vào tab **DNS** → **Records**
2. Tạo A record:
   - **Name**: `@` (hoặc để trống)
   - **IPv4 address**: IP server của bạn
   - **Proxy status**: Bật (màu cam)
3. (Tuỳ chọn) Tạo thêm www record:
   - **Name**: `www`
   - **IPv4 address**: IP server
   - **Proxy status**: Bật cam

### 8.2 Cấu hình SSL (miễn phí)

1. **SSL/TLS** → **Overview**
2. Chọn **Full Strict**
   - *Full*: Cloudflare mã hoá kết nối đến server
   - *Strict*: Yêu cầu server PHẢI có chứng chỉ hợp lệ (Tunnel tự lo việc này)

### 8.3 Cài Cloudflare Tunnel

**Cài cloudflared:**

```bash
# Tải cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Kiểm tra
cloudflared --version
```

**Đăng nhập Cloudflare:**

```bash
cloudflared tunnel login
```

Lệnh này sẽ:
1. Mở một link trong terminal (hoặc cho bạn link để mở trong trình duyệt)
2. Chọn domain `megashop2n.io.vn`
3. Xác thực xong, cloudflared tự động lưu certificate

> Nếu server không có trình duyệt, bạn copy link, mở trên máy mình, đăng nhập Cloudflare, sau đó quay lại server.

**Tạo tunnel:**

```bash
cloudflared tunnel create vietshop
```

Lệnh này tạo tunnel tên `vietshop` và tạo ra file credentials (giống chìa khoá).

**Tạo config cho tunnel:**

```bash
nano ~/.cloudflared/config.yml
```

Paste nội dung:

```yaml
tunnel: vietshop
credentials-file: /root/.cloudflared/vietshop.json

ingress:
  - hostname: megashop2n.io.vn
    service: http://localhost:80
  - hostname: www.megashop2n.io.vn
    service: http://localhost:80
  - service: http_status:404
```

Giải thích:
- `tunnel: vietshop` — tên tunnel
- `credentials-file` — đường dẫn file chìa khoá
- `ingress` — luồng vào: khi ai đó gõ domain, chuyển đến `http://localhost:80` (chính là Nginx trong Docker)
- Dòng cuối: nếu không match domain nào → trả về 404

**Chạy tunnel dưới dạng service:**

```bash
cloudflared tunnel install --token-file ~/.cloudflared/vietshop.json
```

Hoặc chạy thủ công để test trước:

```bash
cloudflared tunnel run vietshop &
```

### 8.4 Tắt port 80 trên server (quan trọng!)

Vì Tunnel đã lo việc chuyển tiếp, **bạn nên tắt port 80 public** để chỉ có Tunnel mới vào được Docker:

```bash
# Dừng Docker port forwarding (sửa docker-compose.yml)
nano docker-compose.yml
```

Trong service `nginx`, sửa dòng:

```yaml
ports:
  - "80:80"
```

→ (Comment lại hoặc bỏ)

```yaml
# ports:
#   - "80:80"
```

Sau đó chạy lại Docker:

```bash
docker compose down
docker compose up -d
```

Lúc này:
- Nginx vẫn chạy port 80 **bên trong** Docker (các container nội bộ vẫn gọi được)
- Nhưng port 80 **không mở ra internet**
- Chỉ có Tunnel mới có thể truy cập vào Nginx thông qua mạng nội bộ của Docker

---

## 9. Cấu hình CI/CD - Tự động deploy

> **CI/CD là gì?** Hiện tại, mỗi lần sửa code, bạn phải:
> ```
> Git push → SSH vào server → git pull → docker compose down → docker compose up -d --build
> ```
> 
> CI/CD là robot tự làm việc đó giùm bạn. Chỉ cần `git push`, mọi thứ tự động cập nhật.

### 9.1 Tạo SSH Key trên Server

SSH vào server và tạo key riêng cho GitHub Actions:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N ""
```

Giải thích: Tạo 1 cặp khoá:
- `github-actions` — **khoá riêng** (PRIVATE, không được lộ)
- `github-actions.pub` — **khoá công khai** (PUBLIC, gắn vào server)

Thêm khoá công khai vào server:

```bash
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

Giải thích: Nói với server "ai có khoá riêng tương ứng với khoá công khai này thì được vào".

Lấy nội dung khoá riêng (để cho GitHub):

```bash
cat ~/.ssh/github-actions
```

Copy toàn bộ output (từ `-----BEGIN OPENSSH PRIVATE KEY-----` đến `-----END OPENSSH PRIVATE KEY-----`).

### 9.2 Thêm Secrets vào GitHub

Lên **GitHub** → **Repo** `takhoa172/megashop2n`:

1. Click **Settings** (tab trên cùng, bên phải)
2. Menu trái → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Tạo 3 secrets:

| Secret | Giá trị | Cách lấy |
|--------|---------|----------|
| `SERVER_HOST` | `123.123.123.123` | Địa chỉ IP server của bạn |
| `SERVER_USER` | `root` | User SSH |
| `SSH_PRIVATE_KEY` | (Nội dung dài) | Paste từ lệnh `cat ~/.ssh/github-actions` |

### 9.3 Tạo file Workflow

Trên máy local (máy tính của bạn), vào thư mục dự án:

```bash
cd /home/cucai/Desktop/develop
mkdir -p .github/workflows
```

Tạo file `.github/workflows/deploy.yml`:

```bash
nano .github/workflows/deploy.yml
```

Paste nội dung:

```yaml
name: Deploy to Production

# Khi nào chạy? Khi push code lên nhánh main
on:
  push:
    branches: [main]

# Công việc cần làm
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # Bước: SSH vào server và chạy lệnh
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/vietshop
            git pull origin main
            docker compose down
            docker compose up -d --build
            docker system prune -f
```

**Giải thích file này từng dòng:**

| Dòng | Ý nghĩa |
|------|---------|
| `name: Deploy to Production` | Tên của workflow (hiển thị trên GitHub) |
| `on: push: branches: [main]` | Khi push lên nhánh `main` thì chạy |
| `jobs:` | Các công việc |
| `deploy:` | Tên công việc |
| `runs-on: ubuntu-latest` | Chạy trên máy tính ảo Ubuntu của GitHub |
| `steps:` | Các bước thực hiện |
| `- name: Deploy via SSH` | Tên bước |
| `uses: appleboy/ssh-action@v1` | Dùng công cụ SSH làm sẵn |
| `host/username/key` | Lấy từ GitHub Secrets |
| `script:` | Các lệnh chạy trên server |
| `git pull origin main` | Kéo code mới từ GitHub |
| `docker compose down` | Tắt container cũ |
| `docker compose up -d --build` | Build và chạy lại |
| `docker system prune -f` | Dọn ảnh Docker cũ (tiết kiệm dung lượng) |

### 9.4 Commit & Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add CI/CD deploy workflow"
git push origin main
```

### 9.5 Kiểm tra

Lên **GitHub** → **Actions** tab (trên cùng). Bạn sẽ thấy workflow đang chạy. Click vào để xem chi tiết.

Nếu có **✔ màu xanh** → thành công!
Nếu có **❌ màu đỏ** → click vào xem log ở bước nào lỗi.

### 9.6 Luồng CI/CD hoàn chỉnh

Từ giờ, workflow chỉ việc:

```bash
# Trên máy local
git add .
git commit -m "Sửa tính năng mới"
git push origin main    # ← Chỉ cần lệnh này!
```

GitHub Actions sẽ:
1. ✅ Nhận được push
2. ✅ SSH vào server
3. ✅ Kéo code mới
4. ✅ Tắt Docker cũ
5. ✅ Build & chạy Docker mới
6. ✅ Dọn dẹp

Bạn không cần SSH vào server làm gì nữa.

---

## 10. Bảo trì & Troubleshooting

### Các lệnh Docker thường dùng

| Lệnh | Mục đích | Giải thích |
|------|----------|-----------|
| `docker compose ps` | Xem trạng thái | Container nào đang chạy/dừng |
| `docker compose logs nginx` | Xem log Nginx | Có lỗi gì không, ai truy cập |
| `docker compose logs django` | Xem log Django | API có lỗi không, database sao |
| `docker compose logs nextjs` | Xem log Next.js | Frontend build lỗi không |
| `docker compose restart nginx` | Khởi động lại Nginx | Khi sửa config, cần restart |
| `docker compose down` | Tắt hết container | Khi cần deploy lại từ đầu |
| `docker compose up -d` | Chạy lại container | Sau khi `down` |
| `docker system prune -f` | Dọn ảnh cũ | Giải phóng ổ cứng |

### Các lỗi thường gặp

#### 1. Website không truy cập được

```bash
# Kiểm tra container có đang chạy không
docker compose ps

# Kiểm tra log Nginx
docker compose logs nginx

# Kiểm tra Cloudflare Tunnel
cloudflared tunnel list
```

**Nguyên nhân thường:**
- Tunnel chưa chạy: chạy `cloudflared tunnel run vietshop &`
- Container đang restart: đợi 30s
- Port conflict: kiểm tra `netstat -tlnp | grep 80`

#### 2. API trả về lỗi 500

```bash
docker compose logs django
```

Thường do:
- Thiếu migration: `docker compose exec django python manage.py migrate`
- Lỗi code: kiểm tra stack trace trong log

#### 3. Ảnh không hiển thị

Kiểm tra Cloudinary config trong `.env` có đúng không.

#### 4. Docker build thất bại

```bash
docker compose logs nextjs   # Frontend lỗi?
docker compose logs django   # Backend lỗi?
```

Thường do:
- Thiếu package trong `requirements.txt` hoặc `package.json`
- Lỗi syntax trong code mới

### Cập nhật code (khi chưa có CI/CD)

Nếu chưa setup CI/CD, làm thủ công:

```bash
ssh root@your-server-ip
cd /opt/vietshop
git pull origin main
docker compose down
docker compose up -d --build
```

### Cập nhật code (khi đã có CI/CD)

```bash
# Trên máy local (máy tính của bạn)
git add .
git commit -m "Mô tả thay đổi"
git push origin main
# Done! GitHub Actions tự deploy
```

### Backup Database

```bash
# Backup
docker compose exec postgres pg_dump -U admin inventory_db > backup_$(date +%Y%m%d).sql

# Restore (nếu cần)
cat backup_20260604.sql | docker compose exec -T postgres psql -U admin inventory_db
```

---

## 11. Kết luận

### Checklist kiểm tra website hoạt động

- [ ] `https://megashop2n.io.vn` — Trang chủ hiển thị
- [ ] `https://megashop2n.io.vn/products` — Danh sách sản phẩm
- [ ] `https://megashop2n.io.vn/api/products/` — API trả về JSON
- [ ] `https://megashop2n.io.vn/admin/` — Trang admin Django
- [ ] Upload ảnh hoạt động (Cloudinary)
- [ ] Login/Register hoạt động
- [ ] CI/CD: push 1 commit, kiểm tra GitHub Actions chạy OK

### Những việc còn lại

| Việc | Mức ưu tiên |
|------|------------|
| **Cart & Payment** — Giỏ hàng + thanh toán (VNPay/COD) | 🟢 Cao |
| **Testing** — Viết test cho Backend + Frontend | 🟡 Trung bình |
| **Optimize image** — Nén ảnh, lazy load | 🔵 Thấp |

### Tóm tắt kiến trúc cuối cùng

```
Bạn (Browser)
    │
    ▼
Cloudflare (CDN + SSL miễn phí + Bảo vệ DDOS)
    │
    ▼
Cloudflare Tunnel (Kết nối riêng, không cần mở port)
    │
    ▼
Docker Nginx (Web server - Cánh cửa)
    ├── Django (API - Backend)
    ├── Next.js (UI - Frontend)
    └── PostgreSQL (Database)
```

Chúc mừng bạn đã đưa dự án VIETSHOP lên internet thành công! 🎉

---

> **Tài liệu này được tạo ngày 04-06-2026 bởi AI assistant**
> Mọi thắc mắc hoặc cần hỗ trợ thêm, hãy hỏi tôi bất kỳ lúc nào.
