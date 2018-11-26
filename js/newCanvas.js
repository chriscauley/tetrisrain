import newElement from './newElement'

export const Ease = (dt, x0, dx) => {
  const t0 = new Date().valueOf()
  return () => {
    const t = new Date().valueOf()
    if (t - t0 > dt) {
      return x0 + dx
    }
    return x0 + (dx * (t - t0)) / dt // linear for now
  }
}

export default attrs => {
  const canvas = newElement('canvas', attrs)
  canvas.ctx = canvas.getContext('2d')
  canvas.drawBox = (x1, y1, x2, y2, color, s) => {
    if (!color) {
      return
    } // do clearRect instead?
    s = s || canvas.scale
    canvas.ctx.fillStyle = color
    canvas.ctx.fillRect(x1 * s, y1 * s, x2 * s, y2 * s)
  }
  return canvas
}
