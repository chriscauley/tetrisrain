import uR from './Object'

import Ready from './ready'

uR.ready = Ready()
window.onload = uR.ready.start
window.uR = uR

export default uR
