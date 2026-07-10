from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings', '0003_footersettings_telegram_footersettings_zalo'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='site_logo_public_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
