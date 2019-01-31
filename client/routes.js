import uR from 'unrest.io'

uR.router.default_route = uR.auth.loginRequired(() =>
  uR.router.route('#!/home/'),
)

uR.router.add({
  '#!/help/': uR.router.routeElement('tr-help'),
  '#/game/(\\d+)/': uR.router.routeElement('tr-game'),
  '#!/history/': uR.router.routeElement('tr-history'),
  '#!/replay/(\\d+)/': uR.router.routeElement('tr-game', { replay: true }),
  '#!/home/': uR.router.routeElement('tr-home'),
})
