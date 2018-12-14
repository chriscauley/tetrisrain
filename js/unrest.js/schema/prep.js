import _ from 'lodash'
import config from './config'

export default ([name,obj]) => {
  if (typeof obj !== "Object") {
    obj = { value: obj }
  }

  return {
    type: 'text',
    ...config.type[typeof obj.value],
    ...config.fields[name],
    ...obj,
    name
  }
}