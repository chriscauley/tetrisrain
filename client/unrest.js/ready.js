/* A task queue that can be started and stopped.
   Usage:
   ready = new Ready();
   const f = () => console.log(1);
   ready(f);
   ready(f,f,f);
   ready.start(); // logs 1 four times
   ready(f) // logs 1
   ready.stop();
   ready(f); // no logs (until next start)
*/

const Ready = (isReady = () => false, _ready = []) => {
  const ready = (...args) => {
    _ready = _ready.concat(args)
    while (isReady() && _ready.length) {
      _ready.shift()()
    }
    while (isReady() && ready._then.length) {
      ready._then.shift()()
    }
  }
  ready._then = []
  ready.then = (...args) => {
    ready._then = ready._then.concat(args)
    ready()
  }
  ready.start = function() {
    isReady = () => true
    ready()
  }
  ready.stop = function() {
    isReady = () => false
  }
  return ready
}

export default Ready
