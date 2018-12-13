import _ from "lodash"
import config from './config'
import css from "../css"

const EVENTS = ['change','focus','blur','keyup','keydown']

class Input {
  tagName = "ur-input"
  constructor(opts) {
    _.defaults(this,opts,{
      input_tagname: "input",
      input_type: opts.type,
      validators: []
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

  bindTag(tag) {
    this.tag = tag
    this._checkValidity()
  }

  _checkValidity(value=this.value) {
    this.valid = false
    if (!this.tag._input.checkValidity()) {
      return this.valid
    }

    try {
      // this is valid if no validator throws an exception
      this.validators.forEach(f => f(value))
      this.valid = true
      this.error = undefined
    } catch (error) {
      this.error = error
    }

    return this.valid
  }

  bindEvents(input) {
    EVENTS.forEach(name => {
      input.addEventListener(name,e => {
        if (this.value !== input.value) {
          this.value = input.value
          this._checkValidity()
          this.tag.parent.update()
        }
      })
    })
  }

  focus = (e) => {}
  keydown = (e) => {}
  keyup = (e) => {}
  change = (e) => {}
  blur = (e) => {}
}

config.tag2class['ur-input'] = Input
export default Input