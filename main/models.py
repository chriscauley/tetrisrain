from django.db import models

from unrest.models import JsonModel, UserModel


class Game(JsonModel):
    json_fields = ['id','data']
    def __str__(self):
        return self.data.get("name","Game #{}".format(self.id))

class Play(UserModel):
    json_fields = ['game_id','id','data']
    game = models.ForeignKey(Game,on_delete=models.CASCADE)
    class Meta:
        ordering = ('id',)