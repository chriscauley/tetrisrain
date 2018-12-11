import _ from "lodash"
import config from './config'

const unslugify = s => {
  if (typeof s != "string") { s = s.toString() }
  return s.replace(/[-_]/g," ").replace(/^(.)|\s(.)/g, ($1) => $1.toUpperCase());
}

export default (obj,fieldnames) => {
  fieldnames = fieldnames || obj.editable_fieldnames || Object.keys(obj.constructor.fields)
  const fields = fieldnames.map(name => {
    const value = obj[name]
    let field = _.clone(config.fields[name] || config.type[typeof value] || {})
    _.assign(field,{
      name,
      value,
    })
    _.defaults(field,{
      type: 'text',
      tagName: 'ur-input',
    })
    if (!field.label) {
      field.label = unslugify(field.name)
    }
    return field
  })
  return fields
}