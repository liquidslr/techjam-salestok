from django.urls import path
from .views import (
    CompanyAPIView, 
    CompaniesDetailAPIView, 
    ContactsAPIView, 
    ContactsDetailAPIView,
    DealsAPIView,
    DealsDetailAPIView,
    ContactNotesAPIView,
    TasksAPIView
)
urlpatterns  = [
    path('companies/', CompanyAPIView.as_view(), name='companies-view',),
    path('companies/<str:company_id>/', CompaniesDetailAPIView.as_view(), name='company-detail-view',),
    path('contacts/', ContactsAPIView.as_view(), name='contacts-view',),
    path('contacts/<str:contact_id>/', ContactsDetailAPIView.as_view(), name='contact-detail-view',),
    path('deals/', DealsAPIView.as_view(), name='deals-view',),
    path('deals/<str:deal_id>', DealsDetailAPIView.as_view(), name='deal-detail-view',),
    path('notes/<str:contact_id>', ContactNotesAPIView.as_view(), name='contact-note-view',),
    path('tasks/', TasksAPIView.as_view(), name='tasks-view',),
]