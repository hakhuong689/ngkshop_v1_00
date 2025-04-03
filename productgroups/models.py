from django.db import models

class productgroups(models.Model):
    group_code = models.CharField(max_length=50, unique=True)
    group_name = models.CharField(max_length=255, null=False)
    note = models.CharField(max_length=255, null=True, blank=True)
    is_making_sale = models.BooleanField(default=False, null=True)

    def save(self, *args, **kwargs):
        # Chuyển group_code thành chữ in hoa, nếu có giá trị
        if self.group_code:
            self.group_code = self.group_code.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.group_code} - {self.group_name}"

    class Meta:
        db_table = 'productgroups'
