angular.module('starter', ['ionic', 'starter.controllers', 'ngMask'])

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

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }
    }
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
          templateUrl: 'templates/pet_new.html',
          controller: 'NovoPetCtrl'
        }
      }
  })

  .state('app.meuspets', {
      url: '/meuspets',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/pet_list.html',
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

  .state('app.novavacina', {
      url: '/novavacina/:petId',
      views: {
        'menuContent': {
          templateUrl: 'templates/vacina_new.html',
          controller: 'NovaVacinaCtrl'
        }
      }
  })

  .state('app.vacinaEdit', {
      url: '/vacinaEdit/:vacId',
      views: {
        'menuContent': {
          templateUrl: 'templates/vacina_edit.html',
          controller: 'VacinaEditCtrl'
        }
      }
  })

  .state('app.vacinaDetalhe', {
    url: '/vacinaDetalhe/:vacId',
    views: {
      'menuContent': {
        templateUrl: 'templates/vacina_detail.html',
        controller: 'VacinaDetalheCtrl'
      }
    }
  })

  .state('app.meusvets', {
      url: '/meusvets',
      views: {
        'menuContent': {
          templateUrl: 'templates/vet_list.html',
          controller: 'MeusVetsCtrl'
        }
      }
  })

  .state('app.novovet', {
      url: '/novovet',
      views: {
        'menuContent': {
          templateUrl: 'templates/vet_new.html',
          controller: 'NovoVetCtrl'
        }
      }
  })

  .state('app.meuspetshops', {
      url: '/meuspetshops',
      views: {
        'menuContent': {
          templateUrl: 'templates/petshop_list.html',
          controller: 'MeusPetshopsCtrl'
        }
      }
  })

  .state('app.novopetshop', {
      url: '/novopetshop',
      views: {
        'menuContent': {
          templateUrl: 'templates/petshop_new.html',
          controller: 'NovoPetshopCtrl'
        }
      }
  })

  .state('app.banhos', {
      url: '/banhos/:petId',
      views: {
        'menuContent': {
          templateUrl: 'templates/banhos.html',
          controller: 'BanhosCtrl'
        }
      }
  })

  .state('app.minhaconta', {
      url: '/minhaconta',
      views: {
        'menuContent': {
          templateUrl: 'templates/minhaconta.html',
          controller: 'MinhaContaCtrl'
        }
      }
  })

  .state('app.novaconta', {
      url: '/novaconta',
      views: {
        'menuContent': {
          templateUrl: 'templates/minhaconta_new.html',
          controller: 'NovaContaCtrl'
        }
      }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/meuspets');
});
