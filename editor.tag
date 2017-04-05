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
    console.log(this.last_game);
    this.files.length && this.opts.game.loadGame(this.last_game);
  });
  save(e) {
    if (e.item && !_confirm(e)) { return; }
    var number = (e.item && e.item.id) || Math.round(10000*Math.random());
    GAME.saveGame("game/"+number);
  }
  trash(e) {
    if (!_confirm(e)) { return; }
    uR.storage.remove(e.item.id);
  }
  load(e) {
    GAME.loadGame(e.item.id)
  }
</level-editor>
