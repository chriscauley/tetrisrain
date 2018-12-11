import _ from "lodash"
import create from "../element/create"

<ur-input>
<script>
this.on("before-mount",() => {
  this.field = opts.field
  const attrs = _.pick(
    this.field,
    [
      // html attributes
      'name', 'id', 'placeholder','required','minlength', 'value',

      // html events
      'onchange', 'onkeyup', 'onfocus', 'onblur',
    ]
  )
  attrs.type = this.field.input_type
  attrs.parent = this.root
  attrs.className = this.field.className
  this._input = create(
    this.field.input_tagname,
    _.omitBy(attrs,_.isNil)
  )
})
</script>
</ur-input>
