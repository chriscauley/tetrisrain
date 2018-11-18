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
    serialize: list => list.map(
      item => _.isFunction(item.serialize) ? item.serialize() : item
    ),
    deserialize: list => list.map(item => new type(item)),
  }
}

const Int = Field
const String = Field

const uR = {
  REQUIRED: {},
  Int,
  Field,
  List,
  String
}

export default uR
const notNil = _.negate(_.isNil)

uR.Object = class {
  //fields = {} // defines the data structure to be serialized
  //opts = {} // non-data initialization options

  constructor(opts) {
    this.makeOpts(opts)
    this.makeFields()
    this.deserialize(opts)
  }

  makeOpts(opts) {
    const base_opts = { ...this.constructor.opts }
    for (const [key, default_value] of Object.entries(base_opts)) {
      this[key] = opts[key] || default_value
    }
  }

  makeFields() {
    this.fields = { ...this.constructor.fields }
  }

  deserialize(json) {
    for (const key in this.fields) {
      const field = this.fields[key]
      const value = _.find(
        [json[key], field.initial, this[key], field],
        notNil
      )
      if (field.deserialize) {
        this[key] = field.deserialize(value)
      } else if (typeof field === 'function') {
        // this is not a 100% accurate test for when to use new
        // https://stackoverflow.com/a/40922715
        // maybe check if object is a subclass of uR.Object?
        this[key] = field.prototype
          ? new field(this, value)
          : field(this, value)
      } else {
        this[key] = value
      }
    }
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

