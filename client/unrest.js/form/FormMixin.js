import _ from 'lodash'

//import config from './config'
import schema from '../schema'
import Input from './Input'
import Select from './Select'

const getCls = opts => {
  // config will be used here eventually
  if (opts.type === 'boolean') {
    opts.choices = [['false', 'No'], ['true', 'Yes']]
  }
  if (opts.choices) {
    return Select
  }
  return Input
}

export default {
  init: function() {
    this.inputs = []
    window.uR._latest_form = this
    _.defaults(this.opts, {
      success_text: 'Submit',
      cancel_text: 'Cancel',
      prefix: '',
    })

    _.assign(this, {
      addInputs: (opts = this.opts) => {
        const { object, model, _schema } = opts
        let fields, fieldnames
        if (object) {
          fields = new Map([...object.META.fields])
          fieldnames = object.constructor.editable_fieldnames || []
          this.opts.submit = () => {
            object.deserialize(this.getData())
            this.unmount()
          }
        } else if (model) {
          fields = new Map([...constructor.META.fields])
          fieldnames = model.editable_fieldnames || []
          this.opts.submit = () => {
            new opts.model(this.getData())
            this.unmount()
          }
        } else if (_schema) {
          throw 'NotImplemented: Schema to form coming soon'
        } else {
          throw 'ValueError: <ur-form> requires a schema, constructor, or object'
        }
        Array.from(fields)
          .filter(([name, _obj]) => fieldnames.indexOf(name) !== -1)
          .map(schema.prep) // #! TODO is this necessary for Object/Model or just raw schema
          .forEach(this.addInput)
      },
      addInput: field => {
        // converts a schema field to input options
        const opts = {
          tagName: 'ur-input',
          label: schema.unslugify(field.name),
          id: `${this.prefix}__${field.name}`,
        }
        _.assign(opts, field)
        const cls = getCls(opts)
        this.inputs.push(new cls(opts))
      },

      checkValidity: () => {
        // form is valid if there are no invalid inputs
        this.valid = !this.inputs.filter(f => !f.valid).length
        return this.valid
      },

      getData() {
        const result = {}
        this.inputs.forEach(f => (result[f.name] = f.value))
        return result
      },
    })

    this.addInputs(this.opts)
  },
}
