from django.urls import path
from . import views

urlpatterns = [
    path('auth/session/', views.session),
    path('auth/register/', views.register),
    path('auth/login/', views.sign_in),
    path('auth/logout/', views.sign_out),
    path('categories/', views.categories),
    path('courses/', views.courses),
    path('courses/<slug:slug>/', views.course_detail),
    path('courses/<slug:slug>/enroll/', views.enroll),
    path('courses/<slug:slug>/bookmark/', views.bookmark),
    path('lessons/<int:lesson_id>/', views.lesson_detail),
    path('lessons/<int:lesson_id>/complete/', views.complete_lesson),
    path('dashboard/', views.dashboard),
]
