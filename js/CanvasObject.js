import riot from "riot"

export function drawLine(context,x1,y1,x2,y2,color) {
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(x1+0.5,y1+0.5);
  context.lineTo(x2+0.5,y2+0.5);
  context.stroke();
}

export class Ease {
  constructor(dt,x0,dx) {
    var t0 = new Date().valueOf();
    this.get = function() {
      var t = new Date().valueOf();
      if (t-t0 > dt) { return x0 + dx; }
      return x0 + dx * (t - t0) /dt; // linear for now
    }.bind(this);
  }
}

export default class CanvasObject {
  constructor() {
  }
  drawBox(x1,y1,x2,y2,color,s) {
    if (!color) { return; } // do clearRect instead?
    s = s || this.scale;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x1*s,y1*s,x2*s,y2*s);
  }
  newElement(tagName,attrs,options) {
    var element = document.createElement(tagName);
    if (attrs.parent) {
      attrs.parent.appendChild(element);
      delete attrs.parent;
    }

    element.innerHTML = attrs.innerHTML || "";
    delete attrs.innerHTML;

    console.log(tagName,options)
    for (var attr in attrs) { element[attr] = attrs[attr]; }
    if (options) { riot.mount(element,options); }
    return element;
  }
  newCanvas(attrs) {
    var canvas = this.newElement("canvas",attrs);
    canvas.ctx = canvas.getContext("2d");
    return canvas;
  }
}
