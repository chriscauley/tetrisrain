import Pallet from "./Pallet"
import CanvasObject, { drawLine } from "./CanvasObject"

export default class Board extends CanvasObject {
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
    this.game.pieces_xyr.forEach((p,n) => {
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
    })
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
    _lines.forEach( i => {
      //eliminate line by moving eveything down a line
      for (var k=i;k>=this.skyline;k--) {
        for (var j=0;j<this.width;j++) { this.f[k][j]=this.f[k-1][j]; }
      }
      for (var j=0;j<this.width;j++) { this.f[0][j]=0; }// set top to zero
      this.skyline++;
    });
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
