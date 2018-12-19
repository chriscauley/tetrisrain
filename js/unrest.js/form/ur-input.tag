import _ from "lodash"

<ur-input>
<script>
this.on("before-mount",() => {
  this.opts.input.bindTag(this)
})
</script>
</ur-input>
