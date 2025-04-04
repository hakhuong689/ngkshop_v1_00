# Generated by Django 4.2.4 on 2025-04-01 09:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cod_orders', '0002_alter_cod_orders_cod_amount_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cod_orders',
            name='cod_get_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AlterField(
            model_name='cod_orders',
            name='cod_status',
            field=models.CharField(default='', max_length=50),
        ),
        migrations.AlterField(
            model_name='cod_orders',
            name='cod_transfer_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
