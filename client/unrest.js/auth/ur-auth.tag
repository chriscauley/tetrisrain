import ThemeMixin from '../css/ThemeMixin'
import auth from './index'

<ur-auth-start>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>{auth.GREETING}</div>
    </div>
    <div class={theme.content}>
      <p>
        <a href={auth.urls.register} class={css.btn.primary}>Create New Account</a>
      </p>
      <p>
        <a href={auth.urls.login} class={css.btn.default}>Login</a>
      </p>
    </div>
  </div>
<script>
  this.auth = auth
  this.mixin(ThemeMixin)
</script>
</ur-auth-start>
