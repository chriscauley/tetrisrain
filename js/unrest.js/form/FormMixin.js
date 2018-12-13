import _ from "lodash"

import config from './config'
import schema from '../schema'

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
        } else {
          throw "ValueError: <ur-form> requires a schema or an instance"
        }
        this.schema.forEach(this.addField)
      },

      addField: field_opts => {
        const cls = config.tag2class[field_opts.tagName]
        this.fields.push(new cls(field_opts))
      },

      checkValidity: () => {
        // form is valid if there are no invalid fields
        this.valid = !this.fields.filter(f => !f.valid).length
      },
    })

    this.addFields(this.opts)
  }
}
