from django.conf import settings
from django.db import models
from django.urls import reverse


class AddressMixin(models.Model):
    city = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    address_text = models.TextField(blank=True, null=True)
    latitude = models.CharField(max_length=255, blank=True, null=True)
    longitude = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, default='India')
    zipcode = models.PositiveBigIntegerField(blank=True, null=True)
    meta = models.JSONField(blank=True, null=True)

    class Meta:
        abstract = True


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at', '-updated_at']

    def get_admin_url(self, absolute=False):
        url = reverse(
            'admin:%s_%s_change' % (self._meta.app_label, self._meta.model_name),
            args=[self.id],
        )
        if absolute:
            url = settings.ADMIN_URL + url
        return url
