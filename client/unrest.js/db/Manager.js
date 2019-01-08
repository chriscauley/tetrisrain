import ajax from '../ajax'
import db from './index'

export default class Manager {
  constructor(model) {
    this.model = model
    this.base_url = `/api/${model.app_label}/${model.model_name}/`
    this.refresh()
  }

  refresh() {
    // #! TODO should be db.ready.block or db.ready.ajax
    db.ready.stop()
    ajax(this.base_url)
      .then(response => {
        this.pagination = response.pagination
        this.items = new Map()
        response.results.forEach(this.set)
      })
      .then(db.ready.start)
  }

  get(id) {
    return this.items.get(id)
  }

  create = data =>
    ajax({
      url: this.base_url,
      method: 'POST',
      data: data,
    }).then(this.set)

  save = obj => this.create(obj.serialize())

  set = data => {
    const obj = new this.model(data)
    this.items.set(obj.id, obj)
    this[obj.id] = obj
    return obj
  }
}
