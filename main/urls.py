from django.contrib import admin
from django.urls import path, re_path, include

import unrest.views
from unrest.nopass.views import create as nopass_create

urlpatterns = [
    path("", unrest.views.redirect,kwargs={'url':'/static/index.html'}),
    path('admin/', admin.site.urls),
    path('api/nopass/',include('unrest.nopass.urls')),
    re_path('api/(main).(Game|Replay)/$', unrest.views.list_view),
    path("user.json",unrest.views.user_json),
    path("api/auth/register/",nopass_create),
]