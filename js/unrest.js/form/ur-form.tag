import Form from './Form'

<ur-form>
  <div class={ theme.outer }>
    <div class={ theme.header } if={ form.title }>{ form.title }</div>
    <div class={ theme.content }>
      <div class="rendered_content"></div>
      <form onsubmit={ submit } class={ form.className }>
        <yield from="pre-form"/>

        <div each={ _f,_i in form.fields } class={ _f.field_class }>
          <label if={ _f.label } for={ _f.id } class={ _f.label_class }>
            { _f.label }
          </label>
          <div data-is={ _f.tagName } field={ _f }></div>
          <div class={ "css.error" }>{ _f.error }</div>
          <div class={ "css.help_text" }>{ _f.help_text }</div>
        </div>

      </form>
    </div>
  </div>

<script>
this.on('before-mount',() => {
  this.form = new Form(this)
})

submit() {
  throw "Not Implemented"
}
</script>
</ur-form>