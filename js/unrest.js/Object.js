import _ from 'lodash'

const assert = (bool, exception) => {
  if (!bool) {
    throw exception
  }
}

const Field = (initial, opts = {}) => {
  const field = {
    initial,
    serialize: v => {
      v = field.coerce(v)
      // validators will throw errors for invalid values
      field.validators.forEach(f => f(v))
      return v
    },
    validators: [],
    coerce: v => v,
    toString: () => `${field.model.name}.${field.name}`,
    model: {}, // set by makeMeta on an Object
    deserialize: v => v,
    type: opts.type,
    opts,
  }
  opts.required &&
    field.validators.push(v =>
      assert(!_.isNil(v), `ValueError: ${field} is required`),
    )
  return field
}

const Int = (initial, opts = {}) => {
  opts.type = 'int'
  const field = Field(initial, opts)

  field.validators.push(v => {
    if (_.isNil(v)) {
      return // this will be caught by required validator
    }
    assert(!isNaN(v), `ValueError: ${field} requires a number`)
  })

  field.coerce = v => (typeof v === 'string' ? Number(v) : v)

  return field
}

const String = (initial, opts = {}) => {
  opts.type = 'string'
  const field = Field(initial, opts)
  field.validators.push(v => {
    assert(
      typeof v === 'string',
      `ValueError: ${field} requires a string not ${v} ${typeof v}`,
    )
  })
  return field
}

const _Number = Int
const Boolean = Field

const TYPES = {
  number: _Number,
  string: String,
  boolean: Boolean,
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

const notNil = _.negate(_.isNil)

const _Object = class _Object {
  static id = 0
  //fields = {} // defines the data structure to be serialized
  //opts = {} // non-data initialization options

  constructor(opts) {
    this.opts = opts // maybe move this.opts and this.fields into this.META?
    this.makeOpts(opts)
    this.makeMeta()
    this.deserialize(opts)
    this.id = ++this.constructor.id
  }

  makeOpts(opts) {
    const base_opts = { ...this.constructor.opts }
    for (const [key, default_value] of Object.entries(base_opts)) {
      this[key] = opts[key] || default_value
    }
  }

  makeMeta() {
    this.constructor.makeMeta()
    this.META = this.constructor.META
  }

  static makeMeta() {
    // #! TODO should this be static?
    this.META = {}
    let cls = this
    const fieldsets = []
    while (cls !== _Object) {
      fieldsets.push(cls.fields)
      cls = Object.getPrototypeOf(cls)
    }
    const fields = (this.META.fields = new Map(
      Object.entries(_.defaults({}, ...fieldsets)),
    ))
    fields.forEach((field, name) => {
      const type = TYPES[typeof field]

      // primitives are lazily coerced
      if (type) {
        fields.set(name, (field = type(field)))
      }
      field.name = name
      field.model = this
    })

    this.makeMeta = () => {} // only execute once!
  }

  deserialize(json = {}) {
    this.META.fields.forEach((field, name) => {
      const value = _.find(
        [json[name], field.initial, this[name], field],
        notNil,
      )
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

  serialize(keys = [...this.META.fields.keys()]) {
    const json = _.pick(this, keys)
    Object.keys(json).forEach(key => {
      const field = this.META.fields.get(key)
      json[key] = field.serialize(json[key])
    })
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
