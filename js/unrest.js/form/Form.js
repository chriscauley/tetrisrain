import _ from "lodash"

import config from './config'
import schema from '../schema'

export default tag => {
  tag.fields = []
  _.defaults(tag.opts,{
    success_text: "Submit",
    cancel_text: "Cancel",
  })

  _.assign(tag, {

    addFields: opts => {
      if (opts.schema) {
        throw "NotImplemented" // #! TODO
        tag.schema = schema.prep(schema)
      } else if (opts.instance) {
        tag.schema = schema.fromObject(opts.instance)
      } else {
        throw "ValueError: <ur-form> requires a schema or an instance"
      }
      tag.schema.forEach(tag.addField)
    },

    addField: field_opts => {
      const cls = config.tag2class[field_opts.tagName]
      tag.fields.push(new cls(field_opts))
    },

    checkValidity: () => {
      // form is valid if there are no invalid fields
      tag.valid = !tag.fields.filter(f => !f.valid).length
    },
  })

  tag.addFields(tag.opts)
}
