from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from rest_framework import status
from datetime import datetime

from helpers.converters import converts_keys
from .serializers import (
    CompanySerializer, 
    ContactSerializer, 
    DealSerializer, 
    DealCreateUpdateSerializer,
    ContactNoteSerializer
)
from .models import Company, Contact, Deal, ContactNote
from voicecall.models import CallRecord
import json

class CompanyAPIView(ListAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer
    http_method_names = ("get", "post")


    def get_queryset(self, *args, **kwargs):
        companies = Company.objects.all().order_by(
            "-created_at"
        )
        return list(companies)
    

class CompaniesDetailAPIView(APIView):
    http_method_names = ("get", "post")

    @staticmethod
    def get(request, *args, **kwargs):
        company_id = kwargs.get("company_id", None)
        try:
            contact = Company.objects.get(id=company_id)
            return Response(CompanySerializer(contact).data, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)



class ContactsAPIView(ListAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = ContactSerializer
    http_method_names = ("get", "post")


    def get_queryset(self, *args, **kwargs):
        contacts = Contact.objects.all().order_by(
            "-created_at"
        )
        return list(contacts)


class ContactsDetailAPIView(APIView):
    http_method_names = ("get", "post")

    @staticmethod
    def get(request, *args, **kwargs):
        contact_id = kwargs.get("contact_id", None)
        try:
            contact = Contact.objects.get(id=contact_id)
            notes = ContactNote.objects.filter(contact=contact_id)
            data = ContactSerializer(contact).data
            data['notes'] = ContactNoteSerializer(notes, many=True).data
            return Response(data,status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class DealsAPIView(ListAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = DealSerializer
    http_method_names = ("get", "post")


    def get_queryset(self, *args, **kwargs):
        deals = Deal.objects.all().order_by(
            "-created_at"
        )
        return list(deals)

    @staticmethod
    def post(request, *args, **kwargs):
        parsed_data = converts_keys(request.data)

        try:
            serializer = DealCreateUpdateSerializer(data=parsed_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            deal = serializer.instance
            return Response(status=status.HTTP_204_NO_CONTENT)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class DealsDetailAPIView(APIView):
    http_method_names = ("get", "post")

    @staticmethod
    def get(request, *args, **kwargs):
        deal_id = kwargs.get("deal_id", None)
        try:
            deal = Deal.objects.get(id=deal_id)
            return Response(DealSerializer(deal).data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)



class ContactNotesAPIView(APIView):
    http_method_names = ("get", "post")

    @staticmethod
    def get(request, *args, **kwargs):
        contact_id = kwargs.get("contact_id", None)
        try:
            notes = ContactNote.objects.filter(contact=contact_id)
            return Response(ContactNoteSerializer(notes, many=True).data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        

class TasksAPIView(APIView):
    @staticmethod
    def get(request, *args, **kwargs):
        call_records = CallRecord.objects.all()

        to_do_list = []
        last = 0
        for record in call_records:
            if record.call_summary:
                todo = json.loads(record.call_summary.to_do)
                for idx, item in enumerate(todo):
                    deadline_str = item.get("deadline", "")
                    if deadline_str:
                        try:
                            deadline_date = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                            if deadline_date < datetime.now():
                                item["id"] = last + 1
                                item["done_date"] = ""
                                item["due_date"] = deadline_str
                                item["text"] = item.get("task", "")
                                item["contact_id"] = record.contact.id
                                item["type"] = ""
                                last += 1
                        except Exception as e:
                                print(e, "e")
                                item["id"] = last + 1
                                item["done_date"] = ""
                                item["due_date"] = deadline_str
                                item["text"] = item.get("task", "")
                                item["contact_id"] = record.contact.id
                                item["type"] = ""
                                last += 1
                to_do_list.extend(todo)

        return Response(json.dumps(to_do_list), status=status.HTTP_200_OK)