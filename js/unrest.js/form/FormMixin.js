import _ from "lodash"

import config from './config'
import schema from '../schema'

const prepField = field => {
  // converts a schema object to a field
  return _.defaults(field,{
    tagName: 'ur-input',
    label: schema.unslugify(field.name),
  })
}

export default {
  init: function() {
    this.fields = []
    window.uR._latest_form = this
    _.defaults(this.opts,{
      success_text: "Submit",
      cancel_text: "Cancel",
    })

    _.assign(this, {

      addFields: (opts=this.opts) => {
        const { object, constructor } = opts
        let _fields,fieldnames
        if (object) {
          _fields = new Map([...object.fields])
          fieldnames = object.constructor.editable_fieldnames || []
          this.opts.submit = () => {
            console.log("ser",this.getData())
            object.deserialize(this.getData())
            this.unmount()
          }
        } else if (constructor && constructor !== Object) {
          _fields = new Map([...constructor.fields])
          fieldnames = constructor.editable_fieldnames || []
          this.opts.submit = () => {
            new opts.constructor(this.getData())
            this.unmount()
          }
        } else {
          throw "ValueError: <ur-form> requires a schema, constructor, or object"
        }
        [..._fields]
          .filter(([name,obj]) => fieldnames.indexOf(name) !== -1)
          .map(schema.prep).forEach( field_opts => {
            field_opts = prepField(field_opts)
            const cls = config.tag2class[field_opts.tagName]
            this.fields.push(new cls(field_opts))
          })
      },

      checkValidity: () => {
        // form is valid if there are no invalid fields
        this.valid = !this.fields.filter(f => !f.valid).length
        return this.valid
      },

      getData() {
        const result = {}
        this.fields.forEach(f=>result[f.name] = f.value)
        return result
      }

    })

    this.addFields(this.opts)
  }
}
