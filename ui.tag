<scores>
  <p>Lines: <big>{ lines }</big></p>
  <p>Deep: <big>{ deep }</big></p>

  this.on("mount",function() {
    this.opts.game.scores = this;
    this.opts.game.tags['scores'] = this;
    this.lines = 0;
    this.deep = 0;
    this.update();
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
    this.empty_pieces = [undefined];
  })

  setPieces(pieces,empty) {
    this.pieces = pieces;
    this.empty_pieces = new Array(empty);
    this.update();
  }
</piece-stack>

<level-editor>
  <button onclick={ save }>Save</button>
  <h3>Load</h3>
  <p each={ id in files }>
    <a onclick={ trash } class="fa fa-trash"></a>
    <a onclick={ save } class="fa fa-save"></a>
    <a onclick={ load } class="fa fa-folder-open-o"></a>
    { id }
  </p>

  var _confirm = (function() {
    var c = {};
    return function _confirm(e) {
      clearTimeout(c[e.item.id]);
      if (c[e.item.id]) {
        e.target.innerHTML = "";
        c[e.item.id] = undefined;
        e.target.className = "fa fa-check";
        setTimeout(function() {e.target.className = "fa fa-check";},5000)
        return true;
      }
      e.item._done = true;
      e.target.innerHTML = "?";
      c[e.item.id] = setTimeout(function() {
        e.target.innerHTML = "";
        c[e.item.id] = undefined;
      },3000);
    }
  })();
  this.on("update",function() {
    this.files = [];
    var latest_time = undefined;
    for (var path in uR.storage.times) {
      match = path.match(/^game\/(\d+)/);
      if (match) {
        this.files.push(match[1]);
        if (uR.storage.times[path] > latest_time) {
          this.last_game = path;
          latest_time = uR.storage.times[path];
        }
      }
    }
    this.files.sort();
  });
  this.on("mount", function() {
    this.game = this.opts.game
    if (!this.game.DEBUG) {
      this.root.style.display = "none";
    } else {
      this.files.length && this.game.loadGame(this.last_game);
    }
  });
  save(e) {
    if (e.item && !_confirm(e)) { return; }
    var number = (e.item && e.item.id) || Math.round(10000*Math.random());
    this.game.saveGame("game/"+number);
  }
  trash(e) {
    if (!_confirm(e)) { return; }
    uR.storage.remove(e.item.id);
  }
  load(e) {
    this.game.loadGame(e.item.id)
  }
</level-editor>
