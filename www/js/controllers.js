angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

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

.controller('MeusPetsCtrl', function($scope) {
  $scope.pets = [
    { title: 'Pipoca', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/pipoca.jpeg"},
    { title: 'Costelinha', id: 1, nasc: "25-01-2018 00:00:00", peso: "16", medicamento: "10-02-2018 00:00:00", vacina: "25-04-2018 00:00:00", banho: "30-01-2018 00:00:00", img:"../img/costelinha.jpeg"}
  ];
})

.controller('PetCtrl', function($scope, $stateParams) {
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
