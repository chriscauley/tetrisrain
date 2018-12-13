import _ from 'lodash'

const Field = initial => {
  return {
    initial,
    serialize: v => v,
    deserialize: v => v,
  }
}

const List = type => {
  return {
    serialize: list =>
      list.map(item =>
        _.isFunction(item.serialize) ? item.serialize() : item,
      ),
    deserialize: list =>
      list.map(item => {
        return item instanceof type ? item : new type(item)
      }),
  }
}

const Int = Field
const String = Field

const notNil = _.negate(_.isNil)

const _Object = class {
  static id = 0
  //fields = {} // defines the data structure to be serialized
  //opts = {} // non-data initialization options

  constructor(opts) {
    this.opts = opts // maybe move this.opts and this.fields into this.META?
    this.makeOpts(opts)
    this.makeFields()
    this.deserialize(opts)
    this.id = this.constructor.id++
  }

  makeOpts(opts) {
    const base_opts = { ...this.constructor.opts }
    for (const [key, default_value] of Object.entries(base_opts)) {
      this[key] = opts[key] || default_value
    }
  }

  makeFields(fields=this.constructor.fields) {
    this.fields = new Map(Object.entries(_.clone(fields)))
  }

  deserialize(json = {}) {
    this.fields.forEach( (field,name) => {
      const value = _.find([json[name], field.initial, this[name], field], notNil)
      if (field.deserialize) {
        this[name] = field.deserialize(value)
      } else if (typeof field === 'function') {
        // this is not a 100% accurate test for when to use new
        // https://stackoverflow.com/a/40922715
        // maybe check if object is a subclass of uR.Object?
        this[name] = field.prototype
          ? new field(this, value)
          : field(this, value)
      } else {
        this[name] = value
      }
    })
  }

  serialize(keys = Object.keys(this.fields)) {
    const json = _.pick(this, keys)
    for (const [key, value] of Object.entries(json)) {
      const field = this.constructor.fields[key]
      if (field.serialize) {
        json[key] = field.serialize(json[key])
      } else if (value && value.serialize) {
        json[key] = value.serialize()
      }
    }
    return _.pickBy(json, notNil)
  }
}

const uR = {
  REQUIRED: {},
  Int,
  Field,
  List,
  String,
  Object: _Object,
}

export default uR
