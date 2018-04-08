angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $ionicActionSheet, $q, localService, $state) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.closemenu = function(){
    $ionicSideMenuDelegate.toggleLeft();
  }

  $scope.sair = function(){
    localService.setUsuario({});
    $state.go("app.login");
  }

  $scope.getPhoto = function(){
    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: null,
      allowEdit: true, 
      targetWidth: 500,
      targetHeight: 500,
      encodingType: Camera.EncodingType.JPEG,
      correctOrientation: true,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      customMWGBehavior : true
    };

    return $q(function(resolve, reject){
      $ionicActionSheet.show({
        buttons: [ { text: "Capturar Imagem" }, { text: "Escolher da Galeria" }],
        titleText: "Upload",
        cancelText: "Cancelar",
        cancel: function () {},
        buttonClicked: function (index) {
          switch (index) {
            case 0:
              options.sourceType = Camera.PictureSourceType.CAMERA;
              navigator.camera.getPicture(function(imageData) {
                var url = "data:image/jpeg;base64," + imageData;
                resolve(url);
              }, function(err) {reject(err)},options);
              break;
            case 1:
              options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
              navigator.camera.getPicture(function(imageData) {
                var url = "data:image/jpeg;base64," + imageData;
                resolve(url);
              }, function(err) {reject(err)},options);
              break;
          }
          return true;
        }
      });
    });
  }

})

.controller('loginCtrl', function($scope, $state, $ionicSideMenuDelegate, apiService, $ionicLoading, localService, $ionicHistory, $q, $ionicHistory) {
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.cadastro = function(){
    $state.go("app.novaconta");
  }

  $scope.facebookSignIn = function() {
    $ionicLoading.show();
    facebookConnectPlugin.getLoginStatus(function(suc){
      console.log(suc);
      if(suc.status === 'connected'){                   
        logout();
      } else {
        facebookConnectPlugin.login(['email', 'public_profile', 'user_likes'], function(res){
          console.log(res);

          apiService.get('Usuario/GetBuscarUsuarioPorIdRedeSocial/?idRedeSocial=', res.authResponse.userID, 
          function(success){
            console.log(success);
            
            if(!success.data[0]){
              getInfos(res);
            }else{
              $ionicLoading.hide();
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              
              localService.setUsuario({
                nome: success.data[0].nome,
                email: success.data[0].email,
                telefone: success.data[0].telefone,
                userID: success.data[0].id,
                img: success.data[0].img
              });

              $state.go('app.meuspets');
            }
          }, function(err){
            console.log(err);
            getInfos(res);
          });
        }, function(err){
          console.log(err);
          $ionicLoading.hide();
        });
      }
    })
  }

  function getInfos(res){
    getFacebookProfileInfo(res.authResponse).then(function(profileInfo) {
      console.log("fbLoginSuccess");
      console.log(profileInfo);
      var user = {
        facebookID: profileInfo.id,
        nome: profileInfo.name,
        email: profileInfo.email,
        likes: profileInfo.likes,
        img: "http://graph.facebook.com/" + profileInfo.id + "/picture?type=large"
      };

      localService.setCadastro(user);

      $ionicLoading.hide();
      $state.go('app.novaconta');
    }, function(fail){
        console.log('profile info fail', fail);
    });
  }

  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name,likes&access_token=' + authResponse.accessToken, null,
      function (response) {
      console.log(response);
          info.resolve(response);
      },
        function (response) {
      console.log(response);
          info.reject(response);
        }
    );
    return info.promise;
};

  function logout(){
    facebookConnectPlugin.logout(function () {
      console.log("logout"); 
      $scope.facebookSignIn();
    },
    function (fail) {
      console.log(fail);
    });
  }

  $scope.login = function(){
    $ionicLoading.show();
    var credentials = "?login="+$scope.user.login+"&senha="+$scope.user.password;
    apiService.get("Usuario/AutenticacaoUsuario/", credentials, function(res){
      console.log(res);
      localService.setUsuario(res.data[0]);
      $ionicLoading.hide();
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $state.go("app.meuspets");
    }, function(err){
      console.log(err);
      $ionicLoading.hide();
    });
  }
})

.controller('MeusPetsCtrl', function($scope, $state, apiService, localService, $ionicHistory) {
  var usr = localService.getUsuario();
  console.log(usr);
  if(!usr.email){
    $state.go("app.login");
  }
  $ionicHistory.clearHistory();

  $scope.pets = localService.getPets();
  if(!$scope.pets.nome){
    getPets();
  }

  getPets = function(){
    apiService.get("Pet/GetBuscarPetPorUsuario/?idUsuario=", usr.userID, function(success){
      console.log(success);
    }, function(err){
      console.log(err);
    });
  }


  


  // $scope.pets = [
  //   { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
  //   { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  // ];

  $scope.newpet = function(){  $state.go("app.novopet"); }
})

