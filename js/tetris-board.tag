import _ from 'lodash'

<tetris-board>
  <div class="board" style={board_style}>
    <div each={ row,_ir in rows } class="row">
      <div each={ s,_is in row } class="square { s.className }">
        { s.piece && s.piece.id }
      </div>
    </div>
  </div>

<script>
this.board = {squares: []}
this.on("before-mount",function() {
  window.TB = this
  this.board = this.opts.board
  this.margin_left = this.board.x_offset*this.board.scale
  this.board.tag = this
  this.trigger('resize')
})
this.on('resize',() => {
  const { scale, W, H, top } = this.board
  this.board_style = `
  width: ${(scale+1)*W};
  height: ${(scale+1)*(H-top)};
  margin-left: ${this.margin_left}px;
`
})

this.on("update", () => {
  const { W, H, top } = this.board
  const rows = this.rows = _.range(top,H).map(
    y => this.board.getLine(y,s=>true).map(
      s => ({ piece: s && s.piece })
    )
  )
  const piece = this.board.game.current_piece
  if (!piece) { return }
  piece.squares.forEach(s => {
    if (s.y-top < 0) { return }
    rows[s.y-top][s.x] = s
    s.className = ""
  })
  piece.skirt.forEach((dy,dx) => {
    if (piece.y-top+dy < 0) { return }
    rows[piece.y-top+dy][piece.skirt.x+dx].className='skirt'
  })
})
this.on("mount",() => {
  this.update()
})
</script>
<style>
  .board {
    position: absolute;
    top: 0;
  }

  .board .row {
    height: 20px;
    display: flex;
  }
  .board .square {
    text-align: center;
    width: 20px;
  }
  .board .skirt {
    border-bottom: 3px pink solid;
  }
</style>

</tetris-board>