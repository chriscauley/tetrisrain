import FormMixin from './FormMixin'
import ThemeMixin from '../css/ThemeMixin'

<ur-form>
  <div class={ theme.outer }>
    <div class={ theme.header } if={ title }>{ title }</div>
    <div class={ theme.content }>
      <div class="rendered_content"></div>
      <form onsubmit={ submit } class={ className }>
        <yield from="pre-form"/>

        <div each={ _f,_i in fields } class={ _f.css.field }>
          <label if={ css.form.label } for={ _f.id } class={ _f.css.label }>
            { _f.label }
          </label>
          <div data-is={ _f.tagName } field={ _f }></div>
          <div class={ _f.css.error }>{ _f.error }</div>
          <div class={ _f.css.help_text }>{ _f.help_text }</div>
        </div>

        <div class="button_div">
          <yield from="button_div"/>
          <button class={ css.btn.success } onclick={ submit } disabled={!valid}>
            { opts.success_text }</button>
          <button class={ css.btn.cancel } if={ opts.cancel } onclick={ cancel }>
            { cancel_text }</button>
        </div>

      </form>
    </div>
  </div>

<script>
this.mixin(FormMixin)
this.mixin(ThemeMixin)

this.on("update", () => {
  this.checkValidity()
})

submit() {
  throw "Not Implemented"
}

cancel() {
  throw "Not Implemented"
}
</script>
</ur-form>