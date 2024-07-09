from . import consumers
from django.urls import path

urlpatterns  = [
    path('ws/transcribe/inbound/', consumers.TranscriptionInBoundConsumer.as_asgi()),
    path('ws/transcribe/outbound/', consumers.TranscriptionOutBoundConsumer.as_asgi()),
    path('ws/transcriptions/', consumers.TranscriptionDataConsumer.as_asgi()),
]