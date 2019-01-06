import uR from './unrest.js'
import Game from './Game'

uR.router.add({
  '#!/help/': uR.router.routeElement('tr-help'),
  '#!/game/(\\d+)/': uR.router.routeElement('tr-game'),
  '#!/history/': uR.router.routeElement('tr-history'),
  '#!/settings/': uR.router.routeElement('ur-form', {
    model: Game,
    submit: form => {
      const data = uR.storage.set('GAME_CONFIG', form.getData())
      Game.objects.create(data).then(obj => {
        uR.router.route(`#!/game/${obj.id}/`)
      })
      form.unmount()
      uR.router.default_route()
    },
    initial: uR.storage.get('GAME_CONFIG'),
    // #! TODO reset: () => uR.storage.remove("GAME_CONFIG"),
  }),
})
