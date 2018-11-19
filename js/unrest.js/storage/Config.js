import Storage from './Storage'
import { each, defaults } from 'lodash'

class Config extends Storage {
  constructor(prefix, schema) {
    super(prefix)
    Config._configs.push(this)
    Config._configs[prefix] = this
    schema && this.setSchema(schema)
  }
  getDefault(key, _default, schema) {
    if (!schema || typeof schema === 'string') {
      schema = { type: schema, _default: _default }
    }
    if (schema && !this._schema[key]) {
      this._schema[key] = schema || {}
      this._schema[key].name = key
    }
    this.defaults[key] = _default
    !this.has(key) && this.set(key, _default)
  }
  get(key) {
    let out = super.get(key)
    if (out === undefined) {
      out = this.defaults[key]
    }
    const type = this._schema[key] && this._schema[key].type
    if (type === 'boolean') {
      return out === 'true'
    }
    if (type === 'int' || type === 'integer') {
      return parseInt(out)
    }
    if (type === 'float') {
      return parseFloat(out)
    }
    return out
  }
  getSchema(keys) {
    return this._getSchemaKeys(keys).map(key => this._schema[key] || key)
  }

  setSchema(schema) {
    // #! TODO: detect type and set to int/bool/char. Maybe if value is object extend object
    if (!Array.isArray(schema)) {
      // assume it's name/value object
      const obj = schema
      schema = []
      for (const key in obj) {
        schema.push({ name: key, value: obj[key] })
      }
    }
    each(schema, s => {
      if (s.type === 'color' && window.tinycolor) {
        s.initial = window.tinycolor(s.initial).toHexString()
      }
      this.getDefault(s.name, s._default || s.value, s)
    })
    return this.getSchema()
  }

  _getSchemaKeys(keys) {
    const out = []
    for (const key in this._schema) {
      if (keys && keys.indexOf(key) === -1) {
        continue
      }
      this._schema.hasOwnProperty(key) && out.push(key)
    }
    return out
  }
  getData(keys) {
    const out = {}
    each(this._getSchemaKeys(keys), key => (out[key] = this.get(key)))
    return out
  }

  openEditor(tag_opts = {}) {
    let dirty
    defaults(tag_opts, {
      schema: this.getSchema(),
      submit: riot_tag => {
        this.update(riot_tag.getData())
        dirty = true
      },
      autosubmit: true,
      onUnmount: function() {
        tag_opts && tag_opts.cancel && tag_opts.cancel()
        dirty && window.location.reload()
      },
    })
    each(tag_opts.schema, s => {
      s._default = s.value
      s.value = this.get(s.name)
    })
    tag_opts.ur_modal = !tag_opts.mount_to
    // uR.alertElement('ur-form', tag_opts) //#! TODO
  }
}

Config._configs = []
export default Config
