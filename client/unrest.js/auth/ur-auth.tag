import ThemeMixin from '../css/ThemeMixin'
import auth from './index'

<ur-auth-start>
  <div class={theme.outer}>
    <div class={theme.header}>Please login to continue</div>
    <div class={theme.content}>
      <a href={auth.urls.register} class={css.btn.primary}>Create New Account</a>
      <a href={auth.urls.login} class={css.btn.secondary}>Login</a>
    </div>
  </div>
<script>
  this.auth = auth
  this.mixin(ThemeMixin)
</script>
</ur-auth-start>
