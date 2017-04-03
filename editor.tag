<level-editor>
  <button onclick={ save }>Save</button>
  <h3>Load</h3>
  <p each={ name in files }>
    <a onclick={ trash } class="fa fa-trash"></a>
    <a onclick={ save } class="fa fa-save"></a>
    <a onclick={ load } class="fa fa-load"></a>
    { name }
  </p>

  var _confirm = (function() {
    var c = {};
    return function _confirm(e) {
      clearTimeout(c[e.item.name]);
      if (c[e.item.name]) {
        e.target.innerHTML = "";
        c[e.item.name] = undefined;
        e.target.className = "fa fa-check";
        setTimeout(function() {e.target.className = "fa fa-check";},5000)
        return true;
      }
      e.item._done = true;
      e.target.innerHTML = "?";
      c[e.item.name] = setTimeout(function() {
        e.target.innerHTML = "";
        c[e.item.name] = undefined;
      },3000);
    }
  })();
  this.on("update",function() {
    this.files = [];
    for (var name in uR.storage.times) { this.files.push(name); }
    this.files.sort();
  });
  save(e) {
    if (e.item && !_confirm(e)) { return; }
    var number = (e.item && e.item.name) || Math.round(10000*Math.random());
    GAME.saveGame(number);
  }
  trash(e) {
    if (!_confirm(e)) { return; }
    uR.storage.remove(e.item.name);
  }
  load(e) {
    GAME.loadGame(e.item.name)
  }
</level-editor>
