from django.db import models
from helpers.constants import StatusConstants, CategoryConstants
from helpers.mixins import AddressMixin, TimestampedModel
from helpers.paths import get_company_image_path, get_contact_image_path



class Company(AddressMixin, TimestampedModel):
    name = models.CharField(max_length=255,)
    logo = models.ImageField(upload_to=get_company_image_path, null=True, blank=True)
    sector = models.CharField(max_length=255, blank=True, null=True)
    size = models.CharField(max_length=255, blank=True, null=True)
    linkedin = models.CharField(max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    nb_contact = models.PositiveIntegerField(blank=True, null=True)
    sales_id = models.PositiveIntegerField(blank=True, null=True)
    def __str__(self):
        return f'{self.name} -- {self.sector}'

    class Meta:
        verbose_name_plural = 'Companies'


class Tag(TimestampedModel):
	name = models.CharField(max_length=255, )
	color = models.CharField(max_length=255, blank=True, null=True)
      
	def __str__(self):
		return f'{self.name}'

	class Meta:
		verbose_name_plural = 'Tags'


class Contact(AddressMixin, TimestampedModel):
	phone_number = models.CharField(max_length=255, blank=True, null=True )
	first_name = models.CharField(max_length=255, )
	image = models.ImageField(upload_to=get_company_image_path, null=True, blank=True)
	title = models.CharField(max_length=255, blank=True, null=True)
	company = models.ForeignKey( to=Company, related_name='contact', on_delete=models.CASCADE)
	email = models.CharField(max_length=255, blank=True, null=True)
	avatar = models.ImageField(upload_to=get_contact_image_path, null=True, blank=True)
	first_seen = models.DateTimeField()
	last_seen = models.DateTimeField()
	has_newsletter  = models.BooleanField(default=False)
	tags = models.ManyToManyField(to=Tag, related_name='contacts', blank=True)
	gender = models.CharField(max_length=255, blank=True, null=True)
	nb_notes = models.PositiveIntegerField(blank=True, null=True)
	status = models.CharField(max_length=255, blank=True, null=True)
	sales_id = models.PositiveIntegerField(blank=True, null=True)
	background = models.CharField(max_length=255, blank=True, null=True)
	recommended_language = models.CharField(max_length=255, blank=True, null=True)

	def __str__(self):
		return f'{self.first_name} -- {self.company.name}'

	class Meta:
		verbose_name_plural = 'Contacts'


class Deal(TimestampedModel):
	name = models.CharField(max_length=255, blank=True, null=True)
	company = models.ForeignKey(to=Company, on_delete=models.CASCADE, related_name='deal')
	contacts = models.ManyToManyField(to=Contact, through="crm.DealContact", related_name='contacts')
	type = models.CharField(max_length=255, blank=True, null=True)
	stage = models.PositiveIntegerField(choices=StatusConstants.CHOICES, default=StatusConstants.OPPORTUNITY)
	budget = models.CharField(max_length=255, blank=True, null=True)
	category = models.PositiveIntegerField(choices=CategoryConstants.CHOICES, default=CategoryConstants.OTHER)
	description = models.TextField(blank=True, null=True)
	amount = models.PositiveIntegerField(blank=True, null=True)
	nb_notes = models.PositiveIntegerField(blank=True, null=True)
	sales_id = models.PositiveIntegerField(blank=True, null=True)
	index = models.PositiveIntegerField(blank=True, null=True)

	def __str__(self):
		return f'{self.name}'

	class Meta:
		verbose_name_plural = 'Deals'


class DealContact(TimestampedModel):
	deal = models.ForeignKey(to=Deal, related_name="deal_contact_mappings", on_delete=models.CASCADE)
	contact = models.ForeignKey(to=Contact, related_name="deal_contact_mappings", on_delete=models.CASCADE)

	def __str__(self):
		return f"{self.deal.name}-{self.contact.first_name}"

	class Meta:
		verbose_name = "Deal Contact"
		verbose_name_plural = "Deal Contact Mappings"
		unique_together = ("deal", "contact", )


class ContactNote(TimestampedModel):
	contact = models.ForeignKey(to=Contact, on_delete=models.CASCADE, related_name='contact_note')
	type = models.CharField(max_length=255, blank=True, null=True)
	text = models.TextField(blank=True, null=True)
	deal = models.ForeignKey(to=Deal, related_name='contact_note', blank=True, null=True, on_delete=models.SET_NULL)
	status = models.CharField(max_length=255, blank=True, null=True)

	def __str__(self):
		return f'{self.contact.first_name}'

	class Meta:
		verbose_name_plural = 'Contact Notes'




class ContactPersona(TimestampedModel):
	follow_up = models.CharField(max_length=255, blank=True, null=True)
	persona =  models.TextField()
	contact = models.ForeignKey(to=Contact, related_name='contact_persona', on_delete=models.CASCADE)

	def __str__(self):
		return f'{self.contact.first_name}'

	class Meta:
		verbose_name_plural = 'Contact Personas'



class Tasks(TimestampedModel):
	item = models.TextField()
	due_date = models.DateTimeField()
	deal = models.ForeignKey(to=Deal, related_name='task', on_delete=models.CASCADE)
	contact = models.ForeignKey(to=Contact, related_name='task',null=True, on_delete=models.SET_NULL)

	def __str__(self):
		return f'{self.deal.name} - {self.contact.first_name}'

	class Meta:
		verbose_name_plural = 'Deal Tasks'
