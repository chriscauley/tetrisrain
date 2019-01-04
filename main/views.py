from django.http import JsonResponse
import json

import unrest.views
from main.models import Play

def save_game(request):
    pass

def save_play(request,app_label,model_name):
    if not request.method == "POST":
        return unrest.views.list_view(request,app_label,model_name)
    data = json.loads(request.body.decode('utf-8') or "{}")
    game = data.pop('game',None)
    id = data.pop("id",0)
    if id:
        play = Play.objects.get(
            id=id,
            user=request.user,
        )
    else:
        play = Play.objects.create(
            game_id=game,
            user=request.user
        )
    play.data = data
    play.save()
    return JsonResponse(play.as_json)