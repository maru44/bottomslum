from . import views
from django.urls import path, include

urlpatterns = [
    path('', views.index, name='index'),
    path('detail/<pk>', views.det, name='det'),
    path('wall/<slug:slug_name>', views.walldetail, name='wall'),
    path('anonymous/<aid>', views.anonposts, name='aid'),
]
