<tr-game>
  <div id="game">
    <div class="ui">
      <piece-stack game={game} name="next_piece" />
      <piece-stack game={game} name="piece_stash" after="STASH" />
    </div>
  </div>
  <div id="settings">
    <h3><b>Project<i> Zoidberg</i></b></h3>
    <hr />
    <controls />
    <scores game={game} />
    <!--<level-editor game={game} />-->
    <a href="#!/settings/">Game Settings</a>
    <a href="#!/history/">Player History</a>
  </div>
  <div id="debug"></div>

this.on('before-mount',() => {
  // this should be done pre mount, and then during mount need to call
  // this.game.buildCanvas() or something
  // this will also get rid of some of the setTimeout(f,0) in many other places
  if (opts.replay) {
    this.play = uR.db.main.Play.objects[this.opts.matches[1]]
    this.game = uR.db.main.Game.objects[this.play.game]
  } else {
    this.game = uR.db.main.Game.objects[this.opts.matches[1]]
  }
  this.game.tag = this
})
this.on('mount',() => {
  this.game.play()
  if (this.play) { this.game.replay(this.play) }
  window.GAME = this.game
})

</tr-game>

<controls>
  <table border=0 cellpadding=1 cellspacing=1>
    <tr>
      <td>&uarr;</td>
      <td>Rotate</td>
    </tr>
    <tr>
      <td><b>&larr; &darr; &rarr;</b></td>
      <td>Move</td>
    </tr>
    <tr>
      <td><b>space</b></td>
      <td>Drop</td>
    </tr>
    <tr>
      <td><b>shift</b></td>
      <td>Swap</td>
    </tr>
    <tr>
      <td><b>z</b></td>
      <td>Shake</td>
    </tr>
    <tr>
      <td><b>?</b></td>
      <td>Halp!</td>
    </tr>
  </table>
</controls>

