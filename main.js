//(function() {
  // PARAMETERS

  nSquares=4;
  nTypes=7;
  boardHeight=16;
  boardWidth =10;
  Level=1;
  speed0=700;
  speedK=60;
  speed=speed0-speedK*Level;
  nLines=0;

  // GLOBAL VARIABLES

  curX=1; curY=1;
  skyline=boardHeight-1;
  serialN=0;

  boardLoaded=1;
  timerID=null;
// IMAGES
var imgs = [];
for (var i=0;i<8;i++) {
  var img = document.createElement('img');
  img.src = `s${i}.gif`;
  imgs.push(img);
}

  // ARRAYS

  f = new Array();
  for (i=0;i<20;i++) {
    f[i]=new Array();
    for (j=0;j<20;j++) {
      f[i][j]=0;
    }
  }

  xToErase =new Array(0,0,0,0);     yToErase =new Array(0,0,0,0);
  dx       =new Array(0,0,0,0);     dy       =new Array(0,0,0,0);
  dx_      =new Array(0,0,0,0);     dy_      =new Array(0,0,0,0);
  dxBank   =new Array();            dyBank   =new Array();
  dxBank[1]=new Array(0, 1,-1, 0);  dyBank[1]=new Array(0, 0, 0, 1);
  dxBank[2]=new Array(0, 1,-1,-1);  dyBank[2]=new Array(0, 0, 0, 1);
  dxBank[3]=new Array(0, 1,-1, 1);  dyBank[3]=new Array(0, 0, 0, 1);
  dxBank[4]=new Array(0,-1, 1, 0);  dyBank[4]=new Array(0, 0, 1, 1);
  dxBank[5]=new Array(0, 1,-1, 0);  dyBank[5]=new Array(0, 0, 1, 1);
  dxBank[6]=new Array(0, 1,-1,-2);  dyBank[6]=new Array(0, 0, 0, 0);
  dxBank[7]=new Array(0, 1, 1, 0);  dyBank[7]=new Array(0, 0, 1, 1);


  // FUNCTIONS
class Game {
  constructor() {
    this.controller = new Controller(this);
  }
  reset() {
    for (var i=0;i<boardHeight;i++) {
      for (var j=0;j<boardWidth;j++) {
        f[i][j]=0;
        document['s'+i+'_'+j].src="s0.gif";
      }
    }
    this.started = this.paused = 0;
    nLines=0;
    serialN=0;
    skyline=boardHeight-1;

    document.form1.Lines.value=nLines;
  }

  start() {
    if (this.started) {
      //if (!boardLoaded) return;
      if (this.paused) resume();
      return;
    }
    getPiece();
    drawPiece();
    this.started=1;
    this.paused=0;
    document.form1.Lines.value=nLines;
    timerID=setTimeout(this.play.bind(this),speed);
  }
  pause() {
    if (boardLoaded && this.started) {
      if (this.paused) {resume(); return;}
      clearTimeout(timerID)
      this.paused=1;
    }
  }

  resume() {
    if (boardLoaded && this.started && this.paused) {
      this.play();
      this.paused=0;
    }
  }

