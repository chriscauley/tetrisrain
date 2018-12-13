import _ from 'lodash'
import config from './config'

export default (name,value) => {
  let obj = _.clone(config.fields[name] || config.type[typeof value] || {})
  _.assign(obj,{
    name,
    value,
  })
  _.defaults(obj,{
    type: 'text',
    //tagName: 'ur-input',
  })
  /*if (!obj.label) {
    obj.label = unslugify(obj.name)
  }*/
  return obj
}