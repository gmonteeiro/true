angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.ficha', {
    url: '/ficha/:petId',
    views: {
      'menuContent': {
        templateUrl: 'templates/ficha.html',
        controller: 'FichaCtrl'
      }
    }
  })

  .state('app.novopet', {
      url: '/novopet',
      views: {
        'menuContent': {
          templateUrl: 'templates/novopet.html',
          controller: 'NovoPetCtrl'
        }
      }
  })

  .state('app.meuspets', {
      url: '/meuspets',
      views: {
        'menuContent': {
          templateUrl: 'templates/meuspets.html',
          controller: 'MeusPetsCtrl'
        }
      }
  })

  .state('app.single', {
    url: '/meuspets/:petId',
    views: {
      'menuContent': {
        templateUrl: 'templates/pet.html',
        controller: 'PetCtrl'
      }
    }
  })

  .state('app.timeline', {
    url: '/timeline/:petId',
    views: {
      'menuContent': {
        templateUrl: 'templates/timeline.html',
        controller: 'TimelineCtrl'
      }
    }
  })

  .state('app.vacina', {
    url: '/vacina/:petId',
    views: {
      'menuContent': {
        templateUrl: 'templates/vacina.html',
        controller: 'VacinaCtrl'
      }
    }
  })

  .state('app.vacinaDetalhe', {
    url: '/vacinaDetalhe/:vacId',
    views: {
      'menuContent': {
        templateUrl: 'templates/vacina_detalhe.html',
        controller: 'VacinaDetalheCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/meuspets');
});
