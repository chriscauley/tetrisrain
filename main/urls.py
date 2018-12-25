from django.contrib import admin
from django.urls import path, re_path, include

import unrest.views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/nopass/',include('unrest.nopass.urls')),
    re_path('api/(main).(Game|Replay)/$', unrest.views.list_view),
]

