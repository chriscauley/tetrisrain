import makeSchema from './makeSchema'

export default (obj,fieldnames) => {
  fieldnames = fieldnames ||
    obj.constructor.editable_fieldnames ||
    Object.keys(obj.constructor.fields)

  return fieldnames.map(name => makeSchema(name, obj[name]))
}