import config from './config'
import schema from '../schema'

export default class Form {
  constructor(tag) {
    this.tag = tag
    this.fields = []

    const opts = tag.opts
    this.addFields(opts)
  }
  addFields(opts) {
    if (opts.schema) {
      throw "NotImplemented" // #! TODO
      this.schema = schema.prep(schema)
    } else if (opts.instance) {
      this.schema = schema.fromObject(opts.instance)
    } else {
      throw "ValueError: <ur-form> requires a schema or an instance"
    }
    this.schema.forEach(this.addField)
  }
  addField = (field_opts) => {
    const cls = config.tag2class[field_opts.tagName]
    this.fields.push(new cls(field_opts))
  }
}