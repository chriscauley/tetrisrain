import makeSchema from './makeSchema'

export default (constructor,fieldnames) => {
  fieldnames = fieldnames ||
    constructor.editable_fieldnames ||
    Object.keys(constructor.fields)

  return fieldnames.map( name => makeSchema(name,constructor.fields[name]))
}