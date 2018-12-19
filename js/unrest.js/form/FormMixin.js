import _ from 'lodash'

import config from './config'
import schema from '../schema'

const prepInput = (field, form) => {
  // converts a schema field to input options
  const default_tag = field.choices ? 'ur-select' : 'ur-input'
  return _.defaults({}, field, {
    tagName: default_tag,
    label: schema.unslugify(field.name),
    id: `${form.prefix}__${field.name}`,
  })
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
          .forEach(field => {
            const opts = prepInput(field, this)
            const cls = config.tag2class[opts.tagName]
            this.inputs.push(new cls(opts))
          })
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
