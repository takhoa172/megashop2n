# 📘 HƯỚNG DẪN TOÀN TẬP — VIETSHOP

> File học + tra cứu dành cho người mới bắt đầu.
> Bao gồm: kiến thức, giải thích dễ hiểu, lệnh chi tiết, lỗi thường gặp.
> Cập nhật: 2026-08-13

---

## 📑 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Linux / Ubuntu cơ bản](#2-linux--ubuntu-cơ-bản)
3. [Git toàn tập](#3-git-toàn-tập)
4. [SSH key & bảo mật](#4-ssh-key--bảo-mật)
5. [Docker](#5-docker)
6. [Nginx](#6-nginx)
7. [CI/CD & GitHub Actions](#7-cicd--github-actions)
8. [Backend / Django cơ bản](#8-backend--django-cơ-bản)
9. [Quy trình vận hành VIETSHOP](#9-quy-trình-vận-hành-vietshop)
10. [Cheat Sheet tổng hợp](#10-cheat-sheet-tổng-hợp)

---

# 1. TỔNG QUAN HỆ THỐNG

## 1.1 Kiến trúc tổng thể

VIETSHOP là một hệ thống web hoàn chỉnh với 4 "ngăn" chính:

```
[Người dùng]
     │  (vào trình duyệt: megashop2n.io.vn)
     ▼
┌──────────┐   /api/*     ┌────────────┐   query   ┌────────────┐
│  NGINX   │ ───────────► │  D J A N G O │ ───────► │ POSTGRES   │
│ gác cổng │              │  (backend)  │          │ (database) │
└──────────┘              └────────────┘          └────────────┘
     │  còn lại
     ▼
┌──────────┐
│  NEXT.JS │  (frontend - giao diện)
└──────────┘
```

**Vai trò từng thành phần:**

| Thành phần | Vai trò | Ví von |
|------------|---------|--------|
| **Nginx** | Gác cổng, phân luồng | Người bảo vệ chia đường |
| **Next.js** | Giao diện người dùng | Quầy bán hàng phía trước |
| **Django** | Logic + API + dữ liệu | Nhà kho + thủ kho phía sau |
| **PostgreSQL** | Lưu trữ dữ liệu | Sổ cái ghi chép |
| **Cloudinary** | Lưu ảnh (CDN) | Kho ảnh bên ngoài |
| **GitHub + Actions** | Lưu code + tự deploy | Văn phòng + robot giao hàng |

## 1.2 Luồng hoạt động

1. Người dùng gõ URL → Nginx nhận request
2. Nếu đường dẫn bắt đầu `/api/` → Nginx đẩy qua **Django** (xử lý dữ liệu, trả JSON)
3. Còn lại (trang web) → Nginx đẩy qua **Next.js** (trả HTML giao diện)
4. Ảnh → tải từ **Cloudinary** (mạng phân phối nhanh toàn cầu)
5. Dữ liệu → lưu vào **PostgreSQL**

## 1.3 Các file quan trọng ở root dự án

```
develop/
├── docker-compose.yml      # Kịch bản dựng 4 container
├── nginx/default.conf      # Cấu hình Nginx (gác cổng)
├── .env                    # Bí mật: DB password, SECRET_KEY, Cloudinary
├── .github/workflows/deploy.yml  # Kịch bản CI/CD
├── backend/                # Mã nguồn Django
├── frontend/               # Mã nguồn Next.js
└── scripts/backup-db.sh    # Script backup database
```

---

# 2. LINUX / UBUNTU CƠ BẢN

> Server của anh chạy Ubuntu. Đây là những lệnh cốt lõi nhất.

## 2.1 Di chuyển & xem thư mục

```bash
pwd                     # Tôi đang ở đâu? (print working directory)
cd /opt/vietshop        # Di chuyển vào thư mục
cd ..                   # Lên 1 cấp
cd ~                    # Về thư mục home
ls                      # Liệt kê file
ls -la                  # Liệt kê chi tiết (kể cả file ẩn)
```

## 2.2 Thao tác file/thư mục

```bash
cat file.txt            # Xem nội dung file
mkdir ten-thu-muc       # Tạo thư mục
cp file1 file2          # Sao chép
mv file1 file2          # Di chuyển / đổi tên
rm file.txt             # Xoá file
rm -r ten-thu-muc       # Xoá cả thư mục (r = recursive)
rm -rf ten-thu-muc      # Xoá mạnh (f = force, cẩn thận!)
```

## 2.3 Quyền hạn (rất quan trọng — gây lỗi hôm qua)

Mỗi file/thư mục trong Linux có chủ sở hữu và quyền:

```bash
ls -l file.txt
# -rw-r--r-- 1 cucai cucai 1234 file.txt
#  ↑chủ   ↑nhóm  ↑người khác
#  rwx    r-x    r--   (r=đọc, w=ghi, x=chạy)
```

**Sửa quyền:**
```bash
chmod +x script.sh       # Cho phép chạy script
chmod 755 script.sh      # chủ: đọc+ghi+chạy; người khác: đọc+chạy
```

**Sửa chủ sở hữu (lỗi "Permission denied"):**
```bash
sudo chown cucai:cucai /duong/dan   # Đổi chủ sở hữu về user cucai
sudo chown -R cucai:cucai folder/   # -R = áp dụng cho mọi thứ bên trong
```

**Ví dụ thực tế (lỗi anh gặp khi merge):**
```bash
# File migration thuộc root (do docker tạo) → git không xoá được
sudo chown -R cucai:cucai backend/apps/orders/
```

> 💡 **Mẹo:** `sudo` = chạy với quyền quản trị (admin). Khi bị "Permission denied", thêm `sudo` phía trước.

## 2.4 Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `Permission denied` | File thuộc user khác (vd root) | `sudo chown` lại |
| `command not found` | Chưa cài chương trình | `sudo apt install <tên>` |
| `No space left on device` | Đầy ổ cứng | `docker image prune -f` + xoá file rác |

---

# 3. GIT TOÀN TẬP

> Git = hệ thống quản lý phiên bản. Lưu lịch sử mọi thay đổi code.

## 3.1 Khái niệm cốt lõi

| Thuật ngữ | Nghĩa | Ví von |
|-----------|-------|--------|
| **Repository (repo)** | Kho chứa code | Nhà kho |
| **Commit** | 1 "ảnh chụp" trạng thái code | Dấu mốc trên thời gian |
| **Branch** | Nhánh phát triển riêng | Bản nháp riêng |
| **Merge** | Gộp nhánh vào nhau | Hợp nhất bản nháp |
| **Remote** | Bản repo ở xa (GitHub) | Chi nhánh tại văn phòng |
| **Push** | Đẩy code local lên GitHub | Gửi hàng lên kho |
| **Pull** | Kéo code GitHub về local | Nhận hàng từ kho |
| **Clone** | Copy repo về máy mới | Mở chi nhánh mới |

## 3.2 Vòng lặp làm việc hàng ngày

```bash
git status              # ① Xem có gì thay đổi
git diff                # ② Xem chi tiết nội dung thay đổi
git add .               # ③ Chọn tất cả thay đổi để commit
git commit -m "tin nhắn" # ④ Lưu lại với mô tả
git push                # ⑤ Đẩy lên GitHub
```

## 3.3 Branch & Merge

```bash
git branch              # Xem đang ở nhánh nào
git branch ten-moi      # Tạo nhánh mới
git checkout ten-nhanh  # Chuyển sang nhánh (cũ)
git switch ten-nhanh    # Chuyển sang nhánh (mới, nên dùng)
git merge ten-nhanh     # Gộp nhánh vào nhánh hiện tại
git branch -d ten-nhanh # Xoá nhánh đã merge xong
```

**2 kiểu merge:**

- **Fast-forward** (nhanh, không conflict): nhánh hiện tại nằm trên đường thẳng của nhánh kia → chỉ cần "nhảy cóc" tới commit mới.
- **Merge commit**: 2 nhánh đã tách riêng → tạo commit gộp. Có thể xung đột.

## 3.4 Lỗi thường gặp

### Lỗi 1: `Untracked files would be overwritten by merge`
```bash
# Nguyên nhân: có file chưa track trùng tên với file sắp merge về
git clean -fd thu-muc/    # Xoá file untracked (cẩn thận - mất file!)
git merge nhanh-khac
```

### Lỗi 2: Conflict khi merge
```bash
# Git báo "CONFLICT" ở vài file → mở file sửa tay (bỏ <<<< ==== >>>>)
git add .                 # Sau khi sửa xong
git commit                # Hoàn tất merge
```

### Lỗi 3: Push bị từ chối
```bash
git pull origin main      # Kéo code mới về merge trước
git push origin main      # Rồi push lại
```

### Lỗi 4: "Your branch is ahead of origin/main by N commits"
- Nghĩa là local có commit chưa push. Chỉ cần `git push`.

---

# 4. SSH KEY & BẢO MẬT

## 4.1 SSH là gì?

SSH = cách **an toàn** để máy này kết nối máy khác (GitHub, server) mà **không dùng mật khẩu**.

**Cặp chìa khoá:**
- **Public key** (`id_ed25519.pub`) — chìa công khai, **đưa cho người khác** (GitHub, server)
- **Private key** (`id_ed25519`) — chìa bí mật, **không bao giờ đưa cho ai**

> 🍔 **Ví von:** Giống **khoá két sắt**. Public key = ổ khoá (mở lên cho người ta nhìn), private key = chìa (giữ riêng).

## 4.2 Tạo SSH key

```bash
ssh-keygen -t ed25519 -C "email_cua_anh@gmail.com"
# Enter × 3 (chấp nhận mặc định + không đặt passphrase)

cat ~/.ssh/id_ed25519.pub   # Xem public key để copy
```

## 4.3 Add lên GitHub (và các nền tảng khác)

| Nền tảng | Đường dẫn |
|----------|-----------|
| GitHub | `https://github.com/settings/ssh/new` |
| GitLab | `https://gitlab.com/-/profile/keys` |

1. Copy nội dung `id_ed25519.pub`
2. Dán vào ô Key
3. Đặt tên (vd `my-laptop`) → Add

## 4.4 Kiểm tra kết nối

```bash
ssh -T git@github.com
# Kết quả đúng: "Hi takhoa172! You've successfully authenticated"
```

## 4.5 Dùng SSH cho git (bỏ token)

```bash
git remote set-url origin git@github.com:takhoa172/Megashop2n.git
git remote -v      # Kiểm tra — phải không còn token
```

## 4.6 SSH vs Token — bảng so sánh

| Tiêu chí | SSH key | Personal Access Token |
|----------|---------|----------------------|
| Hết hạn | Không bao giờ | Có (tuỳ chọn cấu hình) |
| Rò rỉ thì sao | Xoá key trong settings | Revoke token |
| Tạo lần đầu | 1 lần, dùng mãi | Làm lại khi hết hạn |
| Push được CI trigger | ✅ | ❌ nếu thiếu scope `workflow` |
| Khuyến nghị | ✅ **Nên dùng** | Dùng cho API/script |

## 4.7 Token lộ — phải làm gì?

1. Vào `https://github.com/settings/tokens` → **Delete** token lộ
2. Tạo token mới (nếu cần)
3. Không bao giờ dán token vào chat/file rồi push lên GitHub

> ⚠️ **Quy tắc vàng:** Không bao giờ ghi secret (token, password, API key) vào file được commit lên GitHub. File `.env` đã nằm trong `.gitignore` nên không bị đẩy lên — đừng bỏ nó ra.

---

# 5. DOCKER

## 5.1 Docker là gì?

Docker gói **code + thư viện + môi trường chạy** vào 1 "container" — giống **căn hộ trọn gói**: mang tới đâu cũng chạy được, không phụ thuộc máy.

**Image** = bản thiết kế (khuôn). **Container** = bản đang chạy (căn hộ).

## 5.2 Kiến trúc docker-compose của VIETSHOP

File `docker-compose.yml` khai báo **4 container**:

| Service | Là gì | Cổng |
|---------|-------|------|
| `postgres` | Database | 5432 |
| `django` | Backend | 8000 (chỉ trong mạng nội bộ) |
| `nextjs` | Frontend | 3000 (chỉ trong mạng nội bộ) |
| `nginx` | Gác cổng | **80** (duy nhất mở ra ngoài) |

**Phân tích từng phần quan trọng:**

```yaml
django:
  build: ./backend          # Tự build image từ code trong thư mục backend
  depends_on:
    postgres: service_healthy  # Chỉ chạy khi postgres đã sẵn sàng
  healthcheck:              # "Mày còn sống không?" - kiểm tra tự động
    test: ["CMD", "python", "-c", "...urlopen('http://localhost:8000/api/health/')"]
    interval: 30s           # Hỏi mỗi 30s
    timeout: 10s
    retries: 3
    start_period: 120s      # Cho thời gian khởi động trước khi đánh giá
  env_file: .env            # Nạp biến môi trường từ file .env
  volumes:
    - static_volume:/app/static   # Lưu file tĩnh ra "ổ đĩa ảo"
```

## 5.3 Bảng lệnh Docker cần nhớ

```bash
# ⭐ Vòng lặp cơ bản
docker compose up -d              # Dựng & chạy tất cả (nền)
docker compose up -d --build      # Rebuild sau khi sửa code
docker compose down               # Tắt hết
docker compose restart            # Khởi động lại

# ⭐ Kiểm tra
docker compose ps                 # Xem trạng thái (healthy/restarting?)
docker compose logs -f            # Xem log (Ctrl+C để thoát)
docker compose logs django --tail 50   # 50 dòng log cuối của django

# ⭐ Chạy lệnh bên trong container
docker compose exec django bash             # Vào shell của django
docker compose exec django python manage.py migrate
docker compose exec django python manage.py shell

# ⭐ Dọn dẹp
docker image prune -f             # Xoá image rác
docker system df                  # Xem dung lượng đang dùng
```

## 5.4 Vòng lặp phát triển chuẩn

```
Sửa code
   ↓
docker compose up -d --build   ← rebuild container với code mới
   ↓
docker compose ps              ← xem có "healthy" không
   ↓
mở trình duyệt kiểm tra
```

## 5.5 Lỗi thường gặp

| Tình trạng | Nguyên nhân | Cách xử lý |
|-----------|-------------|-----------|
| Container `Restarting` | Code lỗi khi khởi động | `docker compose logs` xem lỗi |
| Không `healthy` sau 5 phút | Migrate/chờ DB lâu | Kiểm tra `start_period`, `logs` |
| `Port is already allocated` | Cổng bị chiếm | `docker compose down` rồi up lại |
| Ảnh không thấy code mới | Quên `--build` | Luôn dùng `up -d --build` |

---

# 6. NGINX

## 6.1 Nginx là gì? Dùng để làm gì?

Nginx = **web server / reverse proxy** — "người gác cổng" duy nhất nhận request từ Internet.

**3 việc chính:**
1. **Phân luồng (proxy):** `/api/*` → Django; trang web → Next.js
2. **Bảo mật:** thêm header chặn tấn công, giới hạn upload
3. **Tăng tốc:** cache file tĩnh, nén gzip

## 6.2 Giải thích file `nginx/default.conf` từng phần

```nginx
upstream django {           # Định nghĩa "nhóm server" Django
    server django:8000;     #  (tên service + cổng trong docker network)
}

upstream nextjs {
    server nextjs:3000;
}

server {
    listen 80;              # Lắng nghe cổng 80 (HTTP vào)
    server_name _;          # Chấp nhận mọi tên miền
    client_max_body_size 50M;  # Cho phép upload tối đa 50MB

    # === BẢO MẬT: chặn các kiểu tấn công ===
    add_header X-Frame-Options "SAMEORIGIN" always;         # chặn clickjacking
    add_header X-Content-Type-Options "nosniff" always;     # chặn MIME sniffing
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # === PHÂN LUỒNG ===
    location /api/ {        # Request bắt đầu bằng /api/
        proxy_pass http://django;   # → chuyển qua Django
        proxy_set_header Host $host;            # giữ tên miền gốc
        proxy_set_header X-Real-IP $remote_addr;  # ghi IP thật
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;   # ghi http/https
    }

    location /django-admin/ {   # Admin của Django
        proxy_pass http://django;
    }

    location /_next/static/ {   # File tĩnh của Next.js → cache lâu
        proxy_pass http://nextjs;
        expires 1y;                       # cache 1 năm
        add_header Cache-Control "public, immutable";
    }

    location / {            # Mọi thứ còn lại
        proxy_pass http://nextjs;         # → chuyển qua Next.js
    }
}
```

## 6.3 Cách cấu hình / sửa đổi

1. Sửa file `nginx/default.conf`
2. Rebuild:
   ```bash
   docker compose up -d --build nginx
   docker compose exec nginx nginx -t   # Kiểm tra cấu hình đúng chưa
   ```
3. Nếu in `syntax is ok` → mở trình duyệt kiểm tra

## 6.4 Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `502 Bad Gateway` | Container đích không chạy | `docker compose ps` kiểm tra |
| `413 Request Entity Too Large` | Upload quá 50M | Tăng `client_max_body_size` |
| `404` khi vào /admin | Thiếu location block | Kiểm tra `location` trong conf |

---

# 7. CI/CD & GITHUB ACTIONS

## 7.1 CI/CD là gì?

| Khái niệm | Nghĩa |
|-----------|-------|
| **CI** (Continuous Integration) | Mỗi lần push code → **tự test** tự động |
| **CD** (Continuous Deployment) | Test xong → **tự đưa lên server** |

**Lợi ích:** Không cần SSH vào server làm tay. Push code là xong, robot tự lo.

## 7.2 Giải thích file `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production    # Tên workflow (hiện trên GitHub Actions)

on:                           # KHI NÀO chạy?
  push:
    branches: [main]          # → Khi có push lên nhánh main

jobs:                         # DANH SÁCH CÔNG VIỆC
  test:                       # ① Công việc: KIỂM TRA
    runs-on: ubuntu-latest    #    chạy trên máy ảo Ubuntu của GitHub
    steps:
      - uses: actions/checkout@v4    # Lấy code về
      - name: Run backend tests
        run: |
          cp .env.example .env       # Tạo file .env giả (không có secret thật)
          docker compose run --rm django python manage.py test --noinput
      - name: Run frontend lint
        run: |
          cd frontend
          npm ci              # Cài thư viện
          npm run lint        # Kiểm tra lỗi code

  deploy:                     # ② Công việc: DEPLOY (chỉ khi test pass)
    needs: test               #    = chờ `test` xong
    runs-on: ubuntu-latest
    steps:
      - name: Install cloudflared
        run: curl ... cloudflared.deb && sudo dpkg -i ...   # cài công cụ tunnel

      - name: Deploy via Cloudflare Tunnel
        run: |
          cloudflared access tcp --hostname ${{ secrets.SERVER_HOST }} ... &
          # ↑ mở 1 đường hầm tới server qua Cloudflare
          ssh -o StrictHostKeyChecking=no -p 2222 -i /tmp/ssh_key \
            ${{ secrets.SERVER_USER }}@127.0.0.1 \
            "cd /opt/vietshop && git pull origin main \
             && docker compose up -d --build && docker image prune -f"
          # ↑ trên server: kéo code mới → rebuild container → dọn rác
```

**`${{ secrets.XXX }}`** = biến bí mật lưu trong GitHub (Settings → Secrets and variables). Không bao giờ ghi thẳng trong file.

## 7.3 Cách xem kết quả CI/CD

1. Vào `https://github.com/takhoa172/Megashop2n/actions`
2. Thấy các run (mỗi lần push = 1 run)
3. Run **xanh** = success, **đỏ** = failure
4. Click vào run → xem từng bước, bước nào đỏ thì click để xem log lỗi

## 7.4 Cấu hình secrets (lần đầu cài)

Vào repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Mô tả |
|--------|-------|
| `SERVER_HOST` | Tên miền tunnel (vd `ssh.megashop2n.io.vn`) |
| `SERVER_USER` | User SSH trên server (vd `rubyco89`) |
| `SSH_PRIVATE_KEY` | Nội dung private key SSH để vào server |
| `CF_ACCESS_CLIENT_ID` | Cloudflare Access client ID |
| `CF_ACCESS_CLIENT_SECRET` | Cloudflare Access client secret |

## 7.5 Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|-----------|
| CI **không chạy** khi push | Push bằng PAT thiếu scope `workflow`, hoặc sai branch trigger | Dùng SSH để push; kiểm tra `branches:` trong deploy.yml |
| `refusing to allow a PAT... without workflow scope` | Token thiếu quyền workflow | Tạo token có tick `workflow`, hoặc dùng SSH |
| Job đỏ `npm run lint` | Code lỗi lint | Sửa code rồi push lại |
| Deploy step đỏ | SSH/tunnel lỗi | Xem log, kiểm tra secrets |

---

# 8. BACKEND / DJANGO CƠ BẢN

## 8.1 Kiến trúc Django

```
Browser ──HTTP──► urls.py ──► views.py ──► serializers.py ──► models.py
                          (định tuyến)  (xử lý)    (chuyển đổi)    (dữ liệu)
```

| Thành phần | Vai trò |
|-----------|---------|
| **urls.py** | Bản đồ đường dẫn: `/api/products/` → view nào |
| **views.py** | Xử lý request, quyết định trả gì |
| **serializers.py** | Chuyển dữ liệu ↔ JSON (validate, lọc field) |
| **models.py** | Định nghĩa bảng dữ liệu |
| **migrations/** | Phiếu khai báo thay đổi bảng dữ liệu |

## 8.2 Một app điển hình (vd `sliders`)

```python
# models.py — định nghĩa bảng
class Slider(models.Model):
    title = models.CharField(max_length=255)
    image_url = models.URLField()
    image_public_id = models.CharField(max_length=255, blank=True, null=True)

# views.py — xử lý request
class SliderViewSet(viewsets.ModelViewSet):   # tự có CRUD
    queryset = Slider.objects.all()
    permission_classes = [IsAdminOrReadOnly]  # staff mới được sửa

# urls.py — định tuyến
urlpatterns = [
    path("", list_view, name="sliders-list"),
    path("<uuid:pk>/", detail_view, name="sliders-detail"),
    path("<uuid:pk>/upload-image/", upload_image_view, name="sliders-upload-image"),
]
```

## 8.3 Migration — thay đổi cấu trúc DB

```bash
# Sau khi sửa models.py:
docker compose exec django python manage.py makemigrations   # tạo phiếu
docker compose exec django python manage.py migrate          # áp dụng vào DB
```

> 💡 Migration được **đẩy lên GitHub** để server khi pull về cũng migrate được (entrypoint tự chạy `migrate`).

## 8.4 Phân quyền (role)

| Role | Quyền |
|------|-------|
| **SUPER_ADMIN** | Mọi thứ, vào Django Admin (`/django-admin/`) |
| **MANAGER** | Trang quản trị Next.js (`/admin/*`) |
| **STAFF** | Trang quản trị, không vào reports |
| **CUSTOMER** | Chỉ xem trang công khai |

**Cách bảo vệ API:** `permission_classes = [IsStaffOrHigher]` → chỉ staff/admin mới gọi được.

## 8.5 Cloudinary — tại sao dùng CDN

| Lợi ích | Giải thích |
|---------|-----------|
| Tốc độ | Ảnh phân phối từ máy chủ gần người xem nhất |
| Không tốn ổ server | Ảnh nằm ở Cloudinary, không chiếm dung lượng VPS |
| Tự resize/nén | Cloudinary tự tối ưu ảnh |

**Cách upload trong code:**
```python
from apps.products.cloudinary_utils import upload_to_cloudinary, delete_from_cloudinary

result = upload_to_cloudinary(file, folder="sliders")   # upload
delete_from_cloudinary(public_id)                       # xoá khi thay ảnh
```

---

# 9. QUY TRÌNH VẬN HÀNH VIETSHOP

## 9.1 Quy trình 1: Sửa code local → auto deploy (chuẩn)

```bash
# ① Trên máy local (thư mục develop)
git status
git add .
git commit -m "mô tả thay đổi"
git push origin main          # CI/CD tự test + tự deploy lên server

# ② Đợi 2-5 phút
# ③ Vào GitHub → Actions → xem run xanh
# ④ Mở megashop2n.io.vn kiểm tra
```

## 9.2 Quy trình 2: Deploy thủ công trên server (khi cần gấp)

```bash
ssh ssh.megashop2n.io.vn      # vào server (đã có sẵn config SSH)
cd /opt/vietshop
git pull origin main
docker compose up -d --build
docker image prune -f
docker compose ps             # kiểm tra 4 container đều healthy
```

## 9.3 Quy trình 3: Backup database

```bash
# Trên server:
cd /opt/vietshop
./scripts/backup-db.sh        # tạo file backup nén trong thư mục backup/
```

Nên cài crontab chạy tự động mỗi ngày:
```bash
crontab -e
# thêm dòng:  0 2 * * * /opt/vietshop/scripts/backup-db.sh   (2h sáng mỗi ngày)
```

## 9.4 Checklist khi deploy thất bại

- [ ] GitHub Actions run có **đỏ** ở bước nào? Xem log bước đó
- [ ] `docker compose ps` trên server — container nào không healthy?
- [ ] `docker compose logs django --tail 50` — có lỗi migrate/import không?
- [ ] Có migration mới chưa được áp dụng không? (`python manage.py migrate`)
- [ ] File `.env` trên server có đủ biến không?

---

## 9.5 Bảo mật & tối ưu (đã áp dụng)

Những thay đổi bảo mật/tối ưu đã được code vào dự án và deploy lên production:

**Bảo mật đã cài**
- **Đóng cổng DB**: `docker-compose.yml` đã bỏ `ports: "5432:5432"` — Postgres chỉ chạy trong mạng nội bộ Docker, không truy cập được từ Internet.
- **Refresh token chống replay**: `/api/auth/refresh` giờ kiểm tra & blacklist token cũ (không dùng lại token đã logout). Bật `BLACKLIST_AFTER_ROTATION`.
- **Không còn tài khoản mặc định**: khi chạy production, seed bắt buộc đọc `DJANGO_SUPERUSER_PASSWORD` từ env (không còn admin/admin123).
- **Password mạnh hơn**: yêu cầu ≥ 8 ký tự + validator chống password thông dụng/số thuần.
- **Chống brute-force login**: giới hạn 5 lần/phút cho `/api/auth/` (login/register/refresh).
- **Upload ảnh an toàn**: validate bằng Pillow (kiểm tra đúng file ảnh, không chỉ tên) + giới hạn 5MB; không lộ chi tiết lỗi ra cho client.
- **Container non-root**: backend và frontend chạy với user không phải root.
- **Nginx**: thêm HSTS, rate-limit, giới hạn upload 15MB, chặn `/django-admin/` truy cập từ public.

**Tối ưu đã cài**
- **Redis cache**: endpoint công khai (most_viewed, suggested, price_zero) cache 5 phút — giảm tải DB.
- **Ghi view 1 lần/ngày/IP**: không phình bảng `product_views`.
- **Ảnh fix trên server**: bật `images.unoptimized` trong `next.config.ts` — ảnh load trực tiếp từ Cloudinary/Unsplash (đã tối ưu sẵn), không còn lỗi 502 của `/_next/image`.

## 9.6 ⚠️ ĐỔI MẬT KHẨU DATABASE (bắt buộc ngay sau khi clean history)

> **LƯU Ý QUAN TRỌNG**: Mật khẩu Postgres `Mk9#pQ2xZ7!vL` đã bị lộ trong git history (thuộc file `huong-dan-deploy.md`). Em đã xóa file này khỏi toàn bộ history bằng `git filter-repo` + force-push. Nhưng vì mật khẩu vẫn là mật khẩu đang chạy, **anh cần đổi nó**.

### Cách đổi mật khẩu Postgres (chạy trên server `/opt/vietshop`):

```bash
# 1) Vào shell của container postgres
docker compose exec postgres psql -U admin -d inventory_db

# 2) Trong psql, đổi mật khẩu (thay NEW_PASSWORD bằng mật khẩu mới mạnh)
ALTER USER admin WITH PASSWORD 'NEW_PASSWORD';

# 3) Thoát psql
\q

# 4) Cập nhật mật khẩu trong .env trên server
nano /opt/vietshop/.env    # sửa POSTGRES_PASSWORD=NEW_PASSWORD

# 5) Khởi động lại django để áp dụng
docker compose restart django
```

> Ghi nhớ: `ALTER USER` đổi mật khẩu **bên trong DB** (Postgres dùng password này để xác thực kết nối TCP từ django). Cập nhật `.env` để django gửi đúng password mới. Cổng DB đã đóng khỏi public nên chỉ truy cập nội bộ được.

### Việc cần làm thêm sau khi đổi mật khẩu
- [ ] Vào GitHub → **Settings → Security → Secrets and variables → Actions** → cập nhật nếu có secret DB.
- [ ] Báo với anh chị em/cộng sự ai có quyền truy cập repo → họ dùng SSH (không dùng mật khẩu lộ).

---

# 10. CHEAT SHEET TỔNG HỢP

## Git

```bash
git status            git add .            git commit -m "msg"
git push              git pull             git log --oneline -10
git branch            git checkout main    git merge nhanh
git remote -v         git remote set-url origin git@github.com:user/repo.git
```

## Docker

```bash
docker compose up -d --build      docker compose ps
docker compose down               docker compose logs -f
docker compose exec django bash   docker compose exec django python manage.py migrate
docker image prune -f
```

## Ubuntu / Server

```bash
cd /opt/vietshop      ls -la          cat file.txt
sudo                  chmod +x script.sh    sudo chown -R user:user folder/
crontab -e            tail -f file.log
```

## Kiểm tra web

```bash
curl http://localhost/api/health/          # API sống không?
curl -I https://megashop2n.io.vn           # Header website trả về gì
curl -s https://api.github.com/repos/takhoa172/Megashop2n/actions/runs?per_page=1
```

## SSH

```bash
ssh-keygen -t ed25519 -C "email"     cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com                ssh ssh.megashop2n.io.vn
```

---

## 🎯 Lộ trình học tiếp theo

| Tuần | Chủ đề | Mục tiêu |
|------|--------|----------|
| 1 | Git | Thành thạo add/commit/push/pull/branch/merge |
| 2 | Docker | Thành thạo up/build/ps/logs/exec |
| 3 | Nginx | Đọc & sửa được default.conf |
| 4 | CI/CD | Đọc được deploy.yml, xử lý run đỏ |

> Mọi lệnh trong file này đều áp dụng trực tiếp cho dự án VIETSHOP.
> Cứ chạy thử, sai thì xem lỗi và sửa — cách học nhanh nhất là thực hành!