.controller('MeusVetsCtrl', function($scope, $state) {
  $scope.vets = [
    { id: 1, nome: 'Dr. Gustavo', crmv: "SP-1234", clinica: "Pet Life", fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750", img:"img/vet-pic.png"},
    { id: 2, nome: 'Dr. Augusto', crmv: "SP-1234", clinica: "Clinica Veterinária Augusto", fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750", img:"img/no-image-vet.png"}
  ];

  $scope.newpet = function(){  $state.go("app.novovet"); }
})

.controller('NovoVetCtrl', function($scope, $state, apiService) {
 apiService.get();
})

.controller('MeusPetshopsCtrl', function($scope, $state) {
  $scope.petshops = [
    { id: 1, nome: 'Pet Life', fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750"},
    { id: 2, nome: 'Dr. Pet', fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750"}
  ];

  $scope.newpetshop = function(){  $state.go("app.novopetshop"); }
})

.controller('NovoPetshopCtrl', function($scope, $state) {
 
})

.controller('FichaCtrl', function($scope, $state, $stateParams) {
  console.log($stateParams);
  $scope.pet = {};
  var pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  ];

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  console.log($scope.pet);
})

.controller('TimelineCtrl', function($scope, $state, $stateParams) {
  $scope.pet = {};
  var pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  ];

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  console.log($scope.pet);
})

.controller('VacinaCtrl', function($scope, $state, $stateParams) {
  $scope.pet = {};
  var pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  ];

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  console.log($scope.pet);

  $scope.vacina = function(id){  $state.go("app.vacinaDetalhe", { 'vacId': id }); }
  $scope.addVacina = function(id){  $state.go("app.novavacina"); }
})

.controller('VacinaDetalheCtrl', function($scope, $state, $stateParams) {
  $scope.vacina = {};
  var vacinas = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  ];

  $scope.vacina = vacinas.filter(function(item) { return item.id == $stateParams.vacId; })[0];
  console.log($scope.vacina);

  $scope.editVacina = function(){  
    console.log("clicou");
    $state.go("app.vacinaEdit", { 'vacId': $scope.vacina.id }); }
})

.controller('VacinaEditCtrl', function($scope, $state, $stateParams) {
  console.log($stateParams.vacId);
})

.controller('PetCtrl', function($scope, $stateParams, $state) {
  $scope.pet = {};
  var pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  ];

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];


  $scope.menu = function(dest){  $state.go(dest, { 'petId': $scope.pet.id }); }
})

.controller('NovoPetCtrl', function($scope, $stateParams, $state) {
  $scope.setItem = function(id){
    console.log(id);
    //$scope.respostas[$scope.quest] = {"res" : id};
  }
})

.controller('NovaVacinaCtrl', function($scope, $stateParams, $state) {
  
})

.controller('BanhosCtrl', function($scope, $stateParams, $state) {
  $scope.pet = {};
  var pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  ];

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  console.log($scope.pet);
})

.controller('MinhaContaCtrl', function($scope, $stateParams, $state) {
  
})

.controller('NovaContaCtrl', function($scope, $stateParams, $state, $ionicLoading, localService, apiService, $ionicPopup) {
  $scope.user = localService.getCadastro();
  console.log($scope.user);
  $scope.signup = function(){
    ($scope.user.base64) ? $scope.user.img = null : $scope.user.base64 = null;
    var data = {
      "nome":$scope.user.nome,
      "email":$scope.user.email,
      "senha":$scope.user.senha,
      "logadoSocial":false,
      "telefone":$scope.user.telefone,
      "img":$scope.user.img,
      "base64":$scope.user.base64,
      "isAtivo":true,
      "idredesocial":$scope.user.facebookID
    }

    $ionicLoading.show();
    console.log("enviar");
    console.log(data);
    apiService.post('usuario/PostUsuario/', data, function(res){
      $ionicLoading.hide();
      console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      confirmPopup.then(function(){
        localService.setUsuario(data);
        $state.go("app.meuspets");
        $scope.modal.hide();
      })
    }, function(err){
      $ionicLoading.hide();
      console.log(err);
    });
  }

  $scope.picture = function(){
    $scope.getPhoto().then(function(res){
      $scope.user.base64 = res;
      $scope.user.img = res;
      //$scope.$apply();
    }, function(err){
      console.log(err);
    });
  }

  $scope.delete = function(){
    $scope.user.img = null;
  }
})



.service('localService', function(){
  var setUsuario = function(dt){window.localStorage.usuario = JSON.stringify(dt);}
  var getUsuario = function(){return JSON.parse(window.localStorage.usuario || '{}');}

  var setCadastro = function(dt){ window.localStorage.cadastro = JSON.stringify(dt);}
  var getCadastro = function(){return JSON.parse(window.localStorage.cadastro || '{}');}

  var setPets = function(dt){ window.localStorage.pets = JSON.stringify(dt);}
  var getPets = function(){return JSON.parse(window.localStorage.pets || '{}');}

  return{
    setUsuario : setUsuario,
    getUsuario : getUsuario,
    setCadastro : setCadastro,
    getCadastro : getCadastro,
    setPets : setPets,
    getPets : getPets
  }
})

.service('apiService', function($http){
  var service = {
    get: get,
    post: post,
    put: put,
    deleta: deleta
  };

  var ApiURL = 'https://qualitydigitalserver2.com.br/TruePetAPI/api/';

  function get(url, param, success, failure) {
    return $http.get(ApiURL + url + param)
    .then(function (result) {
      success(result);
    }, function (error) {
      failure(error);
    });
  }

  function post(url, data, success, failure) {
    return $http.post(ApiURL + url, data)
    .then(function (result) {
      success(result);
    }, function (error) {
      failure(error);
    });
  }

  function put(url, data, success, failure) {
    return $http.put(ApiURL + url, data)
    .then(function (result) {
      success(result);
    }, function (error) {
      failure(error);
    });
  }

  function deleta(url, param, success, failure) {
    return $http.delete(ApiURL + url + param)
    .then(function (result) {
      success(result);
    }, function (error) {
      failure(error);
    });
  }

  return service;

});
