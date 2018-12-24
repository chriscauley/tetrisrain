from django.contrib import admin
from django.urls import path, re_path

import unrest.views

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path('api/(main).(Game|Play)/', unrest.views.list_view),
]

