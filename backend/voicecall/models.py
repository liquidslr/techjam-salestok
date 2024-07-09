from django.db import models

from helpers.paths import get_recording_file_path
from crm.models import Deal, Contact
from helpers.mixins import TimestampedModel


class CallSummary(TimestampedModel):
	text = models.TextField(blank=True, null=True)
	to_do = models.TextField(blank=True, null=True)
	def __str__(self):
		return f'{self.id}'

	class Meta:
		verbose_name_plural = 'Call Summary'

class CallRecord(TimestampedModel):
	contact = models.ForeignKey(to=Contact, related_name="call_record", on_delete=models.CASCADE)
	deal = models.ForeignKey(to=Deal, related_name="call_record", on_delete=models.CASCADE)
	recording = models.FileField(upload_to=get_recording_file_path, null=True, blank=True)
	transcript = models.TextField(blank=True, null=True)
	call_summary = models.ForeignKey(to=CallSummary, related_name='call_summary' , on_delete=models.CASCADE ,null=True, blank=True)


	def __str__(self):
		return f'{self.contact.first_name} - {self.deal.company.name} - {self.deal.name}'

	class Meta:
		verbose_name_plural = 'Call Recordings'


