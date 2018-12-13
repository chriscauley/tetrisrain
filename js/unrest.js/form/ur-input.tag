import _ from "lodash"
import create from "../element/create"

<ur-input>
<script>
this.on("before-mount",() => {
  this.field = this.opts.field
  const attrs = _.pick(
    this.field,
    [
      // html attributes
      'name', 'id', 'placeholder','required', 'minlength', 'value',
    ]
  )
  attrs.type = this.field.input_type
  attrs.parent = this.root
  attrs.className = this.field.className
  this._input = create(
    this.field.input_tagname,
    _.omitBy(attrs,_.isNil)
  )
  this.field.bindEvents(this._input)
  this.field.bindTag(this)
})
</script>
</ur-input>
