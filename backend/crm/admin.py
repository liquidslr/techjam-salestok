from django.contrib import admin
from .models import Company, Tag, Contact, ContactNote, Deal, DealContact, ContactPersona, Tasks

# Register your models here.

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ContactNote)
class ContactNoteAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(DealContact)
class DealContactAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ContactPersona)
class ContactPersonaAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Tasks)
class TasksAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

