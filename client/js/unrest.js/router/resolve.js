import router from './router'

export default path => {
  for (const key in router._routes) {
    const regexp = new RegExp(key)
    const match = path.match(regexp)
    if (match) {
      match.key = key
      return match
    }
  }
}
