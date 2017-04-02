(function() {
  // GLOBAL VARIABLES

  // ARRAYS

  function drawLine(context,x1,y1,x2,y2,color) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x1+0.5,y1+0.5);
    context.lineTo(x2+0.5,y2+0.5);
    context.stroke();
  }

  function drawBox(context,x1,y1,x2,y2,color) {
    context.fillStyle = color;
    context.fillRect(x1,y1,x2,y2);
  }
  
  // IMAGES
  class Board {
    constructor(game) {
      this.scale = 20;
      this.height=16,
      this.width =10,
      this.skyline=this.height-1;
      // pallet should be a constructor option
      var pallet = [
        "white", // empty
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
      this.game = game;
      this.makeUI();
      this._draw = this._draw.bind(this);
      this.draw();
    }

    draw() {
      cancelAnimationFrame(this._frame);
      this._frame = requestAnimationFrame(this._draw);
    }
    _draw() {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      var color;
      for (var i=0;i<this.f.length;i++) {
        for (var j=0;j<this.f[i].length;j++) {
          var _f = this.f[i][j];
          var color = this.pallet[Math.abs(_f)];
          drawBox(this.ctx,j*this.scale,i*this.scale,(j+1)*this.scale,(i+1)*this.scale,color)
        }
      }
      this.ctx.drawImage(this.grid,0,0);
    }

    makeCanvas() {
      this.canvas = document.createElement("canvas");
      this.grid = document.createElement("img");
      this.canvas.width = this.grid.width = this.width*this.scale + 1;
      this.canvas.height = this.grid.height = this.height*this.scale + 1;
      this.ctx = this.canvas.getContext("2d");
      document.getElementById("debug").appendChild(this.canvas);
      //document.getElementById("debug").appendChild(this.grid);
      for (var i=0;i<=this.width;i++) {
        drawLine(this.ctx,i*this.scale,0,i*this.scale,this.canvas.height,this.pallet.border);
      }
      for (var i=0;i<=this.height;i++) {
        drawLine(this.ctx,0,i*this.scale,this.canvas.width,i*this.scale,this.pallet.border);
      }
      this.grid.src = this.canvas.toDataURL();
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    reset() {
      this.skyline=this.height-1;
      this.f = new Array();
      for (var i=0;i<20;i++) {
        this.f[i]=new Array();
        for (var j=0;j<20;j++) { this.f[i][j]=0; }
      }
    }
    
    makeUI() {
    }
    
    removeLines() {
      var lines_scored = 0;
      for (var i=0;i<this.height;i++) {
        var gapFound=0;
        for (var j=0;j<this.width;j++) {
          if (this.f[i][j]==0) {gapFound=1;break;}
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

  class Game {
    constructor() {
      this.makeVars();
      this.nextTurn = this.nextTurn.bind(this);
      this.makeActions();
      this.controller = new Controller(this);
      this.board = new Board(this);
      this.reset();
    }
    makeVars() {
      this.level=1;
      this.speed = this.speed0=700;
      this.speedK=60;

      this.n = 4; // Number of squares... it's tetris!
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
    }
    reset() {
      this.started = this.paused = 0;
      this.score = {lines: 0};
      clearTimeout(this.timeout);

      document.getElementById("lines").innerHTML = 0;
      this.controller.reset();
      this.board.reset();
    }

    start() {
      if (this.started) {
        //if (!boardLoaded) return;
        if (this.paused) { this.pause(); }
        return;
      }
      this.nextPiece = 0;
      this.getPiece();
      this.board.drawPiece();
      this.started=1;
      this.paused=0;
      document.getElementById("lines").innerHTML=this.score.lines;
      clearTimeout(this.timeout);
      this.timeout=setTimeout(this.nextTurn,this.speed);
    }
    pause() {
      if (this.paused) {this.nextTurn(); this.paused=0; return;}
      clearTimeout(this.timeout);
      this.paused=1;
    }

    nextTurn() {
      if (!this.act.down()) {
        this.getSkyline();
        this.board.removeLines();
        if (!this.board.skyline>0 || !this.getPiece()) {
          this.gameOver();
          return
        }
      }
      //this.board.draw();
      clearTimeout(this.timeout);
      this.timeout=setTimeout(this.nextTurn,this.speed);
    }

    getSkyline() {
      var p = this.piece;
      for (var k=0;k<this.n;k++) {
        var X=p.curX+p.dx[k];
        var Y=p.curY+p.dy[k];
        if (0<=Y && Y<this.board.height && 0<=X && X<this.board.width) {
          this.board.f[Y][X] = p.n;
          if (Y<this.board.skyline) this.board.skyline=Y;
        }
      }
    }

    getPiece(N) {
      N = N || Math.floor(this.n_types*Math.random()+1); // 0 is empty space
      //N = ((this.piece||{n: 0}).n)%this.n_types+1; //uncomment this line to test pieces in order
      this.piece = {
        n: N,
        curX: 5,
        curY: 0,
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

        down: function() {
          var p = this.piece;
          for (var k=0;k<this.n;k++) {p.dx_[k]=p.dx[k]; p.dy_[k]=p.dy[k];}
          if (this.pieceFits(p.curX,p.curY+1)) {
            this.board.erasePiece(); p.curY++; this.board.drawPiece(); return 1;
          }
          return 0;
        },

        rotate: function() {
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

        drop: function() {
          var p = this.piece;
          for (var k=0;k<this.n;k++) {p.dx_[k]=p.dx[k]; p.dy_[k]=p.dy[k];}
          if (!this.pieceFits(p.curX,p.curY+1)) return;
          this.board.erasePiece();
          this.getGhost();
          p.curY = this.ghostY;
          this.board.drawPiece();
          clearTimeout(this.timeout);
          this.timeout=setTimeout(this.nextTurn,this.speed);
        },
        lock: function() {
          this.nextTurn();
        }
      }
      for (var k in this.act) { this.act[k] = this.act[k].bind(this); }
    }

    getGhost() {
      this.ghostY = this.piece.curY;
      while (this.pieceFits(this.piece.curX,this.ghostY+1)) { this.ghostY++; }
    }

    getLevel() {
      var select = document.querySelector("[name=level]");
      this.level=parseInt(select.value);
      this.scoreLines(0);
    }

    scoreLines(lines) {
      this.score.lines+= lines;
      document.getElementById("lines").innerHTML=this.score.lines;
      this.level = Math.floor(this.score.lines / 10);
      this.speed=this.speed0-this.speedK*(this.level-1);
      document.querySelector("[name=level]").value=this.level-1;
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
        '38': 'up',
        '40': 'down',
        '37': 'left',
        '39': 'right',
        '32': 'space',
      }
      this._action_map = {
        'up': 'rotate',
        'space': 'drop',
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
      if (!this.game.started || this.game.paused || !event) { return; }
      this.active[event] = true;
      this.action_map[event](e);
      //setTimeOut(function() { this.onKeyDown(e) },initialDelay);
    }

    onKeyUp(e) {
      var event = this._key_map[e.keyCode];
      if (!this.game.started || this.game.paused || !event) { return; }
      this.active[event] = false;
      this.action_up_map[event] && this.action_up_map[event](e);
      //clearTimeout(this.timer[e.keyCode]);
    }
  }

  window.GAME = new Game();
})()
