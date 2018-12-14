import _ from "lodash"
import config from './config'
import css from "../css"

class Input {
  tagName = "ur-input"
  constructor(opts) {
    _.defaults(this,opts,{
      input_tagname: "input",
      input_type: opts.type,
      validators: []
    })
    this.css = {
      label: css.form.label,
      field: css.form.field,
      input: css.form.input,
    }
    this._updateCss()
  }

  _updateCss() {
    this.css.error = {
      [css.error]: true,
      [css.hide]: this.valid || !this.show_error,
    }
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
      this.show_error = true
    } catch (error) {
      this.error = error
    }

    return this.valid
  }

  bindEvents(input) {
    const EVENTS = ['change','focus','keyup','keydown']

    EVENTS.forEach(name => {
      input.addEventListener(name,e => {
        if (this.value !== input.value) {
          this.value = input.value
          this._checkValidity()
          this._updateCss()
          this.tag.parent.update()
        }
      })
    })
    input.addEventListener('blur',e => {
      this.show_error = true
      this._updateCss()
      this.tag.parent.update()
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