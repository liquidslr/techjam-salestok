from django.contrib import admin

from .models import CallRecord, CallSummary

@admin.register(CallRecord)
class CallRecordAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')

@admin.register(CallSummary)
class CallSummaryAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at')
