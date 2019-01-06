import FormMixin from '../FormMixin'
import ThemeMixin from '../../css/ThemeMixin'

<ur-form>
  <div class={ theme.outer }>
    <div class={ theme.header } if={ title }>{ title }</div>
    <div class={ theme.content }>
      <div class="rendered_content"></div>
      <form onsubmit={ submit } class={ className }>
        <yield from="pre-form"/>

        <div each={ input,_i in inputs } class={ input.css.field }>
          <label if={ css.form.label } for={ input.id } class={ input.css.label }>
            { input.label }
          </label>
          <div data-is={ input.tagName } input={ input }></div>
          <div class={ input.css.error }>{ input.error }</div>
          <div class={ input.css.help_text }>{ input.help_text }</div>
        </div>

        <div class="button_div">
          <yield from="button_div"/>
          <button class={ css.btn.success } onclick={ submit } disabled={!valid}>
            { opts.success_text }</button>
          <button class={ css.btn.cancel } if={ opts.cancel } onclick={ cancel }>
            { opts.cancel_text }</button>
        </div>

      </form>
    </div>
  </div>

<script>
this.mixin(FormMixin)
this.mixin(ThemeMixin)
this.on("mount",() => {
  this.update()
})

this.on("update", () => {
  this.checkValidity()
})

submit(e) {
  e && e.preventDefault && e.preventDefault()
  if (!this.checkValidity()) { // one last check
    this.form.inputs.forEach( input => input.show_error = true );
    this.update();
    return;
  }
  this.opts.submit(this)
}

cancel() {
  throw "Not Implemented"
}
</script>
</ur-form>