  play() {
    if (movedown()) { timerID=setTimeout(this.play.bind(this),speed); return; }
    else {
      fillMatrix();
      removeLines();
      if (skyline>0 && getPiece()) { timerID=setTimeout(this.play.bind(this),speed); return; }
      else {
        activeL_=0;  activeU_=0;
        activeR_=0;  activeD_=0;
        this.gameOver();
      }
    }
  }
  gameOver() {
    self.init();
  }
}


  function fillMatrix() {
    for (var k=0;k<nSquares;k++) {
      X=curX+dx[k];
      Y=curY+dy[k];
      if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth) {
        f[Y][X]=curPiece;
        if (Y<skyline) skyline=Y;
      }
    }
  }

  function removeLines() {
    for (var i=0;i<boardHeight;i++) {
      gapFound=0;
      for (var j=0;j<boardWidth;j++) {
        if (f[i][j]==0) {gapFound=1;break;}
      }
      if (gapFound) continue;
      for (var k=i;k>=skyline;k--) {
        for (var j=0;j<boardWidth;j++) {
          f[k][j]=f[k-1][j];
          document['s'+k+'_'+j].src=imgs[f[k][j]].src;
        }
      }
      for (var j=0;j<boardWidth;j++) {
        f[0][j]=0;
        document['s'+0+'_'+j].src=img[0].src;
      }
      nLines++;
      skyline++;
      document.form1.Lines.value=nLines;
      if (nLines%5==0) {Level++; if(Level>10) Level=10;}
      speed=speed0-speedK*Level;
      document.form1.s1.selectedIndex=Level-1;
    }
  }

  function getLevel() {
    Level=parseInt(document.form1.s1.options[document.form1.s1.selectedIndex].value);
    speed=speed0-speedK*Level;
  }

  function drawPiece() {
    if (document.images && boardLoaded) {
      for (var k=0;k<nSquares;k++) {
        X=curX+dx[k];
        Y=curY+dy[k];
        if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth && f[Y][X]!=-curPiece) {
          document['s'+Y+'_'+X].src=imgs[curPiece].src;
          f[Y][X]=-curPiece;
        }
        X=xToErase[k];
        Y=yToErase[k];
        if (f[Y][X]==0) document['s'+Y+'_'+X].src=imgs[0].src;
      }
    }
  }
  
  function erasePiece() {
    if (document.images && boardLoaded) {
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

  function pieceFits(X,Y) {
    for (var k=0;k<nSquares;k++) {
      theX=X+dx_[k];
      theY=Y+dy_[k];
      if (theX<0 || theX>=boardWidth || theY>=boardHeight) return 0;
      if (theY>-1 && f[theY][theX]>0) return 0;
    }
    return 1;
  }

  function moveleft() {
    for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
    if (pieceFits(curX-1,curY)) {erasePiece(); curX--; drawPiece();}
  }

  function moveright() {
    for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
    if (pieceFits(curX+1,curY)) {erasePiece(); curX++; drawPiece();}
  }

  function rotate() {
    for (var k=0;k<nSquares;k++) {dx_[k]=dy[k]; dy_[k]=-dx[k];}
    if (pieceFits(curX,curY)) {
      erasePiece(); 
      for (var k=0;k<nSquares;k++) {dx[k]=dx_[k]; dy[k]=dy_[k];}
      drawPiece();
    }
  }

  function movedown() {
    for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
    if (pieceFits(curX,curY+1)) {erasePiece(); curY++; drawPiece(); return 1; }
    return 0;
  }

  function fall() {
    for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
    if (!pieceFits(curX,curY+1)) return;
    clearTimeout(timerID);
    erasePiece();
    while (pieceFits(curX,curY+1)) curY++;
    drawPiece();
    timerID=setTimeout(GAME.play(),speed);
  }

  function getPiece(N) {
    curPiece=(getPiece.arguments.length==0) ? 1+Math.floor(nTypes*Math.random()):N;
    curX=5;
    curY=0;
    for (var k=0;k<nSquares;k++) {
      dx[k]=dxBank[curPiece][k]; 
      dy[k]=dyBank[curPiece][k];
    }
    for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
    if (pieceFits(curX,curY)) { drawPiece(); return 1; }
    return 0;
  }

  // mouse clicks processing

  function getMinMax() {
    xMax=curX; 
    xMin=curX; 
    yMax=curY;
    for (var k=1;k<nSquares;k++) {
      if (curX+dx[k]>xMax) xMax=curX+dx[k];
      if (curX+dx[k]<xMin) xMin=curX+dx[k];
      if (curY+dy[k]>yMax) yMax=curY+dy[k];
    }
  }

  function clk(yClk,xClk) {
    if (!this.started || !boardLoaded) return;
    if (this.paused) resume();
    getMinMax();
    if (yClk>yMax) {movedown(); return;}
    if (xClk<xMin) {moveleft(); return;}
    if (xClk>xMax) {moveright(); return;}
    rotate(); return;
  }

  // onresize=function(){if(navigator.appName=="Netscape" && parseInt(navigator.appVersion)==4)setTimeout("f1.location=''+f1.location",150);}


  // keystroke processing

  initialDelay_=200;
  repeat_Delay_=20;

  activeL_=0; timerL_ = null;
  activeR_=0; timerR_ = null;
  activeU_=0; timerU_ = null;
  activeD_=0; timerD_ = null;
  activeSp=0; timerSp = null;

  LeftNN_ =' 52 ';
  RightNN_=' 54 ';
  UpNN_   =' 56 53 ';
  DownNN_ =' 50 ';
  SpaceNN_=' 32 ';

  LeftIE_ =' 37 52 100 ';
  RightIE_=' 39 54 102 ';
  UpIE_   =' 38 56 53 104 101 ';
  DownIE_ =' 40 50 98 ';
  SpaceIE_=' 32 ';

class Controller {
  constructor(game) {
    this.game = game;
    document.addEventListener("keydown",this.down.bind(this));
    document.addEventListener("keyup",this.up.bind(this));
  }
  down(e) {
    var KeyNN_=0;
    var KeyIE_=0;
    var evt = e ? e:event;
    KeyNN_=evt.keyCode;
    KeyIE_=evt.keyCode;

    if (!this.game.started || this.game.paused) return;

    //self.status='KeyNN_='+KeyNN_+', KeyIE_='+KeyIE_;
    //alert('KeyNN_='+KeyNN_+', KeyIE_='+KeyIE_);

    if (!activeL_ && ( LeftNN_.indexOf(' '+KeyNN_+' ')!=-1  
                       || LeftIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
    {
      activeL_ = 1;
      activeR_ = 0;
      moveleft();
      timerL_=setTimeout("slideL_()",initialDelay_);
    }

    if (!activeR_ && (RightNN_.indexOf(' '+KeyNN_+' ')!=-1 
                      || RightIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
    {
      activeR_ = 1;
      activeL_ = 0;
      moveright();
      timerR_=setTimeout("slideR_()",initialDelay_);
    }

    if (!activeU_ && (UpNN_.indexOf(' '+KeyNN_+' ')!=-1
                      || UpIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
    {
      activeU_ = 1;
      activeD_ = 0;
      rotate();
    }

    if (!activeSp && (SpaceNN_.indexOf(' '+KeyNN_+' ')!=-1
                      || SpaceIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
    {
      activeSp = 1;
      activeD_ = 0;
      fall();
    }

    if (!activeD_ && (DownNN_.indexOf(' '+KeyNN_+' ')!=-1
                      || DownIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
    {
      activeD_ = 1
      activeU_ = 0
      movedown();
      timerD_=setTimeout("slideD_()",initialDelay_);
    }
  }

  up(e) {
    var KeyNN_=0;
    var KeyIE_=0;

    var evt = e?e:event;
    //alert('evt.keyCode='+evt.keyCode);

    KeyNN_=evt.keyCode;
    KeyIE_=evt.keyCode;

    if (LeftNN_.indexOf(' '+KeyNN_+' ')!=-1  || LeftIE_.indexOf(' '+KeyIE_+' ')!=-1)  {activeL_=0; clearTimeout(timerL_)}
    if (RightNN_.indexOf(' '+KeyNN_+' ')!=-1 || RightIE_.indexOf(' '+KeyIE_+' ')!=-1) {activeR_=0; clearTimeout(timerR_)}
    if (UpNN_.indexOf(' '+KeyNN_+' ')!=-1    || UpIE_.indexOf(' '+KeyIE_+' ')!=-1)    {activeU_=0; clearTimeout(timerU_)}
    if (DownNN_.indexOf(' '+KeyNN_+' ')!=-1  || DownIE_.indexOf(' '+KeyIE_+' ')!=-1)  {activeD_=0; clearTimeout(timerD_)}
    if (SpaceNN_.indexOf(' '+KeyNN_+' ')!=-1 || SpaceIE_.indexOf(' '+KeyIE_+' ')!=-1) {activeSp=0; clearTimeout(timerSp)}

  }
}

  function slideL_() {
    if (activeL_) {
      moveleft();
      timerL_=setTimeout("slideL_()",repeat_Delay_);
    }
  }

  function slideR_() {
    if (activeR_) {
      moveright();
      timerR_=setTimeout("slideR_()",repeat_Delay_);
    }
  }

  function slideD_() {
    if (activeD_) {
      movedown();
      timerD_=setTimeout("slideD_()",repeat_Delay_);
    }
  }

  //function slideU_() {
  // if (activeU_) {
  //  moveup();
  //  timerU_=setTimeout("slideU_()",repeat_Delay_);
  // }
  //}

function init() {
  window.GAME.reset()
}

  window.GAME = new Game();
  //-->
  //})()
