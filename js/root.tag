import Game from './Game'

<root>
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
    <level-editor game={game} />
  </div>
  <div id="debug"></div>

this.on('mount',() => {
  // this should be done pre mount, and then during mount need to call
  // this.game.buildCanvas() or something
  // this will also get rid of some of the setTimeout(f,0) in many other places
  this.game = window.GAME = new Game()
})

</root>

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
  </table>
</controls>

