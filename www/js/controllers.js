angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate) {
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

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('loginCtrl', function($scope, $state, $ionicSideMenuDelegate) {
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.cadastro = function(){
    $state.go("app.novaconta");
  }

  $scope.facebookSignIn = function() {
    facebookConnectPlugin.getLoginStatus(function(success){
      console.log('getLoginStatus', success.status);
                                         console.log(success);
      if(success.status === 'connected'){
        //var user = localService.getUser();
        //if(!user.userID || user.userID == 'default'){
          //getFacebookProfileInfo(success.authResponse)
          //.then(function(facebookSignIn) {
            //console.log("fbLoginSuccess");
                
            //console.log(facebookSignIn);
            
            //var user = {
              //authResponse: success.authResponse,
              //userID: facebookSignIn.id,
              //Name: facebookSignIn.name,
              //Email: facebookSignIn.email,
              //likes: facebookSignIn.likes,
              //preference : {'dontshow' : false},
              //picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
            //};
            //localService.setUser(user);

            //$state.go('ustart.signup-profile-individual-facebook');
          //}, function(fail){
            //console.log('profile info fail', fail);
          //});
        //}else{
          //console.log("nao tem cadastro");
          //$state.go('ustart.signup-profile-individual-facebook');
        //}
                                         
        logout();
      } else {
        console.log('getLoginStatus', success.status);
        //($rootScope.sistema === "ANDROID") ? null : $ionicLoading.show();
        if(success.status === 'connected'){
          console.log('out');
          logout();
        }else{
          console.log('login');
          facebookConnectPlugin.login(['email', 'public_profile'], function(res){
            console.log(res);
          }, function(err){
            console.log(err);
          });
           //if(firstTime){
               //localService.setFirst({'val':3});
               //firstTime = false;
              
              // setTimeout(function() {
            //       $scope.facebookSignIn();
          //     }, 1800);
           //}
        }
      }
    })
  }
            
            function logout(){
            facebookConnectPlugin.logout(function () {
                                         // facebookConnectPlugin.login(['email', 'public_profile', 'user_likes'], fbLoginSuccess, fbLoginError);
                                         
                                         console.log("logout");
                                         
                                         },
                                         function (fail) {
                                         console.log(fail);
                                         });
            }
})

.controller('MeusPetsCtrl', function($scope, $state) {
  $scope.pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"img/costelinha.jpeg"}
  ];

  $scope.newpet = function(){  $state.go("app.novopet"); }
})

.controller('MeusVetsCtrl', function($scope, $state) {
  $scope.vets = [
    { id: 1, nome: 'Dr. Gustavo', crmv: "SP-1234", clinica: "Pet Life", fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750", img:"img/vet-pic.png"},
    { id: 2, nome: 'Dr. Augusto', crmv: "SP-1234", clinica: "Clinica Veterinária Augusto", fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750", img:"img/no-image-vet.png"}
  ];

  $scope.newpet = function(){  $state.go("app.novovet"); }
})

.controller('NovoVetCtrl', function($scope, $state) {
 
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

.controller('NovaContaCtrl', function($scope, $stateParams, $state) {
  $scope.signup = function(){
    
  }
})

.service('localService', function(window){
  var setCadastro = function(dt){
    window.localStorage.cadastro = JSON.stringify(dt);
  }

  var getCadastro = function(dt){
    return JSON.parse(window.localStorage.cadastro || '{}');
  }

  return{
    setCadastro : setCadastro,
    getCadastro : getCadastro
  }
})

.service('localService', function(window){
  var setCadastro = function(dt){
    window.localStorage.cadastro = JSON.stringify(dt);
  }

  var getCadastro = function(dt){
    return JSON.parse(window.localStorage.cadastro || '{}');
  }

  return{
    setCadastro : setCadastro,
    getCadastro : getCadastro
  }
});
