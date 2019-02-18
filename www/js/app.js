angular.module('starter', [
  'ionic', 
  'starter.controllers', 
  'ngMask', 
  'ionic.contrib.ui.tinderCards', 
  'yaru22.angular-timeago',
  'ngPinchZoom'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    
     //window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
    

      var notificationOpenedCallback = function(jsonData) {
        console.log('didReceiveRemoteNotificationCallBack:');
        console.log(jsonData);
      };

      window.plugins.OneSignal
        .startInit("994578be-5e8b-43d6-88ae-8c551b4054ce")
        .handleNotificationOpened(notificationOpenedCallback)
        .endInit();

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
    url: '/login/:mail',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }
    }
  })

  .state('app.novasenha', {
    url: '/novasenha/:mail',
    views: {
      'menuContent': {
        templateUrl: 'templates/novasenha.html',
        controller: 'NovaSenhaCtrl'
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
      url: '/novopet/:petId',
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
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/timeline.html',
        controller: 'TimelineCtrl'
      }
    }
  })

  .state('app.newtimeline', {
    url: '/newtimeline/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/timeline_new.html',
        controller: 'NewTimelineCtrl'
      }
    }
  })

  .state('app.vacina', {
    url: '/vacina/:petId',
    cache:false,
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
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/vacina_edit.html',
          controller: 'VacinaEditCtrl'
        }
      }
  })

  .state('app.vacinaDetalhe', {
    url: '/vacinaDetalhe/:vacId',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/vacina_detail.html',
        controller: 'VacinaDetalheCtrl'
      }
    }
  })

  .state('app.meusvets', {
      url: '/meusvets',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/vet_list.html',
          controller: 'MeusVetsCtrl'
        }
      }
  })

  .state('app.novovet', {
      url: '/novovet/:vetId',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/vet_new.html',
          controller: 'NovoVetCtrl'
        }
      }
  })

  .state('app.meuspetshops', {
      url: '/meuspetshops',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/petshop_list.html',
          controller: 'MeusPetshopsCtrl'
        }
      }
  })

  .state('app.novopetshop', {
      url: '/novopetshop/:psId',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/petshop_new.html',
          controller: 'NovoPetshopCtrl'
        }
      }
  })

  .state('app.banhos', {
      url: '/banhos/:petId',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/banhos.html',
          controller: 'BanhosCtrl'
        }
      }
  })

  .state('app.novobanho', {
      url: '/novobanho/:petId',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/banhos_new.html',
          controller: 'NovoBanhoCtrl'
        }
      }
  })

  .state('app.medicamentos', {
      url: '/medicamentos/:petId',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/medicamentos.html',
          controller: 'MedicamentosCtrl'
        }
      }
  })

  .state('app.detalhesMedicamento', {
      url: '/detalhesMedicamento/:medId',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/medicamento_detail.html',
          controller: 'DetalhesMedicamentoCtrl'
        }
      }
  })

  .state('app.novomedicamento', {
      url: '/novomedicamento/:id',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/medicamentos_new.html',
          controller: 'NovoMedicamentoCtrl'
        }
      }
  })

  .state('app.minhaconta', {
    url: '/minhaconta',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/minhaconta.html',
        controller: 'MinhaContaCtrl'
      }
    }
  })

  .state('app.novaconta', {
    url: '/novaconta',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/minhaconta_new.html',
        controller: 'NovaContaCtrl'
      }
    }
  })

  .state('app.editarconta', {
    url: '/editarconta',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/minhaconta_edit.html',
        controller: 'EditarContaCtrl'
      }
    }
  })

  .state('app.recomendationlist', {
    url: '/recomendationlist',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/recomendation_list.html',
        controller: 'RecomendationListCtrl'
      }
    }
  })

  .state('app.crushperfil', {
    url: '/crushperfil/:crushId',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/crush_perfil.html',
        controller: 'CrushPerfilCtrl'
      }
    }
  })

  .state('app.chatlist', {
    url: '/chatlist',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/chat_list.html',
        controller: 'ChatListCtrl'
      }
    }
  })

  .state('app.chat', {
    url: '/chat/:petId',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/chat.html',
        controller: 'ChatCtrl'
      }
    }
  })

  .state('app.ownerperfil', {
    url: '/ownerperfil/:ownerId',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/owner_perfil.html',
        controller: 'OwnerPerfilCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/meuspets');
});
