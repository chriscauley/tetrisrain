  // IMAGES
  class Board extends CanvasObject {
    constructor(game) {
      super();
      this.game = game;
      this.scale = this.game.scale;
      this.height = 30;
      this.reset();
      this.width = game.config.board_width;
      this.DEEP = 8;

      this.pallet = new Pallet({board: this});
      this.makeCanvas();
    }

    reset() {
      this.skyline=this.height-1;
      this.top = this.height-this.game.visible_height;;
      this.f = new Array();
      for (var i=0;i<this.height;i++) {
        this.f[i]=new Array();
        for (var j=0;j<20;j++) { this.f[i][j]=0; }
      }
      this.canvas && this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); //!# TODO this isn't wiping the board...
    }

    draw() {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

      // draw all pieces
      for (var i=0;i<this.f.length;i++) {
        for (var j=0;j<this.f[i].length;j++) {
          var _f = this.f[i][j];
          if (!_f) { continue; }
          this.drawBox(
            j,i,
            1,1,
            this.pallet[Math.abs(_f)]
          );
        }
        this.ctx.fillStyle = "black"; this.ctx.fillText(i+"",0,i*this.scale+12);
      }
    }

    makeCanvas() {
      var attrs = {
        id: "board",
        width: this.width*this.scale + 1,
        height: this.height*this.scale + 1,
        parent: this.game.DEBUG && document.getElementById("debug"),
      }
      this.canvas = this.newCanvas(attrs);
      this.ctx = this.canvas.ctx;

      attrs.id = "grid-img";
      this.grid = this.newElement("img",attrs);
      // this.game.DEBUG && document.getElementById("debug").appendChild(this.grid);

      // gradient on grid
      this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      this.gradient.addColorStop(0, 'red');
      this.gradient.addColorStop(2/this.height, 'red');
      this.gradient.addColorStop(2/this.height, '#faa');
      this.gradient.addColorStop(0.5, '#fff');
      this.gradient.addColorStop(1, '#fff');
      this.ctx.fillStyle = this.gradient;
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

      // make grid
      for (var i=0;i<=this.width;i++) {
        drawLine(this.ctx,i*this.scale,0,i*this.scale,this.canvas.height,this.pallet.border);
      }
      for (var i=0;i<=this.height;i++) {
        drawLine(this.ctx,0,i*this.scale,this.canvas.width,i*this.scale,this.pallet.border);
      }
      this.grid.src = this.canvas.toDataURL();
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

      // make pieces
      this.small_canvas = this.newCanvas({
        width: this.game.n*this.scale+1,
        height: this.game.n*this.scale+1,
      });
      this.imgs = {};
      var style = "";
      var piece_div = document.createElement("div");
      uR.forEach(this.game.pieces_xyr,function(p,n) {
        if (!p) { return }
        var w = this.small_canvas.width,
            h = this.small_canvas.height;
        this.imgs[n] = [];

        for (var r=0;r<p.length;r++) { // cycle through rotations
          this.small_canvas.ctx.clearRect(0,0,w,h);
          for (var i=0;i<this.game.n;i++) { // draw 4 boxes
            this.small_canvas.ctx.fillStyle = this.pallet[n];
            this.small_canvas.ctx.fillRect(
              (2+p[r][0][i])*this.scale,(1+p[r][1][i])*this.scale,
              this.scale,this.scale
            )
          }

          var img = document.createElement("img");
          img.src = this.small_canvas.toDataURL();
          piece_div.appendChild(img);
          this.imgs[n].push(img);
          if (r == 0) { // style tag for showing pieces in html elements (piece-list)
            style += `piece-stack .p${ n }:before { background-image: url(${ img.src }); }\n`;
          }

        }
      }.bind(this));
      this.game.DEBUG && document.querySelector("#debug").appendChild(piece_div);
      this.newElement("style",{parent: document.head, innerHTML: style, type: "text/css"});
    }

    removeLines() {
      var _lines = [],changed;
      for (var i=this.skyline;i<this.height;i++) {
        if (this.f[i][0] == this.DEEP && i>this.deep_line) { continue }
        var gapFound=0;
        for (var j=0;j<this.width;j++) {
          if (this.f[i][j]==0) { gapFound=1; break; }
        }
        if (gapFound) continue; // gapFound in previous loop

        changed = true;
        if (i>=this.deep_line) { // make row DEEP
          for (var j=0;j<this.width;j++) { this.f[i][j]=this.DEEP; }
          continue;
        }

        this.scoreLine(i);
        _lines.push(i);
      }

      if (!changed) { return; }
      this.game.animateLines(_lines);
      uR.forEach(_lines,function(i) {
        //eliminate line by moving eveything down a line
        for (var k=i;k>=this.skyline;k--) {
          for (var j=0;j<this.width;j++) { this.f[k][j]=this.f[k-1][j]; }
        }
        for (var j=0;j<this.width;j++) { this.f[0][j]=0; }// set top to zero
        this.skyline++;
      }.bind(this));
      this.draw();
      this.game.getSkyline();
    }

    scoreLine(i) {
      // maybe just move this logit to the scores tag?
      if (this.f[i][0] == this.DEEP) { this.game.scores.add("deep") }
      else { this.game.scores.add("lines"); }
    }
    setPiece() {
      var p = this.game.piece;
      for (var k=0;k<this.game.n;k++) {
        var X=p.x+p.dx[k];
        var Y=p.y+p.dy[k];
        if (0<=Y && Y<this.height && 0<=X && X<this.width && this.f[Y][X]!=-p.n) {
          this.f[Y][X]=p.n;
        }
      }
      this.draw();
      this.game.nextTurn();
    }
  }

  class Game extends CanvasObject {
    constructor() {
      super();
      this.DEBUG = ~window.location.search.indexOf("debug");
      this.makeVars();
      this.container = document.getElementById("game");
      this.makeUI();

      this.animation_time = 500;
      this.canvas = this.newCanvas({
        id: "game_canvas",
        width: 400,
        height: window.innerHeight,
        parent: this.container,
      });
      this.ctx = this.canvas.ctx;

      this.makeActions();
      this.controller = new Controller(this);
      this.board = new Board(this);
      this.animation_canvas = this.newCanvas({
        width: this.board.width*this.scale+1,
        height: this.board.height*this.scale+1,
      });

      this.reset();
      this.board.draw();
      this.tick = this.tick.bind(this);
      this.tick();
      this.DEBUG && this.loadGame(430);
    }

    makeUI() {
      this.tags = {};
      var container = this.newElement("div",{className: "ui",parent: this.container });
      this.newElement("scores",{parent: document.getElementById("settings")},{game: this});
      this.newElement(
        'level-editor',
        {parent: document.getElementById("settings")},
        {game:this}
      );
      this.newElement(
        "piece-stack",
        { parent: container },
        { name: "next_piece", game: this }
      );
      this.newElement(
        "piece-stack",
        { parent: container },
        { name: "piece_stash", game: this, after: "STASH" }
      );
    }

    animateLines(lines) {
      if (!lines.length) { return; }
      var ctx = this.animation_canvas.ctx;
      ctx.clearRect(0,0,this.animation_canvas.width,this.animation_canvas.height)
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      uR.forEach(lines,function(line_no) {
        ctx.drawImage(
          this.board.canvas,
          0,line_no*this.scale, // sx, sy,
          this.board.canvas.width,this.scale, // sw, sh,
          0,(line_no-this.board.top)*this.scale, // dx, dy,
          this.board.canvas.width,this.scale // dw, dh
        )
        ctx.fillRect(
          0,(line_no-this.board.top)*this.scale, // dx, dy,
          this.board.canvas.width,this.scale // dw, dh
        )
      }.bind(this));
      this.animation_opacity = new Ease(250,1,-1);
    }

    tick() {
      cancelAnimationFrame(this.animation_frame);
      this.draw();
      this.animation_frame = requestAnimationFrame(this.tick);
    }

    draw() {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.ctx.save();
      this.ctx.translate(this.x_margin,this.y_margin);
      var current_top = this.top;
      if (this.animations) {
        var a = this.animations[0];
        var r = 1-Math.pow((new Date().valueOf() - a.start)/this.animation_time,2);
        if (r<0) { this.animations = undefined; }
        else {
          current_top = a.to - (a.to-a.from)*r;
        }
      }
      // draw grid and floor
      this.floor = this.board.height-current_top/this.scale;
      var grid_rows = this.floor;
      this.ctx.drawImage(
        this.board.grid,
        0,current_top,
        this.board.grid.width,grid_rows*this.scale,
        0,0,
        this.board.grid.width,grid_rows*this.scale
      );
      this.drawBox(
        -0.5, this.floor,
        this.board.canvas.width/this.scale+1,4/this.scale,
        "black"
      );
      this.drawBox(
        -0.5, this.trigger_line,
        this.board.canvas.width/this.scale+1,4/this.scale,
        "red"
      );
      this.drawBox(
        -0.5, this.config.b_level-this.board.top+1,
        this.board.canvas.width/this.scale+1,4/this.scale,
        "blue"
      );

      // draw board
      this.ctx.drawImage(
        this.board.canvas,
        0,current_top, // sx, sy,
        this.canvas.width,this.canvas.height, // sWidth, sHeight,
        0,0, // dx, dy,
        this.canvas.width,this.canvas.height // dWidth, dHeight
      )

      // draw water
      this.drawBox(
        -5, this.board.deep_line-this.board.top,
        this.board.width+10,this.canvas.height,
        "rgba(0,0,255,0.25)"
      )

      // animation
      var y_offset = 0;
      var a_opacity = this.animation_opacity && this.animation_opacity.get();
      if (a_opacity) {
        this.ctx.globalAlpha = a_opacity;
        this.ctx.drawImage(this.animation_canvas,0,0);
        this.ctx.globalAlpha = 1;
      }

      // draw ghost
      this.ctx.globalAlpha = 0.5;
      var p = this.piece;
      var color = this.board.pallet[p.n];
      this.ctx.drawImage(
        this.board.imgs[this.piece.n][this.piece.r],
        (this.piece.x-2)*this.scale,(this.ghostY-1)*this.scale-current_top
      )

      //uR.forEach(p.dx,function(_,j) {
      //  this.drawBox(p.x+p.dx[j],this.ghostY+p.dy[j]-this.board.top,1,1,color);
      //}.bind(this));
      this.ctx.globalAlpha = 1;

      // draw piece
      this.ctx.drawImage(
        this.board.imgs[this.piece.n][this.piece.r],
        (this.piece.x-2)*this.scale,(this.piece.y-this.board.top-1)*this.scale
      )

      this.ctx.restore(); // remove translates above
    }

    makeVars() {
      this.scale = 20,
      this.config = {
        b_level: 10,
        game_width: 10,
        board_width: 10,
        n_preview: 5,
      }
      this.visible_height = 20;
      this.x_margin = 100;
      this.y_margin = 20;
      //this.pieces = [2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,2,3,7,7,7,7,6,6,6,6];
      this.pieces = [2,3,7,6,2,3,7,6,6,2,3,7,6,2,3,7,6,6,2,3,7,6,2,3,7,6,6,2,3,7,6,2,3,7,6,6]
      //this.pieces = [6,6,6,6]; //,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6];
      this.level=1;
      this.speed = this.speed0=700;
      this.speedK=60;

      this.n = 4; // Number of squares... it's tetris!
      this.pieces_xyr = [
        undefined, // empty
        [ // t
          [[0, 1,-1, 0],[0, 0, 0, 1]],
          [[0, 0, 0, 1],[0,-1, 1, 0]],
          [[0,-1, 1, 0],[0, 0, 0,-1]],
          [[0, 0, 0,-1],[0, 1,-1, 0]]
        ],
        [ // q
          [[0, 1,-1,-1],[0, 0, 0, 1]],
          [[0, 0, 0, 1],[0,-1, 1, 1]],
          [[0,-1, 1, 1],[0, 0, 0,-1]],
          [[0, 0, 0,-1],[0, 1,-1,-1]],
        ],
        [ // p
          [[0, 1,-1, 1],[0, 0, 0, 1]],
          [[0, 0, 0, 1],[0,-1, 1,-1]],
          [[0,-1, 1,-1],[0, 0, 0,-1]],
          [[0, 0, 0,-1],[0, 1,-1, 1]],
        ],
        [
          [[0,-1, 1, 0],[0, 0, 1, 1]],
          [[0, 0, 1, 1],[0, 1,-1, 0]],
        ], // z
        [
          [[0, 1,-1, 0],[0, 0, 1, 1]],
          [[0, 0, 1, 1],[0,-1, 1, 0]],
        ], // s
        [
          [[0, 1,-1,-2],[0, 0, 0, 0]],
          [[0, 0, 0, 0],[0,-1, 1, 2]]
        ], // l
        [[[0, 1, 1, 0],[0, 0, 1, 1]]], // o
      ];
      this.n_types = this.pieces_xyr.length - 1;
      this.turns = [];
    }

    reset(id) {
      this.id=id || "autosave";
      this.piece = undefined;
      this.makeVars();
      this.turn = 0;

      this.controller.reset(id);
      this.board.reset(id);
      this.getPiece();
      this.scores && this.scores.mount();
      this.updatePieceList();
      this.getSkyline();
    }

    nextTurn() {
      this.getSkyline();
      this.board.removeLines();
      this.turns.push({
        n: this.piece.n,
        x: this.piece.x,
        y: this.piece.y,
      });
      this.turn++;
      this.getPiece();
      if (!this.pieceFits(this.piece.x,this.piece.y)) { this.gameOver(); return; }
    }

    saveGame(id) {
      var j;
      for (var i =0;i<this.board.f.length;i++) {
        for (j=0;j<this.board.f[i].length;j++) { if (this.board.f[i][j]>0) break; }
        if (this.board.f[i][j]) { break; }
      }
      uR.storage.set(id,this.board.f.slice(i));
    }

    loadGame(id,reset) {
      if (reset === undefined) { reset = true; }
      reset && this.reset(id);
      var _f = uR.storage.get("game/"+id);
      if (!_f) { return }
      if (this.board.height < _f.length) {
        this.board.height = _f.length+this.visible_height;
      }
      var new_skyline = this.board.height;
      uR.forEach(_f|| [],function(line,i) {
        var line_no = 1+i+this.board.skyline-_f.length;
        this.board.f[line_no] = line;
        uR.forEach(this.board.f[line_no],function(c) {
          if (c && line_no<new_skyline) {
            new_skyline = line_no;
          }
        }.bind(this));
      }.bind(this));
      this.board.skyline = new_skyline;
      this.piece.y = this.board.top;
      this.board.draw();
      this.pieceFits();
    }

    getSkyline() {
      var found;
      for (var i=0,h=this.board.f.length;i<h;i++) {
        for (var j=0, w=this.board.f[i].length;j<w;j++) {
          if (this.board.f[i][j]) {
            this.board.skyline = i;
            found = true;
            break;
          }
        }
        if (found) { break; }
      }

      var old_top = Math.max(this.top,0);;
      var top = (this.board.skyline-this.visible_height+this.config.b_level)*this.board.scale;
      top = Math.min((this.board.height-this.visible_height)*this.board.scale,top);
      this.trigger_line = Math.max(top/this.scale,this.config.b_level);
      this.top = Math.max(top,this.scale);
      this.board.top = this.top/this.scale;
      this.board.deep_line = this.board.top+this.visible_height;
      if (this.top != old_top) {
        this.top_from = old_top;
        this.animations = [{from: old_top, to: this.top, start: new Date().valueOf() }]
      }
    }

    updatePieceList() {
      while (this.pieces.length <= this.turn+this.config.n_preview+1) {
        this.pieces.push(Math.floor(this.n_types*Math.random()+1));
      }
      var visible = this.pieces.slice(this.turn+1,this.turn+1+this.config.n_preview),
          empty = this.config.n_preview - visible.length;
      this.tags.next_piece && this.tags.next_piece.setPieces(visible,empty);
      return this.pieces[this.turn];
    }

    getPiece(N) {
      N = N || this.updatePieceList();

      var y = Math.max(this.board.top - this.config.b_level,0);
      y = Math.max(y,this.board.top);
      var r = 0;
      this.piece = {
        n: N,
        x: 5,
        y: y,
        r: r,
        dx: this.pieces_xyr[N][r][0],
        dy: this.pieces_xyr[N][r][1],
      };
    }

    gameOver() {
      this.reset();
    }

    makeActions() {
      this._act = {
        left: function() {
          var p = this.piece;
          if (this.pieceFits(p.x-1,p.y)) { p.x--; }
        },

        right: function() {
          var p = this.piece;
          if (this.pieceFits(p.x+1,p.y)) { p.x++; }
        },

        down: function(e) {
          e && e.preventDefault();
          var p = this.piece;
          if (this.pieceFits(this.piece.x,this.piece.y+1)) { this.piece.y++; }
          else { this.board.setPiece(); this.nextTurn(); }
        },

        rotate: function(e) {
          e.preventDefault();
          var p = this.piece;
          if (this.pieces_xyr[p.n].length == 1) { return } // o don't rotate!
          var r = (p.r + 1)%this.pieces_xyr[p.n].length;

          if (this.pieceFits(p.x,p.y,r)) {
            p.r = r;
            p.dx = this.pieces_xyr[p.n][r][0];
            p.dy = this.pieces_xyr[p.n][r][1];
          }
        },

        drop: function(e) {
          e.preventDefault();
          var p = this.piece;
          if (!this.pieceFits(p.x,p.y+1)) { this.board.setPiece(); return; }
          p.y = this.ghostY;
        },
        lock: function() {
          if (this.piece.y == this.ghostY) { this.board.setPiece(); }
        },
        swapPiece: function() {
          if (this.last_swap == this.turn) { return }
          this.last_swap = this.turn;
          if (!this.swapped_piece) {
            this.swapped_piece = this.pieces.splice(this.turn,1)[0];
            this.getPiece();
          } else {
            var old_piece = this.swapped_piece;
            this.swapped_piece = this.piece.n;
            this.piece = undefined;
            this.getPiece(old_piece);
            this.pieces[this.turn] = this.piece.n;
          }
          this.tags.piece_stash.setPieces([this.swapped_piece],0);
        }
      };

      this.act = {};
      for (var k in this._act) {
        this.act[k] = function(func,that) {
          return function(e) {
            func.bind(that)(e);
            that.getGhost();
          }
        }(this._act[k],this)
      }
    }

    getGhost() {
      if (! this.piece) { return; }
      this.ghostY = this.board.skyline-4;
      while (this.pieceFits(this.piece.x,this.ghostY+1)) { this.ghostY++; }
    }

    pieceFits(X,Y,r) {
      if (r == undefined) { r = this.piece.r; }
      var dx = this.pieces_xyr[this.piece.n][r][0];
      var dy = this.pieces_xyr[this.piece.n][r][1];
      for (var k=0;k<this.n;k++) {
        var _x = X+dx[k];
        var _y = Y+dy[k];
        if (
          _x<0 || _x>=this.board.width || // square is not in x
          _y>=this.board.height || // square is above bottom of board
          (_y>-1 && this.board.f[_y][_x]>0) // square is not occupied, if square is not above board
        ) { return 0; }
      }
      return 1;
    }
  }

  class Controller {
    constructor(game) {
      this.game = game;
      document.addEventListener("keydown",this.onKeyDown.bind(this));
      document.addEventListener("keyup",this.onKeyUp.bind(this));
      this._key_map = {
        38: 'up',
        40: 'down',
        37: 'left',
        39: 'right',
        32: 'space',
        16: 'shift',
      }
      var letters = 'abcdefghijklmnopqrstuvwxyz';
      this._action_map = {
        'up': 'rotate',
        'space': 'drop',
        'shift': 'swapPiece'
      }
      for (var i=0;i<letters.length;i++) {
        if (this._action_map[letters[i]]) { this._key_map[i+65] = letters[i]; }
      }
      this.action_up_map = {
        'space': 'lock',
      }
      this.action_map = {};
      for (var k in this._key_map) {
        var a = this._key_map[k];
        this.action_map[a] = this.game.act[this._action_map[a] || a];
        if (this.action_up_map[a]) {
          this.action_up_map[a] = this.game.act[this.action_up_map[a]];
        }
      }
      this.reset();
      this._autoplay = setInterval(function(that){
        var i = 0;
        return function() {
          if (that._events && that._events[i].time < new Date().valueOf()-that.start) {
            var event = new Event(that._events[i].type);
            event.keyCode = that._events[i].keyCode;
            document.dispatchEvent(event);
            i++;
            if (!that._events[i]) { clearInterval(that._autoplay) }
          }
        }
      }(this),50);
      if (this.game.DEBUG) { this.loadEvents(); }
    }

    saveEvents() {
      uR.storage.set("events/"+this.game.id,this.events);
    }

    loadEvents() {
      this._events = uR.storage.get("events/"+this.game.id);
    }

    record(e,type) {
      if (e.isTrusted && this._autoplay) { this._autoplay = clearTimeout(this._autoplay); }
      this.events.push({keyCode: e.keyCode,time:new Date().valueOf()-this.start,type:type});
      this.saveEvents();
    }

    reset() {
      this.active = {};
      this.events = [];
      this.start = new Date().valueOf();
      clearInterval(this._autoplay);
      // the comment lines on this and onKeyDown and onKeyDown are because it's better to not use the
      // browsers natural key repeat rate. may need to be added back in at some point.
      //for (key in this.timer) { clearTimeout(this.timer[key]) }
      //this.timer = {};
    }

    onKeyDown(e) {
      var event = this._key_map[e.keyCode];
      if (!event) { return; }
      this.active[event] = true;
      this.record(e,'keydown');
      this.action_map[event](e);
      //setTimeOut(function() { this.onKeyDown(e) },initialDelay);
    }

    onKeyUp(e) {
      var event = this._key_map[e.keyCode];
      if (!event) { return; }
      this.active[event] = false;
      this.action_up_map[event] && this.action_up_map[event](e);
      this.record(e,'keyup');
      //clearTimeout(this.timer[e.keyCode]);
    }
  }

  window.GAME = new Game();
})()
