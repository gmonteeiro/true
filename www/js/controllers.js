angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
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

.controller('MeusPetsCtrl', function($scope, $state) {
  $scope.pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/costelinha.jpeg"}
  ];

  $scope.newpet = function(){  $state.go("app.novopet"); }
})

.controller('FichaCtrl', function($scope, $state, $stateParams) {
  console.log($stateParams);
  $scope.pet = {};
  var pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/costelinha.jpeg"}
  ];

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  console.log($scope.pet);
})

.controller('PetCtrl', function($scope, $stateParams, $state) {
  $scope.pet = {};
  var pets = [
    { nome: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/pipoca.jpeg"},
    { nome: 'Costelinha', id: 2, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/costelinha.jpeg"}
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
