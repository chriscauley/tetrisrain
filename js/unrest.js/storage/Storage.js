export default class Storage {
  constructor(prefix) {
    this.PREFIX = prefix || "";
    this.META = "META/";
    this.defaults = {}; // table with default values
    this._schema = {};
    this.__CACHE = {};
    if (!this.test_supported()) {
      console.warn("Storage not supported, falling back to dummy storage");
      const FAKE_STORAGE = {};
      this.set = (key,value) => FAKE_STORAGE[key] = value;
      this.get = key => FAKE_STORAGE[key];
      this.has = key => FAKE_STORAGE.hasOwnProperty(key);
      this.remove = key => delete FAKE_STORAGE[key];
    }
    this.times = this.get(this.META+"times") || {};
    this.keys = this.get(this.META+"keys") || [];
  }

  _(key) { return this.PREFIX + key; }
  _getItem(key) {
    if (this.__CACHE[key] === undefined) {
      this.__CACHE[key] = localStorage.getItem(this._(key));
    }
    return this.__CACHE[key];
  }
  _setItem(key,value) {
    localStorage.setItem(this._(key),this.__CACHE[key] = value);
  }
  _removeItem(key) { return localStorage.removeItem(this._(key)); }
  _hasOwnProperty(key) { return localStorage.hasOwnProperty(this._(key)); }

  get(key) {
    // pull a json from local storage or get an object from the defaults dict
    let value;
    if (this._hasOwnProperty(key)) {
      try { value = JSON.parse(this._getItem(key)); }
      catch(e) {
        console.warn(`Item "${key}" in Storage(${this.PREFIX}) was not JSON`,value);
        if (!value) { console.log("removing"); this.remove(key) }
      }
    } else if (this.defaults.hasOwnProperty(key)) {
      value = this.defaults[key];
    }
    return value;
  }

  update(data) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) { this.set(key,data[key]); }
    }
  }

  set(key,value) {
    // store stringified json in localstorage
    if (!value && value !== 0 && value !== "") { return this.remove(key); }
    this._setItem(key,JSON.stringify(value));
    this.times[key] = new Date().valueOf();
    (this.keys.indexOf(key)==-1)?this.keys.push(key):undefined;
    this._save();
  }
  has(key) { return this.keys.indexOf(key) != -1; }

  remove(key) {
    // note, removing a key will revert to default (if present), not undefined
    this._removeItem(key);
    this.keys = this.keys.filter((k) => k != key );
    delete this.times[key];
    this._save();
  }

  clear() {
    for (let key in this.times) { this.remove(key); }
    this._save();
  }

  _save() {
    this._setItem(this.META+'times',JSON.stringify(this.times));
    this._setItem(this.META+'keys',JSON.stringify(this.keys));
  }

  test_supported() {
    // incognito safari and older browsers don't support local storage. Use an object in ram as a dummy
    try {
      localStorage.setItem('test', '1');
      localStorage.removeItem('test');
      return true;
    } catch(e) { console.warn("No local storage found. Falling back."); }
  }
}
