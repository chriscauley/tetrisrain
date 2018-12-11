import _ from "lodash"
import config from './config'
import css from "../css"

class Input {
  tagName = "ur-input"
  constructor(opts) {
    _.defaults(this,opts,{
      input_tagname: "input",
      input_type: "text",
    })
  }
  get className() {
    return css.form.input
  }
  get field_class() {
    return css.form.field
  }
  get label_class() {
    return css.form.label
  }
}

config.tag2class['ur-input'] = Input
export default Input