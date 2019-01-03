import Ready from '../ready'

const db = {
  ready: Ready(),
}

export default db

import Manager from './Manager'
Object.assign(db, { Manager })
