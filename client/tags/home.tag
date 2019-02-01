import _ from 'lodash'
import uR from 'unrest.io'

<tr-home>
  <div class={theme.outer}>
    <div class={theme.content}>
      <table class="table table-striped">
        <thead>
          <tr>
            <td>Name</td>
            <td>Plays</td>
            <td>Best</td>
          </tr>
        </thead>
        <tr each={game in games}>
          <td><a href={game.href}>{game.name}</a></td>
          <td>{game.play_count}</td>
          <td>{game.best}</td>
        </tr>
      </table>
    </div>
  </div>
<script>
  this.mixin(uR.css.ThemeMixin)
  const games = uR.db.main.Game.objects.all()//.filter(g=>g.name)
  this.games = games.map(game => {
    const plays = _.sortBy(
      uR.db.main.Play.objects.filter(p => p.game === game),
      "piece_count"
    )
    return {
      href: game.href,
      name: game.toString(),
      play_count: plays.length,
      best: plays.length? plays[0].piece_count: undefined,
    }
  })
</script>
</tr-home>