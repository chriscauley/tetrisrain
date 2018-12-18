import _ from 'lodash'
import config from './config'

export default ([name, obj]) => {
  if (typeof obj !== 'object') {
    obj = { value: obj }
  }
  return {
    type: 'text',
    ...config.type[typeof obj.value],
    ...config.name[name],
    ...obj,
    name,
  }
}
