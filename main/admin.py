from django.contrib import admin

from .models import Game, Play

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    pass

@admin.register(Play)
class PlayAdmin(admin.ModelAdmin):
    list_display = ['__str__','user','data']
    list_editable = ['user']