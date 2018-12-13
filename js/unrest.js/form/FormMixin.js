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
    _.defaults(this.opts,{
      success_text: "Submit",
      cancel_text: "Cancel",
    })

    _.assign(this, {

      addFields: opts => {
        if (opts.schema) {
          throw "NotImplemented" // #! TODO
          this.schema = schema.prep(schema)
        } else if (opts.instance) {
          this.schema = schema.fromObject(opts.instance)
          opts.submit = () => {
            opts.instance.deserialize(this.getData())
            this.unmount()
          }
        } else if (opts.constructor) {
          this.schema = schema.fromConstructor(opts.constructor)
          opts.submit = () => {
            new opts.constructor(this.getData())
            this.unmount()
          }
        } else {
          throw "ValueError: <ur-form> requires a schema, constructor, or instance"
        }
        this.schema.map(prepField).forEach(this.addField)
      },

      addField: field_opts => {
        const cls = config.tag2class[field_opts.tagName]
        this.fields.push(new cls(field_opts))
      },

      checkValidity: () => {
        // form is valid if there are no invalid fields
        this.valid = !this.fields.filter(f => !f.valid).length
        return this.valid
      },

      getData() {
        const result = {}
        this.fields.forEach(f=>result[f.name] = f.value)
        console.log(result)
        return result
      }

    })

    this.addFields(this.opts)
  }
}
