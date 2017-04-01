(function() {
  var curPiece,X,Y,
      nTypes=7,
      squareSize=20,
      boardHeight=16,
      boardWidth =10,
      Level=1,
      speed0=700,
      speedK=60,
      speed=speed0-speedK*Level,
      nLines=0;

  // GLOBAL VARIABLES

  var skyline=boardHeight-1,
      serialN=0;

  var boardLoaded=1,
      timerID=null;
  // ARRAYS
  var f = new Array();
  for (i=0;i<20;i++) {
    f[i]=new Array();
    for (j=0;j<20;j++) {
      f[i][j]=0;
    }
  }
  window.f = f;

  var xToErase = [0,0,0,0];
  var yToErase = [0,0,0,0];

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
      for (var i=0;i<f.length;i++) {
        for (var j=0;j<f[i].length;j++) {
          var _f = f[i][j];
          var color = this.pallet[Math.abs(_f)];
          drawBox(this.ctx,j*squareSize,i*squareSize,(j+1)*squareSize,(i+1)*squareSize,color)
        }
      }
      this.ctx.drawImage(this.grid,0,0);
    }

    makeCanvas() {
      this.canvas = document.createElement("canvas");
      this.grid = document.createElement("img");
      this.canvas.width = this.grid.width = boardWidth*squareSize + 1;
      this.canvas.height = this.grid.height = boardHeight*squareSize + 1;
      this.ctx = this.canvas.getContext("2d");
      document.getElementById("debug").appendChild(this.canvas);
      //document.getElementById("debug").appendChild(this.grid);
      for (var i=0;i<=boardWidth;i++) {
        drawLine(this.ctx,i*squareSize,0,i*squareSize,this.canvas.height,this.pallet.border);
      }
      for (var i=0;i<=boardHeight;i++) {
        drawLine(this.ctx,0,i*squareSize,this.canvas.width,i*squareSize,this.pallet.border);
      }
      this.grid.src = this.canvas.toDataURL();
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    reset() {
      for (var i=0;i<boardHeight;i++) {
        for (var j=0;j<boardWidth;j++) {
          f[i][j]=0;
        }
      }
    }
    
    makeUI() {
    }
    
    removeLines() {
      for (var i=0;i<boardHeight;i++) {
        var gapFound=0;
        for (var j=0;j<boardWidth;j++) {
          if (f[i][j]==0) {gapFound=1;break;}
        }
        if (gapFound) continue; // gapFound in previous loop
        for (var k=i;k>=skyline;k--) {
          for (var j=0;j<boardWidth;j++) {
            f[k][j]=f[k-1][j]; //eliminate line by moving eveything down a line
          }
        }
        for (var j=0;j<boardWidth;j++) {
          f[0][j]=0; // set top to zero
        }
        nLines++;
        skyline++;
        document.getElementById("lines").innerHTML=nLines;
        if (nLines%5==0) {Level++; if(Level>10) Level=10;}
        speed=speed0-speedK*Level;
        var select = document.querySelector("[name=level]");
        select.selectedIndex=Level-1;
      }
    }

    drawPiece() {
      var p = this.game.piece;
      for (var k=0;k<this.game.n;k++) {
        X=p.curX+p.dx[k];
        Y=p.curY+p.dy[k];
        if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth && f[Y][X]!=-p.n) {
          f[Y][X]=-p.n;
        }
        X=xToErase[k];
        Y=yToErase[k];
      }
      this.draw();
    }

    erasePiece() {
      var p = this.game.piece;
      for (var k=0;k<this.game.n;k++) {
        X=p.curX+p.dx[k];
        Y=p.curY+p.dy[k];
        if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth) {
          xToErase[k]=X;
          yToErase[k]=Y;
          f[Y][X]=0;
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
    }
    reset() {
      this.started = this.paused = 0;
      nLines=0;
      serialN=0;
      skyline=boardHeight-1;
      clearTimeout(timerID);

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
      document.getElementById("lines").innerHTML=nLines;
      clearTimeout(timerID);
      timerID=setTimeout(this.nextTurn,speed);
    }
    pause() {
      if (this.paused) {this.nextTurn(); this.paused=0; return;}
      clearTimeout(timerID);
      this.paused=1;
    }

    nextTurn() {
      if (!this.act.down()) {
        this.getSkyline();
        this.board.removeLines();
        if (!skyline>0 || !this.getPiece()) {
          this.gameOver();
          return
        }
      }
      //this.board.draw();
      clearTimeout(timerID);
      timerID=setTimeout(this.nextTurn,speed);
    }

    getSkyline() {
      var p = this.piece;
      for (var k=0;k<this.n;k++) {
        X=p.curX+p.dx[k];
        Y=p.curY+p.dy[k];
        if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth) {
          f[Y][X] = p.n;
          if (Y<skyline) skyline=Y;
        }
      }
    }

    getPiece(N) {
      N = N || Math.floor(nTypes*Math.random()+1); // 0 is empty space
      //N = ((this.piece||{n: 0}).n)%nTypes+1; //uncomment this line to test pieces in order
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
          if (this.pieceFits(p.curX,p.curY+1)) {this.board.erasePiece(); p.curY++; this.board.drawPiece(); return 1; }
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
          clearTimeout(timerID);
          timerID=setTimeout(this.nextTurn,speed);
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
      Level=parseInt(select.value);
      speed=speed0-speedK*Level;
    }

    pieceFits(X,Y) {
      for (var k=0;k<this.n;k++) {
        var theX=X+this.piece.dx_[k];
        var theY=Y+this.piece.dy_[k];
        if (
          theX<0 || theX>=boardWidth || // square is contained in X
          theY>=boardHeight || // square is above bottom of board
          (theY>-1 && f[theY][theX]>0) // square is not occupied, if square is not above board
        ) return 0;
      }
      return 1;
    }
  }

  // keystroke processing

  initialDelay_=200;
  repeat_Delay_=20;

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
      this.action_map = {};
      for (var k in this._key_map) {
        var a = this._key_map[k];
        this.action_map[a] = this.game.act[this._action_map[a] || a];
      }
      this.reset();
    }
    reset() {
      this.active = {};
      //for (key in this.timer) { clearTimeout(this.timer[key]) }
      //this.timer = {};
    }
    onKeyDown(e) {
      var event = this._key_map[e.keyCode];
      if (!this.game.started || this.game.paused || !event) return;
      this.active[event] = true;
      this.action_map[event]();
      //setTimeOut(function() { this.onKeyDown(e) },initialDelay);
    }

    onKeyUp(e) {
      this.active[e.keyCode] = false;
      //clearTimeout(this.timer[e.keyCode]);
    }
  }

  window.GAME = new Game();
})()
