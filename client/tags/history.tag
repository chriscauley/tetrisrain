import ThemeMixin from '../unrest.js/css/ThemeMixin'

<tr-history>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>
        Previously played games
      </div>
    </div>
    <div class={theme.content}>
      <table class={css.table}>
        <thead>
          <tr>
            <th>id</th>
            <th>game_id</th>
            <th>getPieceCount</th>
          </tr>
        </thead>
        <tbody>
          <tr each={play,i in items} key={play.id}>
            <th>
              {play.id}
              <a href="#!/replay/{play.id}/" class={uR.icon('repeat')}></a>
            </th>
            <td>
              {play.game}
              <a href="#!/game/{play.game}/" class={uR.icon('repeat')}></a>
            </td>
            <td>{play.getPieceCount()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
<script>
this.mixin(ThemeMixin)
this.items = []
this.on("mount",() => {
  uR.SCRIPT_HASH
  this.update()
})
this.on("update", () => {
  this.items = [...uR.db.main.Play.objects.items.values()]
})
</script>
</tr-history>