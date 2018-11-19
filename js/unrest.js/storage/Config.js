import Storage from "./Storage";
import { each, defaults } from "lodash";

class Config extends Storage {
  constructor(prefix,schema) {
    super(prefix);
    Config._configs.push(this);
    Config._configs[prefix] = this;
    schema && this.setSchema(schema);
  }
  getDefault(key,_default,schema) {
    if (!schema || typeof schema == "string") { schema = { type: schema, _default:_default }; }
    if (schema && !this._schema[key]) {
      this._schema[key] = schema || {};
      this._schema[key].name = key;
    }
    this.defaults[key] = _default;
    !this.has(key) && this.set(key,_default);
  }
  get(key) {
    var out = super.get(key);
    if (out === undefined) { out = this.defaults[key] }
    var type = this._schema[key] && this._schema[key].type;
    if (type == "boolean") { return out == "true"; }
    if (type == "int" || type == "integer") { return parseInt(out); }
    if (type == "float") { return parseFloat(out); }
    return out;
  }
  getSchema(keys) {
    var self = this;
    return this._getSchemaKeys(keys).map(key => (self._schema[key] || key) );
  }

  setSchema(schema) {
    var self = this;
    // #! TODO: detect type and set to int/bool/char. Maybe if value is object extend object
    if (!Array.isArray(schema)) {// assume it's name/value object
      var obj = schema;
      schema = [];
      for (var key in obj) {
        schema.push({ name: key, value: obj[key] });
      }
    }
    each(schema,function(s) {
      if (s.type == "color" && tinycolor) { s.initial = tinycolor(s.initial).toHexString(); }
      self.getDefault(s.name,s._default || s.value,s);
    });
    return this.getSchema();
  }

  _getSchemaKeys(keys) {
    var out = [];
    for (var key in this._schema) {
      if (keys && keys.indexOf(key) == -1) { continue; }
      this._schema.hasOwnProperty(key) && out.push(key);
    }
    return out;
  }
  getData(keys) {
    var out = {};
    var self = this;
    each(this._getSchemaKeys(keys),(key) => out[key] = self.get(key));
    return out;
  }

  openEditor(tag_opts={}) {
    var self=this, dirty;
    defaults(tag_opts,{
      schema: self.getSchema(),
      submit: function (riot_tag) {
        self.update(riot_tag.getData());
        dirty = true;
      },
      autosubmit: true,
      onUnmount: function() {
        tag_opts && tag_opts.cancel && tag_opts.cancel();
        dirty && window.location.reload();
      },
    });
    each(tag_opts.schema,(s)=> {
      s._default = s.value;
      s.value = self.get(s.name);
    });
    tag_opts.ur_modal = !tag_opts.mount_to;
    uR.alertElement("ur-form",tag_opts);
  }    
}

Config._configs = [];
export default Config;