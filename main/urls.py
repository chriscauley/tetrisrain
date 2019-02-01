from django.conf import settings
from django.contrib import admin
from django.contrib.staticfiles.views import serve
from django.urls import path, re_path, include

import unrest.views
import main.views
from unrest.nopass.views import create as nopass_create

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/nopass/',include('unrest.nopass.urls')),
    re_path('api/(main).(Play)/$', main.views.save_play),
    re_path('api/(main).(Game)/$', main.views.save_game),
    path("user.json",unrest.views.user_json),
    path("api/auth/register/",nopass_create),
]

if settings.DEBUG:
    urlpatterns.append(path('',main.views.index))
