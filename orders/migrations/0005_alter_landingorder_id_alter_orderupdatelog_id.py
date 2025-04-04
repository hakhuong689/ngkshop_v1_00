# Generated by Django 4.2.4 on 2025-03-19 15:20

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_orderupdatelog_delete_orderlog'),
    ]

    operations = [
        migrations.AlterField(
            model_name='landingorder',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='orderupdatelog',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
