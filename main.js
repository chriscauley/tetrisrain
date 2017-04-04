(function() {
  function drawLine(context,x1,y1,x2,y2,color) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x1+0.5,y1+0.5);
    context.lineTo(x2+0.5,y2+0.5);
    context.stroke();
  }

  class CanvasObject {
    constructor() {

    }
    drawBox(x1,y1,x2,y2,color,s) {
      if (!color) { return; } // do clearRect instead?
      s = s || this.scale;
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x1*s,y1*s,x2*s,y2*s);
    }
  }

  // IMAGES
  class Board extends CanvasObject {
    constructor(game) {
      super();
      this.game = game;
      this.scale = this.game.scale;
      this.height = 66;
      this.width = game.config.board_width;
      this.skyline = this.height-1;
      // pallet should be a constructor option
      var pallet = [
        undefined, // empty
        "#000099", // t
        "#0000FF", // q
        "#006666", // p
        "#006600", // z
        "#660066", // s
        "#990000", // l
        "#CC0099", // o
      ];
      pallet.border = "#cccccc";
      pallet.bg = "white";
      pallet.fg = "#333";

      this.pallet = pallet;
      this.makeCanvas();
      this.makeUI();
      this._draw = this._draw.bind(this);
      this.draw();
    }

    draw() {
      cancelAnimationFrame(this._frame);
      this._frame = requestAnimationFrame(this._draw);
    }

    _draw() {
      // ghost stuff may not go here
      this.game.getGhost();

      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      var color;

      // draw ghost
      this.ctx.globalAlpha = 0.5;
      var p = this.game.piece;
      var color = this.pallet[p.n];
      uR.forEach(p.dx,function(_,j) {
        this.drawBox(p.curX+p.dx[j],this.game.ghostY+p.dy[j],1,1,color);
      }.bind(this));
      this.ctx.globalAlpha = 1;

      // draw all pieces
      for (var i=0;i<this.f.length;i++) {
        for (var j=0;j<this.f[i].length;j++) {
          var _f = this.f[i][j];
          if (!_f) { continue; }
          var color = this.pallet[Math.abs(_f)];
          this.drawBox(j,i,1,1,color);
        }
      }
      this.game.draw();
    }

    makeCanvas() {
      this.canvas = document.createElement("canvas");
      this.canvas.id = "board";
      this.grid = document.createElement("img");
      this.canvas.width = this.grid.width = this.width*this.scale + 1;
      this.canvas.height = this.grid.height = this.height*this.scale + 1;
      this.ctx = this.canvas.getContext("2d");
      this.small_canvas = document.createElement("canvas");
      this.small_canvas.width = 4*this.scale+1;
      this.small_canvas.height = 2*this.scale+1;
      this.small_ctx = this.small_canvas.getContext("2d");

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
      this.imgs = {}
      uR.forEach(this.game.pieces_xyr,function(p,n) {
        if (!p) { return }
        var dx = p[0];
        var dy = p[1];
        this.ctx.clearRect(0,0,this.small_canvas.width,this.small_canvas.height)
        uR.forEach(dx,function(_,i) {
          this.drawBox(2+dx[i],dy[i],1,1,this.pallet[n])
        }.bind(this));
        var img = document.createElement("img");
        this.small_ctx.clearRect(0,0,this.small_canvas.width,this.small_canvas.height)
        this.small_ctx.drawImage(
          this.canvas,
          0,0,this.small_canvas.width,this.small_canvas.height,
          0,0,this.small_canvas.width,this.small_canvas.height
        )
        img.src = this.small_canvas.toDataURL();
        this.imgs[n] = img
      }.bind(this));
    }

    reset() {
      this.skyline=this.height-1;
      this.f = new Array();
      for (var i=0;i<this.height;i++) {
        this.f[i]=new Array();
        for (var j=0;j<20;j++) { this.f[i][j]=0; }
      }
    }

    makeUI() {
      riot.mount('level-editor');
    }

    removeLines() {
      var lines_scored = 0;
      for (var i=0;i<this.height;i++) {
        var gapFound=0;
        for (var j=0;j<this.width;j++) {
          if (this.f[i][j]==0) { gapFound=1; break; }
        }
        if (gapFound) continue; // gapFound in previous loop
        for (var k=i;k>=this.skyline;k--) {
          for (var j=0;j<this.width;j++) {
            this.f[k][j]=this.f[k-1][j]; //eliminate line by moving eveything down a line
          }
        }
        for (var j=0;j<this.width;j++) {
          this.f[0][j]=0; // set top to zero
        }
        lines_scored ++;
        this.skyline++;
      }
      this.game.scoreLines(lines_scored);
    }

    drawPiece() {
      var p = this.game.piece;
      for (var k=0;k<this.game.n;k++) {
        var X=p.curX+p.dx[k];
        var Y=p.curY+p.dy[k];
        if (0<=Y && Y<this.height && 0<=X && X<this.width && this.f[Y][X]!=-p.n) {
          this.f[Y][X]=-p.n;
        }
      }
      this.draw();
    }

    erasePiece() {
      var p = this.game.piece;
      for (var k=0;k<this.game.n;k++) {
        var X=p.curX+p.dx[k];
        var Y=p.curY+p.dy[k];
        if (0<=Y && Y<this.height && 0<=X && X<this.width) {
          this.f[Y][X]=0;
        }
      }
      this.draw();
    }
  }

  class Game extends CanvasObject {
    constructor() {
      super();
      this.makeVars();
      this.makeCanvas();
      this.nextTurn = this.nextTurn.bind(this);
      this.makeActions();
      this.controller = new Controller(this);
      this.board = new Board(this);
      this.reset();
      this.start();
    }

    draw() {
      this.ctx.save();
      this.ctx.translate(this.x_margin,this.y_margin);
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      var top = (this.board.skyline-this.config.visible_height-this.config.b_level)*this.board.scale;
      top = Math.min((this.board.height-this.config.visible_height)*this.board.scale,top)
      top = Math.max(top,0)
      this.ctx.drawImage(
        this.board.canvas,
        0,top, // sx, sy,
        this.canvas.width,this.canvas.height, // sWidth, sHeight,
        0,0, // dx, dy,
        this.canvas.width,this.canvas.height // dWidth, dHeight
      )
      this.ctx.drawImage(this.board.grid,0,0);
      this.drawBox(
        0,this.config.visible_height*this.board.scale,
        this.board.canvas.width,this.canvas.height,
        "rgba(0,0,0,0.25)",
        1 // scale of 1
      )
      var floor = this.board.height-top/this.scale;
      this.drawBox(
        0, floor,
        this.board.canvas.width/this.scale,2,
        "brown"
      )
      var s = 0.75;
      var y_offset = 0;
      var img = this.board.imgs[this.pieces[this.piece_number]];
      var x_offset = this.scale;
      this.ctx.drawImage(
        img,
        this.board.canvas.width+x_offset, y_offset,
        img.width,img.height
      )
      y_offset += img.height+this.scale;
      for (var i=0;i<this.config.n_preview;i++) {
        img = this.board.imgs[this.pieces[this.piece_number+i+1]];
        var x_offset = this.scale+img.width*(1-s)/2;
        this.ctx.drawImage(
          img,
          this.board.canvas.width+x_offset, y_offset,
          img.width*s,img.height*s
        )
        y_offset += img.height*s+this.scale;
      }
      this.ctx.restore()
    }

    makeCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = "game_canvas";
      var game_container = document.getElementById("game");
      this.canvas.height = game_container.scrollHeight;
      this.canvas.width = game_container.scrollWidth;
      this.ctx = this.canvas.getContext("2d");
      game_container.appendChild(this.canvas);
    }

    makeVars() {
      this.scale = 20,
      this.config = {
        b_level: -8,
        game_width: 10,
        board_width: 10,
        visible_height: 20,
        n_preview: 5,
      }
      this.x_margin = 100;
      this.y_margin = 20;
      this.pieces = [2,3,2,3,2,3,2,3,7,7,7,7,6,6,6,6];
      this.nextPiece = 0;
      this.level=1;
      this.speed = this.speed0=700;
      this.speedK=60;

      this.n = 4; // Number of squares... it's tetris!
      this.started=1;
      this.paused=0;
      this.pieces_xyr = [
        undefined, // empty
        [[0, 1,-1, 0],[0, 0, 0, 1],4], // t
        [[0, 1,-1,-1],[0, 0, 0, 1],4], // q
        [[0, 1,-1, 1],[0, 0, 0, 1],4], // p
        [[0,-1, 1, 0],[0, 0, 1, 1],2], // z
        [[0, 1,-1, 0],[0, 0, 1, 1],2], // s
        [[0, 1,-1,-2],[0, 0, 0, 0],2], // l
        [[0, 1, 1, 0],[0, 0, 1, 1],1], // o
      ];
      this.n_types = this.pieces_xyr.length - 1;
      this.turns = [];
    }

    reset() {
      this.paused = 0;
      this.piece = undefined;
      this.makeVars();
      this.score = {lines: 0};
      clearTimeout(this.timeout);
      this.piece_number = 0;

      document.getElementById("lines").innerHTML = 0;
      this.controller.reset();
      this.board.reset();
      this.getPiece();
    }

    start() {
      if (this.started) {
        //if (!boardLoaded) return;
        if (this.paused) { this.pause(); }
        return;
      }
      this.getPiece();
      this.board.drawPiece();
      document.getElementById("lines").innerHTML=this.score.lines;
      clearTimeout(this.timeout);
      this.timeout=setTimeout(this.nextTurn,this.speed);
    }

    pause() {
      if (this.paused) { this.nextTurn(); this.paused=0; return;}
      clearTimeout(this.timeout);
      this.paused=1;
    }

    nextTurn() {
      if (!this.act.down()) {
        this.getSkyline();
        this.board.removeLines();
        this.turns.push({
          n: this.piece.n,
          x: this.piece.curX,
          y: this.piece.curY,
        });
        if (this.board.skyline<=0 || !this.getPiece()) {
          this.gameOver();
          return
        }
      }
      clearTimeout(this.timeout);
      this.timeout=setTimeout(this.nextTurn,this.speed);
    }

    saveGame(name) {
      var j;
      for (var i =0;i<this.board.f.length;i++) {
        for (j=0;j<this.board.f[i].length;j++) { if (this.board.f[i][j]>0) break }
        if (this.board.f[i][j]) { break }
      }
      uR.storage.set(name,this.board.f.slice(i))
    }

    loadGame(name,reset) {
      if (reset === undefined) { reset = true; }
      reset && this.reset();
      var _f = uR.storage.get(name);
      uR.forEach(_f,function(line,i) {
        this.board.f[1+i+this.board.skyline-_f.length] = line;
      }.bind(this));
      this.getSkyline();
      this.nextTurn();
    }

    getSkyline() {
      // this should all be cleaned up a bit.
      var p = this.piece;
      for (var k=0;k<this.n;k++) {
        var X=p.curX+p.dx[k];
        var Y=p.curY+p.dy[k];
        if (0<=Y && Y<this.board.height && 0<=X && X<this.board.width) {
          this.board.f[Y][X] = p.n;
          if (Y<this.board.skyline) {
            this.board.skyline=Y;
            this.board.floor=this.board.height-Y;
          }
        }
      }
    }

    getPiece(N) {
      if (!N) {
        while (this.pieces.length <= this.piece_number+this.config.n_preview+1) {
          this.pieces.push(Math.floor(this.n_types*Math.random()+1));
        }
        N = this.pieces[this.piece_number];
        this.piece_number++;
      }
      //N = ((this.piece||{n: 0}).n)%this.n_types+1; //uncomment this line to test pieces in order
      this.piece = {
        n: N,
        curX: 5,
        curY: Math.max(this.board.skyline + this.config.b_level,0),
        dx: this.pieces_xyr[N][0].slice(),
        dy: this.pieces_xyr[N][1].slice(),
        dx_: this.pieces_xyr[N][0].slice(),
        dy_: this.pieces_xyr[N][1].slice(),
        n_rotations: 0,
        allowed_rotations: this.pieces_xyr[N][2],
      };
      if (this.pieceFits(this.piece.curX,this.piece.curY)) { this.board.drawPiece(); return true; }
    }

    gameOver() {
      this.reset();
    }

    makeActions() {
      this.act = {
        left: function() {
          var p = this.piece;
          for (var k=0;k<this.n;k++) {p.dx_[k]=p.dx[k]; p.dy_[k]=p.dy[k];}
          if (this.pieceFits(p.curX-1,p.curY)) {this.board.erasePiece(); p.curX--; this.board.drawPiece();}
        },

        right: function() {
          var p = this.piece;
          for (var k=0;k<this.n;k++) {p.dx_[k]=p.dx[k]; p.dy_[k]=p.dy[k];}
          if (this.pieceFits(p.curX+1,p.curY)) {this.board.erasePiece(); p.curX++; this.board.drawPiece();}
        },

        down: function(e) {
          var p = this.piece;
          for (var k=0;k<this.n;k++) {p.dx_[k]=p.dx[k]; p.dy_[k]=p.dy[k];}
          if (this.pieceFits(p.curX,p.curY+1)) {
            this.board.erasePiece(); p.curY++; this.board.drawPiece(); return 1;
          }
          return 0;
        },

        rotate: function(e) {
          e.preventDefault();
          var p = this.piece;
          if (!p.allowed_rotations) { return }
          p.n_rotations++;
          if (p.n_rotations%p.allowed_rotations == 0) {
            // t, s, z, and o pieces don't have only 2 rotations allowed. reset to original
            p.dx_ = this.pieces_xyr[p.n][0].slice();
            p.dy_ = this.pieces_xyr[p.n][1].slice();
          } else {
            for (var k=0;k<this.n;k++) {p.dx_[k]=p.dy[k]; p.dy_[k]=-p.dx[k];}
          }
          if (this.pieceFits(p.curX,p.curY)) {
            this.board.erasePiece();
            for (var k=0;k<this.n;k++) {p.dx[k]=p.dx_[k]; p.dy[k]=p.dy_[k];}
            this.board.drawPiece();
          }
        },

        drop: function(e) {
          e.preventDefault();
          var p = this.piece;
          for (var k=0;k<this.n;k++) {p.dx_[k]=p.dx[k]; p.dy_[k]=p.dy[k];}
          if (!this.pieceFits(p.curX,p.curY+1)) return;
          this.board.erasePiece();
          p.curY = this.ghostY;
          this.board.drawPiece();
          clearTimeout(this.timeout);
          this.timeout=setTimeout(this.nextTurn,this.speed);
        },
        lock: function() {
          this.nextTurn();
        },
        pause: this.pause.bind(this),
        swapPiece: function() {
          if (this.last_swap == this.piece_number) { return }
          this.last_swap = this.piece_number;
          var old_piece = this.swapped_piece;
          this.board.erasePiece();
          this.swapped_piece = this.piece.n;
          this.piece = undefined;
          this.getPiece(old_piece);
          this.ctx.clearRect(0,this.y_margin,this.x_margin,this.x_margin);
          this.ctx.drawImage(this.board.imgs[this.swapped_piece],0,this.y_margin);
        }
      }
      for (var k in this.act) { this.act[k] = this.act[k].bind(this); }
    }

    getGhost() {
      if (! this.piece) { return; }
      this.ghostY = this.piece.curY;
      while (this.pieceFits(this.piece.curX,this.ghostY+1)) { this.ghostY++; }
    }

    scoreLines(lines) {
      this.score.lines+= lines;
      document.getElementById("lines").innerHTML=this.score.lines;
      this.level = Math.floor(this.score.lines / 10);
      this.speed=this.speed0-this.speedK*(this.level-1);
    }

    pieceFits(X,Y) {
      for (var k=0;k<this.n;k++) {
        var theX=X+this.piece.dx_[k];
        var theY=Y+this.piece.dy_[k];
        if (
          theX<0 || theX>=this.board.width || // square is contained in X
          theY>=this.board.height || // square is above bottom of board
          (theY>-1 && this.board.f[theY][theX]>0) // square is not occupied, if square is not above board
        ) return 0;
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
        'p': 'pause',
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
    }
    reset() {
      this.active = {};
      // the comment lines on this and onKeyDown and onKeyDown are because it's better to not use the
      // browsers natural key repeat rate. may need to be added back in at some point.
      //for (key in this.timer) { clearTimeout(this.timer[key]) }
      //this.timer = {};
    }
    onKeyDown(e) {
      var event = this._key_map[e.keyCode];
      if (!this.game.started || (this.game.paused && event != 'p') || !event) { return; }
      this.active[event] = true;
      this.action_map[event](e);
      //setTimeOut(function() { this.onKeyDown(e) },initialDelay);
    }

    onKeyUp(e) {
      var event = this._key_map[e.keyCode];
      if (!this.game.started || (this.game.paused && event != 'p') || !event) { return; }
      this.active[event] = false;
      this.action_up_map[event] && this.action_up_map[event](e);
      //clearTimeout(this.timer[e.keyCode]);
    }
  }

  window.GAME = new Game();
})()
