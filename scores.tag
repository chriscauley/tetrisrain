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
