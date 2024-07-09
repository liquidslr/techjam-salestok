from django.urls import path

from .views import TokenAPIView, VoiceCallAPIView, GPTSummarizrAPIView, CallRecordAPIView

urlpatterns  = [
    path('token/', TokenAPIView, name='token'), 
    path('voice/', VoiceCallAPIView, name='voice-call'),
    path('call_records/<str:contact_id>/', CallRecordAPIView.as_view(), name='voice-call-records'),
    path('summarize/<str:call_id>/', GPTSummarizrAPIView.as_view(), name='voice-summarize'),
]