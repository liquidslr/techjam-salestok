from rest_framework import serializers
from helpers.serializers_field import ChoiceDisplaySerializerField
from .models import CallRecord, CallSummary


class CallSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CallSummary
        fields = (
          'id',
          'text',
          'to_do',
           'created_at',
        'updated_at'
        )

class CallRecordSerializer(serializers.ModelSerializer):
    call_summary = CallSummarySerializer()

    class Meta:
        model = CallRecord
        fields = (
            'id',
            'contact',
            'deal',
            'recording',
            'transcript',
            'call_summary',
            'created_at',
            'updated_at'
        )
