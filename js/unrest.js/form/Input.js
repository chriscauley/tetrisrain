import _ from 'lodash'

import config from './config'
import css from '../css'
import create from '../element/create'

class Input {
  // html attributes from opts
  _attrs = ['name', 'id', 'placeholder', 'required', 'minlength', 'value']

  constructor(opts) {
    _.defaults(this, opts, {
      tagName: 'ur-input',
      input_tagname: 'input',
      input_type: opts.type,
      validators: [],
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

  _createInput() {
    const attrs = _.pick(this, this._attrs)

    attrs.type = this.input_type
    attrs.parent = this.tag.root
    attrs.className = this.css.input
    this._input = create(this.input_tagname, _.omitBy(attrs, _.isNil))
  }

  bindTag(tag) {
    this.tag = tag
    tag.field = this
    this._createInput()
    this.bindEvents(this._input)
    this._checkValidity()
  }

  _checkValidity(value = this.value) {
    this.valid = false
    if (!this._input.checkValidity()) {
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
    const EVENTS = ['change', 'focus', 'keyup', 'keydown']

    EVENTS.forEach(name => {
      input.addEventListener(name, _event => {
        const new_value = this.coerce(input.value)
        if (this.value !== new_value) {
          this.value = new_value
          this._checkValidity()
          this._updateCss()
          this.tag.parent.update()
        }
      })
    })
    input.addEventListener('blur', _event => {
      this.show_error = true
      this._updateCss()
      this.tag.parent.update()
    })
  }

  coerce(value) {
    if (this.type === 'number') {
      return Number(value)
    }
    return value
  }

  focus = () => {}
  keydown = () => {}
  keyup = () => {}
  change = () => {}
  blur = () => {}
}

config.tag2class['ur-input'] = Input
export default Input
