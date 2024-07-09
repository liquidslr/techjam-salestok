from rest_framework import serializers
from helpers.serializers_field import ChoiceDisplaySerializerField
from .models import Company, Contact, Tag, Deal, ContactNote


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = (
            'id',
            'name',
            'logo',
            'sector',
            'size',
            'linkedin',
            'website',
            'nb_contact',
            'sales_id',
        )


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = (
            'name',
            'color'
        )

class ContactSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True)
    company = CompanySerializer()

    class Meta:
        model = Contact
        fields = (
            'id',
            'phone_number',
            'first_name',
            'image',
            'title',
            'company',
            'email',
            'avatar',
            'first_seen',
            'last_seen',
            'has_newsletter',
            'gender',
            'nb_notes',
            'status',
            'sales_id',
            'background',
            'tags',
            'recommended_language',
            'created_at'
        )


class DealSerializer(serializers.ModelSerializer):
    company = CompanySerializer()
    contacts = ContactSerializer(many=True)
    stage = ChoiceDisplaySerializerField()
    start_at = serializers.CharField(source="created_at")
    type = ChoiceDisplaySerializerField(source="category")
    class Meta:
        model = Deal
        fields = (
            'id',
            'name',
            'company',
            'contacts',
            'type',
            'stage',
            'budget',
            'description',
            'amount',
            'nb_notes',
            'sales_id',
            'index',
            'start_at'
        )

class DealCreateUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True, )
    company = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), required=True
    )
    
    description = serializers.CharField(required=False, allow_null=True)
    stage = serializers.IntegerField(required=True)
    category = serializers.IntegerField(required=False)
    amount = serializers.IntegerField(required=False)

    class Meta:
        model = Deal
        fields = (
            'name',
            'company',
            'contacts',
            'type',
            'stage',
            'budget',
            'category',
            'description',
            'amount',
            'nb_notes',
            'sales_id',
            'index',
        )



class ContactNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactNote
        fields = (
            'type',
            'text',
            'status'
        )