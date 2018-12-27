import { debounce } from 'lodash'
import config from './config'

<scores>
  <div each={ name in names }>
    { name }: <big>{ totals[name] }</big>
    <hr/>
    <!--
        <div each={ number in visible[name] }>
          { number }
        </div>
        -->
  </div>

  reset() {
    this.data = { };
    this.totals = { };
    this.names = [];
    this.fname = "score/"+Math.random();
    this.update();
    this.n_visible = 5
  }

  this.on("mount",function() {
    this.reset()
    this.bounce = debounce(this.update);
    setTimeout(() => {
      this.opts.game.scores = this;
    })
  });

  this.on("update",function() {
    this.visible = {};
    this.names && this.names.map(function(name) {
      var array = this.data[name];
      var n = Math.min(this.n_visible,array.length);
      this.visible[name] = array.slice(array.length-n).reverse();
    }.bind(this));
  });

  add(name,value) {
    var turn = this.opts.game.turn;
    value = (value == undefined)?1:value;

    // first time we've seen this name
    if (!this.data[name]) {
      this.data[name] = [];
      this.totals[name] = 0;
      this.names.push(name);
    }

    // score combo
    if (!this.data[name][turn]) {
      while(this.data[name].length <= turn) { this.data[name].push(0); }
    } else {
      if (name != "combo") {
        this.add("combo",value);
      }
    }

    if (name != "combo" && this.data.combo && this.data.combo[turn-1]) {
      this.add("combo",value);
    }
    this.totals[name] += value;
    this.data[name][turn] += value;
    //uR.storage.set(this.fname,{data: this.data,totals: this.totals,names: this.names});
    this.bounce()
  };
</scores>

<piece-stack>
  <div class="piece p{ n }" each={ n in pieces }></div>
  <div class="piece empty" each={ empty_pieces }></div>
  <center if={ opts.after }>{ opts.after }</center>

  this.on("mount",function() {
    this.root.classList.add(this.opts.name);
    this.pieces = [undefined];
    this.update();
  })

  this.on('update', () => {
    const game = this.opts.game
    if (!game) { return }
    if (this.opts.name == "piece_stash") {
      const piece = game.swapped_piece
      this.pieces = [piece && piece.shape]
    } else {
      const { turn, n_preview } = game
      this.pieces = game.pieces.slice(turn + 1,turn + 1 + n_preview)
    }
  })

  setPieces(pieces,empty) {

  }
</piece-stack>

<level-editor>
  <input ref="save_name" riot-value={value}
         onkeydown={noop} onkeyup={noop}/>
  <button onclick={ save }>Save</button>
  <h3>Load</h3>
  <p each={ name,i in files } key={name}>
    <a onclick={ trash } class="fa fa-trash"></a>
    <a onclick={ load } class="fa fa-folder-open-o"></a>
    { name }
  </p>

  this.files = []
  this.value = `save_${Math.floor(Math.random()*10000)}`
  this.on('mount',() => this.update())
  noop(e) {
    this.value = e.target.value
    e.stopPropagation()
  }
  const _confirm = (function() {
    const c = {};
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
    this.storage = this.parent.game.saved_games
    this.files = [];
    let latest_time = undefined;
    for (let name of this.storage.keys) {
      this.files.push(name);
      if (this.storage.times[name] > latest_time) {
        this.last_game = name;
        latest_time = this.storage.times[name];
      }
    }
    this.files.sort();
  });
  save(e) {
    this.parent.game.save(this.value)
  }
  trash(e) {
    if (!_confirm(e)) { return; }
    this.storage.remove(e.item.name);
  }
  load(e) {
    this.parent.game.load(this.value = e.item.name)
  }
</level-editor>
