from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0002_alter_order_status"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE orders ADD COLUMN IF NOT EXISTS vnpay_txn_ref varchar(100) NULL UNIQUE;",
                "ALTER TABLE orders ADD COLUMN IF NOT EXISTS vnpay_paid_at timestamptz NULL;",
            ],
            reverse_sql=[
                "ALTER TABLE orders DROP COLUMN IF EXISTS vnpay_txn_ref;",
                "ALTER TABLE orders DROP COLUMN IF EXISTS vnpay_paid_at;",
            ],
        ),
    ]
