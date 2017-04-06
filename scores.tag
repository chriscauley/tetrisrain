<scores>
  <p>Lines: <big>{ lines }</big></p>
  <p>Deep: <big>{ deep }</big></p>

  this.on("mount",function() {
    this.opts.board.scores = this;
    this.lines = 0;
    this.deep = 0;
  });

  add(name,value) {
    value = (value == undefined)?1:value;
    this[name] += value;
    this.update()
  }
</scores>

<piece-stack>
  <div class="piece p{ n }" each={ n in pieces }></div>
  <div class="piece empty" each={ empty_pieces }></div>

  this.on("mount",function() {
    this.opts.game.tags[this.opts.name] = this;
    this.root.classList.add(this.opts.name);
  })

  setPieces(pieces,empty) {
    this.pieces = pieces;
    console.log(this.pieces);
    this.empty_pieces = new Array(empty);
    this.update();
  }
</piece-stack>
