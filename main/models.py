from django.db import models

from unrest.models import JsonModel, UserModel



class Game(JsonModel):
    pass

class Play(UserModel):
    game = models.ForeignKey(Game,on_delete=models.CASCADE)