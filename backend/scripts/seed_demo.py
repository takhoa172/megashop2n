import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")
django.setup()

from apps.users.models import User
from apps.categories.models import Category
from apps.products.models import Product, ProductImage
from apps.purchases.models import Purchase
from apps.sales.models import Sale
from apps.blogs.models import BlogPost, BlogCategory
from apps.sliders.models import Slider
from apps.settings.models import FooterSettings, SiteSettings
from apps.notifications.models import Notification
from django.utils.text import slugify

def seed_demo():
    admin = User.objects.filter(email="admin@example.com").first()
    staff = User.objects.filter(email="staff@example.com").first()

    categories_data = {
        "Thời trang": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
        "Điện tử": "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800",
        "Đồ gia dụng": "https://images.unsplash.com/photo-1556228453-efd6c44ff7f1?w=800",
        "Phụ kiện": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800",
        "Giày dép": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
    }

    products_data = [
        {"name": "Áo sơ mi trắng basic", "category": "Thời trang", "purchase_price": 180000, "sale_price": 350000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800", "description": "Áo sơ mi trắng basic chất liệu cotton cao cấp, thoáng mát, thấm hút mồ hôi tốt. Phù hợp cho cả nam và nữ, dễ dàng phối đồ đi làm hay đi chơi."},
        {"name": "Đầm suông công sở", "category": "Thời trang", "purchase_price": 250000, "sale_price": 520000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800", "description": "Đầm suông công sở thiết kế thanh lịch, tôn dáng. Chất liệu mềm mại, không nhăn, phù hợp cho môi trường văn phòng."},
        {"name": "Tai nghe Bluetooth Pro", "category": "Điện tử", "purchase_price": 350000, "sale_price": 890000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", "description": "Tai nghe Bluetooth Pro với công nghệ chống ồn chủ động, âm thanh Hi-Res, thời lượng pin lên đến 30 giờ. Kết nối nhanh chóng với mọi thiết bị."},
        {"name": "Loa Bluetooth Mini", "category": "Điện tử", "purchase_price": 200000, "sale_price": 450000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800", "description": "Loa Bluetooth Mini nhỏ gọn, dễ dàng mang theo. Âm thanh sống động, kết nối ổn định, chống nước IPX7."},
        {"name": "Đồng hồ thông minh", "category": "Điện tử", "purchase_price": 500000, "sale_price": 1200000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", "description": "Đồng hồ thông minh đa năng với theo dõi sức khỏe, đo nhịp tim, đếm bước chân, thông báo cuộc gọi và tin nhắn. Thiết kế sang trọng, pin lâu."},
        {"name": "Máy ảnh Fujifilm X", "category": "Điện tử", "purchase_price": 4000000, "sale_price": 8900000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800", "description": "Máy ảnh Fujifilm X-series với cảm biến APS-C, chất lượng ảnh xuất sắc. Phù hợp cho nhiếp ảnh gia chuyên nghiệp và người yêu thích nhiếp ảnh."},
        {"name": "Nồi chiên không dầu", "category": "Đồ gia dụng", "purchase_price": 600000, "sale_price": 1350000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800", "description": "Nồi chiên không dầu dung tích lớn, giúp bạn chế biến món ăn ngon mà không cần dầu mỡ. Tiết kiệm thời gian, an toàn cho sức khỏe."},
        {"name": "Máy xay sinh tố", "category": "Đồ gia dụng", "purchase_price": 350000, "sale_price": 750000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800", "description": "Máy xay sinh tố đa năng với 2 cối xay, lưỡi dao bằng thép không gỉ. Xay nhuyễn trái cây, rau củ, đá viên dễ dàng."},
        {"name": "Bàn phím cơ RGB", "category": "Phụ kiện", "purchase_price": 400000, "sale_price": 950000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1541140532154-b024d3b0b30e?w=800", "description": "Bàn phím cơ RGB với switch chất lượng cao, đèn nền tùy chỉnh, độ bền lên đến 50 triệu lần nhấn. Phù hợp cho game thủ và dân văn phòng."},
        {"name": "Chuột không dây", "category": "Phụ kiện", "purchase_price": 150000, "sale_price": 390000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800", "description": "Chuột không dây siêu nhẹ, thiết kế ergonomic, cảm biến quang học chính xác. Pin kéo dài đến 6 tháng."},
        {"name": "Balo laptop cao cấp", "category": "Phụ kiện", "purchase_price": 300000, "sale_price": 690000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800", "description": "Balo laptop cao cấp chống sốc, nhiều ngăn tiện lợi, chất liệu chống thấm nước. Phù hợp cho dân văn phòng và sinh viên."},
        {"name": "Kính râm nam", "category": "Phụ kiện", "purchase_price": 100000, "sale_price": 250000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800", "description": "Kính râm nam thiết kế thời trang, chống tia UV 100%, gọng nhẹ bền đẹp. Phụ kiện không thể thiếu cho ngày hè."},
        {"name": "Giày thể thao Nike", "category": "Giày dép", "purchase_price": 800000, "sale_price": 1850000, "status": "in_stock", "is_suggested": True, "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "description": "Giày thể thao Nike chính hãng, đế êm, hỗ trợ tốt cho việc chạy bộ và tập luyện hàng ngày. Thiết kế năng động, nhiều màu sắc."},
        {"name": "Sandal nữ thời trang", "category": "Giày dép", "purchase_price": 120000, "sale_price": 290000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800", "description": "Sandal nữ thời trang với quai mảnh tinh tế, đế bệt êm chân. Phù hợp đi biển, đi chơi, dạo phố."},
        {"name": "Giày búp bê", "category": "Giày dép", "purchase_price": 150000, "sale_price": 350000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800", "description": "Giày búp bê nữ tính với chất liệu da mềm, đế chống trượt. Thoải mái cho cả ngày dài hoạt động."},
        # Hàng giá rẻ (sale_price < 500k)
        {"name": "Áo thun basic", "category": "Thời trang", "purchase_price": 50000, "sale_price": 150000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", "description": "Áo thun basic chất liệu cotton 100%, mềm mại, thoáng mát. Thiết kế đơn giản dễ phối đồ."},
        {"name": "Ví da mini", "category": "Phụ kiện", "purchase_price": 80000, "sale_price": 199000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800", "description": "Ví da mini cao cấp, nhiều ngăn đựng thẻ và tiền. Gọn nhẹ, sang trọng, phù hợp cho cả nam và nữ."},
        {"name": "Ốp lưng điện thoại", "category": "Phụ kiện", "purchase_price": 30000, "sale_price": 89000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800", "description": "Ốp lưng điện thoại chống sốc, chất liệu silicone mềm dẻo. Bảo vệ điện thoại khỏi trầy xước và va đập."},
        {"name": "Mũ lưỡi trai", "category": "Thời trang", "purchase_price": 40000, "sale_price": 99000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800", "description": "Mũ lưỡi trai thời trang, chất liệu vải denim cao cấp, form dáng chuẩn. Phụ kiện hoàn hảo cho phong cách đường phố."},
        {"name": "Bình nước giữ nhiệt", "category": "Đồ gia dụng", "purchase_price": 90000, "sale_price": 220000, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800", "description": "Bình nước giữ nhiệt thép không gỉ, giữ lạnh 24h - giữ nóng 12h. Dung tích 500ml, tiện lợi mang theo."},
        # Hàng 0 đồng (sale_price = 0)
        {"name": "Túi vải eco", "category": "Phụ kiện", "purchase_price": 0, "sale_price": 0, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800", "description": "Túi vải eco thân thiện với môi trường, tái sử dụng nhiều lần. Phù hợp đi chợ, đi siêu thị."},
        {"name": "Tem decal miễn phí", "category": "Phụ kiện", "purchase_price": 0, "sale_price": 0, "status": "pending_price", "is_suggested": False, "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800", "description": "Bộ tem decal đa dạng kích thước và hình dáng. Miễn phí cho đơn hàng đầu tiên."},
        {"name": "Móc khóa handmade", "category": "Phụ kiện", "purchase_price": 0, "sale_price": 0, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800", "description": "Móc khóa thủ công độc đáo, thiết kế riêng biệt. Quà tặng tri ân khách hàng thân thiết."},
        {"name": "Sổ tay mini", "category": "Phụ kiện", "purchase_price": 0, "sale_price": 0, "status": "in_stock", "is_suggested": False, "image": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800", "description": "Sổ tay mini bỏ túi với bìa da cao cấp và 80 trang giấy trắng. Miễn phí tặng kèm khi đến shop."},
    ]

    for cat_name in categories_data:
        Category.objects.get_or_create(name=cat_name)

    for i, p in enumerate(products_data):
        category = Category.objects.filter(name=p["category"]).first()
        existing = Product.objects.filter(name=p["name"]).first()
        if existing:
            if not existing.description and p.get("description"):
                existing.description = p["description"]
                existing.save()
                print(f"  Updated description: {existing.name}")
            continue
        prod = Product.objects.create(
            sku=f"SP{i+1:04d}",
            category=category,
            name=p["name"],
            purchase_price=p["purchase_price"],
            sale_price=p["sale_price"],
            status=p["status"],
            is_suggested=p["is_suggested"],
            description=p.get("description", ""),
            created_by=admin,
        )
        ProductImage.objects.create(
            product=prod,
            image_url=p["image"],
            public_id=f"demo/{prod.id}",
            is_primary=True,
        )
        print(f"  Created product: {prod.name}")

    # Sliders
    slider_data = [
        {"title": "Khuyến mãi đặc biệt", "subtitle": "Khám phá bộ sưu tập mới nhất với ưu đãi lên đến 50%", "image_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400", "sort_order": 0},
        {"title": "Bộ sưu tập Thu Đông", "subtitle": "Những thiết kế mới nhất dành cho bạn", "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400", "sort_order": 1},
        {"title": "Công nghệ mới nhất", "subtitle": "Ưu đãi đặc biệt cho các thiết bị điện tử", "image_url": "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400", "sort_order": 2},
    ]
    for s in slider_data:
        if not Slider.objects.filter(title=s["title"]).exists():
            Slider.objects.create(**s, is_active=True)
            print(f"  Created slider: {s['title']}")

    # Site Settings
    if not SiteSettings.objects.exists():
        SiteSettings.objects.create(
            site_name="VIETSHOP",
            nav_links=[
                {"href": "/", "label": "Trang chủ"},
                {"href": "/products", "label": "Sản phẩm"},
                {"href": "/blogs", "label": "Blog"},
                {"href": "/about", "label": "Giới thiệu"},
            ],
            meta_description="VIETSHOP - Nâng tầm trải nghiệm mua sắm trực tuyến",
        )
        print("  Created site settings")

    # Footer
    if not FooterSettings.objects.exists():
        FooterSettings.objects.create(
            company_name="VIETSHOP",
            address="123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
            phone="1900 1234 5678",
            email="info@vietshop.com",
            facebook="https://facebook.com/vietshop",
            youtube="https://youtube.com/@vietshop",
            instagram="https://instagram.com/vietshop",
            copyright_text="© 2024 VIETSHOP. Bảo lưu mọi quyền.",
            description="Nâng tầm trải nghiệm mua sắm trực tuyến của bạn với những sản phẩm chất lượng và dịch vụ tận tâm nhất.",
        )
        print("  Created footer settings")

    # Notifications
    if not Notification.objects.exists():
        Notification.objects.create(
            title="🚚 Miễn phí vận chuyển",
            message="Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Áp dụng đến hết tháng này!",
            is_active=True,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30),
        )
        print("  Created notification")

    # Blog
    blog_cat, _ = BlogCategory.objects.get_or_create(name="Tin tức")
    blog_cat2, _ = BlogCategory.objects.get_or_create(name="Mẹo hay")
    blog_cat3, _ = BlogCategory.objects.get_or_create(name="Xu hướng")

    blog_posts = [
        {"title": "Xu hướng thời trang 2024", "category": blog_cat, "content": "<p>Khám phá những phong cách thiết kế sẽ làm mưa làm gió trong làng mốt thế giới năm nay. Từ phong cách tối giản đến những gam màu nổi bật, hãy cùng VIETSHOP điểm qua những xu hướng đáng chú ý nhất.</p><h2>1. Phong cách tối giản</h2><p>Phong cách tối giản tiếp tục thống trị làng thời trang với những thiết kế tinh tế, tập trung vào chất liệu và đường cắt may hoàn hảo.</p><h2>2. Màu sắc Pastel</h2><p>Những gam màu pastel nhẹ nhàng như hồng phấn, xanh bạc hà, tím lavender sẽ là xu hướng chủ đạo.</p>"},
        {"title": "Mẹo chọn đồ cực chuẩn", "category": blog_cat2, "content": "<p>Làm thế nào để chọn được trang phục tôn dáng và phù hợp với cá tính của riêng bạn? Dưới đây là những mẹo nhỏ giúp bạn tự tin hơn trong việc lựa chọn trang phục.</p><h2>Chọn đồ theo dáng người</h2><p>Mỗi dáng người sẽ phù hợp với những kiểu trang phục khác nhau. Hãy hiểu rõ cơ thể mình để chọn được những món đồ tôn dáng nhất.</p><h2>Mix & Match thông minh</h2><p>Kết hợp các món đồ cơ bản với nhau sẽ tạo nên vô số outfit đẹp mà không cần tốn quá nhiều chi phí.</p>"},
        {"title": "Không gian mua sắm mới", "category": blog_cat3, "content": "<p>VIETSHOP vừa khai trương chi nhánh thứ 10 với trải nghiệm mua sắm hoàn toàn khác biệt. Cùng khám phá không gian mua sắm hiện đại và đẳng cấp này.</p><h2>Thiết kế không gian</h2><p>Với thiết kế mở, ánh sáng tự nhiên và cách bày trí sản phẩm khoa học, VIETSHOP mang đến trải nghiệm mua sắm tuyệt vời nhất.</p>"},
    ]
    for bp in blog_posts:
        slug = slugify(bp["title"])
        if not BlogPost.objects.filter(slug=slug).exists():
            BlogPost.objects.create(
                title=bp["title"],
                slug=slug,
                content=bp["content"],
                category=bp["category"],
                status="published",
                published_at=timezone.now(),
                author=admin,
            )
            print(f"  Created blog: {bp['title']}")

    # Purchases & Sales
    if Purchase.objects.count() == 0:
        products = list(Product.objects.all())
        for i, prod in enumerate(products[:5]):
            Purchase.objects.create(
                product=prod,
                payer=admin if i % 2 == 0 else staff,
                purchase_price=prod.purchase_price,
                purchased_at=timezone.now() - timedelta(days=30 - i * 5),
                note=f"Đợt nhập hàng {i+1}" if i > 0 else None,
            )
            print(f"  Created purchase: {prod.name}")
    if Sale.objects.count() == 0:
        products = list(Product.objects.all())
        for i, prod in enumerate(products[:4]):
            Sale.objects.create(
                product=prod,
                sale_price=prod.sale_price or prod.purchase_price * 2,
                sold_at=timezone.now() - timedelta(days=20 - i * 4),
                sold_by=admin,
                customer_name=f"Khách hàng {chr(65+i)}",
                note=f"Đơn hàng {i+1}",
            )
            print(f"  Created sale: {prod.name}")

    print("\n✅ Demo data seeded successfully!")
    print(f"   Products: {Product.objects.count()}")
    print(f"   Categories: {Category.objects.count()}")
    print(f"   Purchases: {Purchase.objects.count()}")
    print(f"   Sales: {Sale.objects.count()}")
    print(f"   Sliders: {Slider.objects.count()}")
    print(f"   Blogs: {BlogPost.objects.count()}")
    print(f"   Notifications: {Notification.objects.count()}")

if __name__ == "__main__":
    seed_demo()
