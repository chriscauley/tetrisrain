import _ from "lodash"

<ur-input>
<script>
this.on("before-mount",() => {
  this.opts.field.bindTag(this)
})
</script>
</ur-input>
