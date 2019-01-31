import uR from 'unrest.io'

<tr-home>
  <div class={theme.outer}>
    <div class={theme.content}>
      <div each={game in games}>
        {game}
        <a href={game.href}>{game}</a>
      </div>
    </div>
  </div>
<script>
  this.mixin(uR.css.ThemeMixin)
  this.games = uR.db.main.Game.objects.filter(g=>g.name)
</script>
</tr-home>