import { debounce } from 'lodash'

export default debounce((path, _data) => {
  if (window.location.pathname === path) {
    return
  }
  // #! TODO the empty string here is the page title. Need some sort of lookup table
  history.replaceState({ path: path }, '' || document.title, path)
}, 100)
