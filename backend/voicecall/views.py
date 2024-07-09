import os
import openai
import json
from django.http import JsonResponse
from django.conf import settings
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from django.http import JsonResponse
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from urllib.parse import parse_qs
from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import status
from helpers.calls import gpt_summarize, clean_conversation, generate_to_do

from .models import CallRecord, CallSummary
from .serializers import CallRecordSerializer

def TokenAPIView(request):
    identity = request.GET.get('identity', 'user')
    account_sid = settings.TWILIO_ACCOUNT_SID
    twiml_app_sid = settings.TWILIO_TWIML_APP_SID

    token = AccessToken(account_sid, settings.TWILIO_API_KEY, settings.TWILIO_API_SECRET, identity=identity)
    voice_grant = VoiceGrant(outgoing_application_sid=twiml_app_sid)
    token.add_grant(voice_grant)
    return JsonResponse({'token': token.to_jwt(), 'identity': identity})


def generate_twiml_bin(receiver_phone_number):
    twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
    <Response>
    <Start>
        <Stream url="wss://1272-162-242-105-73.ngrok-free.app/ws/transcribe/inbound/" track="inbound_track"/>
    </Start>
    <Start>
        <Stream url="wss://1272-162-242-105-73.ngrok-free.app/ws/transcribe/outbound/" track="outbound_track"/>
    </Start>
    <Dial callerId="+18556991813">
        +1{receiver_phone_number}
    </Dial>
    <Pause length="40"/>
    </Response>'''
    return twiml


@csrf_exempt
def VoiceCallAPIView(request):
    if request.method == 'POST':
        body = request.body.decode('utf-8')
        data = parse_qs(body)
        to_number = data.get('To', [None])[0]
        if to_number:
            twiml_response = generate_twiml_bin(to_number)
            return HttpResponse(twiml_response, content_type='text/xml')
        else:
            return HttpResponse('Missing "To" parameter', status=400)
    else:
        return HttpResponse(status=405)


def summarize():
    record = CallRecord.objects.first()
    completion = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": f'This is a sales conversation. \
             Can you summarize the conversation highlighting the important points discussed. Just give me the summary. Conversation:{record.transcript}'}
        ],
    )
    return completion.choices[0].message.content


class GPTSummarizrAPIView(APIView):
    http_method_names = ("get", "post")

    @staticmethod
    def get(request, *args, **kwargs):
        call_id = kwargs.get("call_id", None)
        call = CallRecord.objects.get(id=call_id)

        cleaned_conversation = clean_conversation(call.transcript)
        summary = gpt_summarize(cleaned_conversation)
        to_do = generate_to_do(cleaned_conversation)
        
        if call.call_summary and call.call_summary.id:
            call_summary = call.call_summary
            call_summary.text = summary
            call_summary.to_do = to_do
            call_summary.save()
        else:
            call_summary = CallSummary.objects.create(
                text=summary,
                to_do=to_do
            )
            call.call_summary = call_summary
            call.save()

        return Response(CallRecordSerializer(call).data, status=status.HTTP_200_OK)


class CallRecordAPIView(APIView):
    http_method_names = ("get", "post")

    @staticmethod
    def get(request, *args, **kwargs):
        deal_id = request.GET.get("deal_id", None)
        contact_id = kwargs.get("contact_id", None)
        call_records = CallRecord.objects.filter(
            deal__id=deal_id,
            contact__id=contact_id,
        )

        to_do_list = []
        last = 0 
        for record in call_records:
            if record.call_summary:
                todo = json.loads(record.call_summary.to_do)
                for idx, item in enumerate(todo):
                    item["id"] = last + 1
                    item["done_date"] = ""
                    item["due_date"] = item.get("deadline", "")
                    item["text"] = item.get("task", "")
                    item["contact_id"] = contact_id
                    item["type"] = ""
                    last+=1
                to_do_list.extend(todo)

        call_records_data = CallRecordSerializer(call_records, many=True).data

        return Response({'data': call_records_data, 'to_do': json.dumps(to_do_list)}, status=status.HTTP_200_OK)