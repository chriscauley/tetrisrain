import prepChoices from '../schema/prepChoices'
import create from '../element/create'
import config from './config'
import Input from './Input'

class Select extends Input {
  _createInput() {
    this.css.input = "form-select"
    this.input_tagname = "select"
    this.input_type = undefined
    super._createInput()
    this.choices = prepChoices(this)
    this.choices.forEach(c =>{
      create("option",{
        parent: this._input,
        innerHTML: c.label,
        id: c.id,
        value: c.value,
      })
    })
    this._attrs.forEach(attr => {
      this._input[attr] = this[attr]
    })
  }
}

config.tag2class['ur-select'] = Select

<ur-select> 
this.on("before-mount",() => {
  this.opts.input.bindTag(this)
})
</ur-select>
