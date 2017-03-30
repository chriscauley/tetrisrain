(function() {
  var curPiece,X,Y,
      nSquares=4,
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

  var curX=1, curY=1,
      skyline=boardHeight-1,
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
  var dx = [0,0,0,0];
  var dy = [0,0,0,0];
  var dx_ = [0,0,0,0];
  var dy_ = [0,0,0,0];

  var dxBank = [
    [0, 1,-1, 0],
    [0, 1,-1,-1],
    [0, 1,-1, 1],
    [0,-1, 1, 0],
    [0, 1,-1, 0],
    [0, 1,-1,-2],
    [0, 1, 1, 0],
  ];

  var dyBank = [
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 1, 1],
  ];

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
        "#000099",
        "#0000FF",
        "#006666",
        "#006600",
        "#660066",
        "#990000",
      ];
      pallet.border = "#cccccc";
      pallet.bg = "white";
      pallet.fg = "#333";

      this.pallet = pallet;
      this.makeCanvas();
      this.game = game;
      this.imgs = [];
      for (var i=0;i<8;i++) {
        var img = document.createElement('img');
        img.src = `s${i}.gif`;
        this.imgs.push(img);
      }
      this.makeUI();
    }
    draw() {
      for (var i=0;i<f.length;i++) {
        for (var j=0;i<j.length;j++) {
          drawRect(this.ctx,i*squareSize,j*squareSize,(i+1)*squareSize,(j+1)*squareSize)
        }
      }
    }

    makeCanvas() {
      this.canvas = document.createElement("canvas");
      this.grid = document.createElement("img");
      this.canvas.width = this.grid.width = boardWidth*squareSize + 1;
      this.canvas.height = this.grid.height = boardHeight*squareSize + 1;
      this.ctx = this.canvas.getContext("2d");
      document.getElementById("debug").appendChild(this.canvas);
      document.getElementById("debug").appendChild(this.grid);
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
          document['s'+i+'_'+j].src="s0.gif";
        }
      }
    }
    
    makeUI() {
      var buf='<center>Level: <select name="level" onchange="getLevel();this.blur();">'
        +'<option value=1 selected>1'
        +'<option value=2>2'
        +'<option value=3>3'
        +'<option value=4>4'
        +'<option value=5>5'
        +'<option value=6>6'
        +'<option value=7>7'
        +'<option value=8>8'
        +'<option value=9>9'
        +'<option value=10>10'
        +'</select>'
        +'</nobr></font>'

        +'Lines: <span id="lines"></span>'

        +'<input type=button value="Start" onCLick="GAME.start()">'
        +'<input type=button value="Pause" onCLick="GAME.pause()">'

      buf+='<pre>';
      for (var i=0;i<boardHeight;i++) {
        for (var j=0;j<boardWidth;j++) {
          buf+='<img name="s'+i+'_'+j+'" src="s'+Math.abs(f[i][j])+'.gif" width=16 height=16 border=0>'; 
        }
        buf+='<img src="g.gif" width=1 height=16><br/>';
      }
      buf+='<img src="g.gif" width='+(boardWidth*16+1)+' height=1></pre></center>';
      document.getElementById("board").innerHTML=buf;
    }
    
    fillMatrix() {
      for (var k=0;k<nSquares;k++) {
        X=curX+dx[k];
        Y=curY+dy[k];
        if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth) {
          f[Y][X]=curPiece;
          if (Y<skyline) skyline=Y;
        }
      }
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
            console.log(f[k][j]);
            document['s'+k+'_'+j].src=this.imgs[f[k][j]].src;
          }
        }
        for (var j=0;j<boardWidth;j++) {
          f[0][j]=0;
          document['s'+0+'_'+j].src=this.imgs[0].src;
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
      for (var k=0;k<nSquares;k++) {
        X=curX+dx[k];
        Y=curY+dy[k];
        if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth && f[Y][X]!=-curPiece) {
          document['s'+Y+'_'+X].src=this.imgs[curPiece].src;
          f[Y][X]=-curPiece;
        }
        X=xToErase[k];
        Y=yToErase[k];
        if (f[Y][X]==0) document['s'+Y+'_'+X].src=this.imgs[0].src;
      }
    }

    erasePiece() {
      for (var k=0;k<nSquares;k++) {
        X=curX+dx[k];
        Y=curY+dy[k];
        if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth) {
          xToErase[k]=X;
          yToErase[k]=Y;
          f[Y][X]=0;
        }
      }
    }
  }

  class Game {
    constructor() {
      this.nextTurn = this.nextTurn.bind(this);
      this.controller = new Controller(this);
      this.board = new Board(this);
      this.reset();
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
        if (this.paused) { this.pause(); console.log('pause-start'); }
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
      if (!this.doDown()) {
        this.board.fillMatrix();
        this.board.removeLines();
        if (!skyline>0 || !this.getPiece()) {
          this.gameOver();
          return
        }
      }
      clearTimeout(timerID);
      timerID=setTimeout(this.nextTurn,speed);
    }
    getPiece(N) {
      curPiece=(N == undefined) ? Math.floor(nTypes*Math.random()):N; // this is still off, breaks with 0
      //curPiece = this.nextPiece++;
      curX=5;
      curY=0;
      for (var k=0;k<nSquares;k++) {
        dx[k]=dxBank[curPiece][k];
        dy[k]=dyBank[curPiece][k];
      }
      for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
      if (this.pieceFits(curX,curY)) { this.board.drawPiece(); return 1; }
      return 0;
    }

    gameOver() {
      this.reset();
    }

    doLeft() {
      for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
      if (this.pieceFits(curX-1,curY)) {this.board.erasePiece(); curX--; this.board.drawPiece();}
    }

    doRight() {
      for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
      if (this.pieceFits(curX+1,curY)) {this.board.erasePiece(); curX++; this.board.drawPiece();}
    }

    doDown() {
      for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
      if (this.pieceFits(curX,curY+1)) {this.board.erasePiece(); curY++; this.board.drawPiece(); return 1; }
      return 0;
    }

    doRotate() {
      for (var k=0;k<nSquares;k++) {dx_[k]=dy[k]; dy_[k]=-dx[k];}
      if (this.pieceFits(curX,curY)) {
        this.board.erasePiece();
        for (var k=0;k<nSquares;k++) {dx[k]=dx_[k]; dy[k]=dy_[k];}
        this.board.drawPiece();
      }
    }

    getGhost() {
      this.ghostY = curY;
      while (this.pieceFits(curX,this.ghostY+1)) { this.ghostY++; }
    }

    doFall() {
      for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
      if (!this.pieceFits(curX,curY+1)) return;
      this.board.erasePiece();
      this.getGhost();
      curY = this.ghostY;
      this.board.drawPiece();
      clearTimeout(timerID);
      timerID=setTimeout(this.nextTurn,speed);
    }

    getLevel() {
      var select = document.querySelector("[name=level]");
      Level=parseInt(select.value);
      speed=speed0-speedK*Level;
    }

    pieceFits(X,Y) {
      for (var k=0;k<nSquares;k++) {
        var theX=X+dx_[k];
        var theY=Y+dy_[k];
        if (theX<0 || theX>=boardWidth || theY>=boardHeight) return 0;
        if (theY>-1 && f[theY][theX]>0) return 0;
      }
      return 1;
    }
  }

  // keystroke processing

  initialDelay_=200;
  repeat_Delay_=20;

  activeL_=0; timerL_ = null;
  activeR_=0; timerR_ = null;
  activeU_=0; timerU_ = null;
  activeD_=0; timerD_ = null;
  activeSp=0; timerSp = null;

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
        'up': this.game.doRotate.bind(this.game),
        'left': this.game.doLeft.bind(this.game),
        'right': this.game.doRight.bind(this.game),
        'down': this.game.doDown.bind(this.game),
        'space': this.game.doFall.bind(this.game),
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
      this._action_map[event]();
      //setTimeOut(function() { this.onKeyDown(e) },initialDelay);
    }

    onKeyUp(e) {
      this.active[e.keyCode] = false;
      //clearTimeout(this.timer[e.keyCode]);
    }
  }
  initialDelay_=200;

  window.GAME = new Game();
})()
