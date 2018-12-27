<test-tag>
  <h1>{ opts.title }</h1>
<script>
this.on('mount', () => {
  this.opts.one && this.opts.one()
})
</script>
</test-tag>
