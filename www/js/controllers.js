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

  $scope.sair = function(){ localService.setUsuario({}); localService.setCadastro({}); localService.setPets({}); localService.setVacinas({}); localService.setBanhos({}); $state.go("app.login"); }

  $scope.getPhoto = function(){
    var options = { quality: 100, destinationType: Camera.DestinationType.DATA_URL, sourceType: null, allowEdit: true,  targetWidth: 500, targetHeight: 500, encodingType: Camera.EncodingType.JPEG, correctOrientation: true, popoverOptions: CameraPopoverOptions, saveToPhotoAlbum: false, customMWGBehavior : true};
    return $q(function(resolve, reject){
      $ionicActionSheet.show({buttons: [ { text: "Capturar" }, { text: "Escolher da Galeria" }],titleText: "Adicionar Imagem",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
          switch (index) {
            case 0:
              options.sourceType = Camera.PictureSourceType.CAMERA;
              navigator.camera.getPicture(function(imageData) {var url = "data:image/jpeg;base64," + imageData;resolve(url);}, function(err) {reject(err)},options);
              break;
            case 1:
              options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
              navigator.camera.getPicture(function(imageData) {var url = "data:image/jpeg;base64," + imageData;resolve(url);}, function(err) {reject(err)},options);
              break;
          }
          return true;
        }
      });
    });
  }

})

.controller('loginCtrl', function($scope, $state, $ionicSideMenuDelegate, apiService, $ionicLoading, localService, $ionicHistory, $q, $ionicHistory, $ionicPopup) {
  $ionicSideMenuDelegate.canDragContent(false);
  $scope.user = {}
  $scope.cadastro = function(){  $state.go("app.novaconta"); }
  $scope.facebookSignIn = function() {
    $ionicLoading.show();
    facebookConnectPlugin.getLoginStatus(function(suc){
      console.log(suc);
      if(suc.status === 'connected'){ logout(); } else {
        facebookConnectPlugin.login(['email', 'public_profile', 'user_likes'], function(res){
          apiService.get('Usuario/GetBuscarUsuarioPorIdRedeSocial/?idRedeSocial=', res.authResponse.userID, 
          function(success){
            console.log(success);
            if(!success.data[0]){ getInfos(res); }else{ 
              $ionicLoading.hide(); $ionicHistory.nextViewOptions({ historyRoot: true });
              localService.setUsuario({ nome: success.data[0].nome, email: success.data[0].email, telefone: success.data[0].telefone, id: success.data[0].id, img: success.data[0].img});
              $state.go('app.meuspets');
            }
          }, function(err){ console.log(err); getInfos(res); });
        }, function(err){ console.log(err); $ionicLoading.hide(); });
      }
    })
  }

  function getInfos(res){
    getFacebookProfileInfo(res.authResponse).then(function(profileInfo) {
      var user = { facebookID: profileInfo.id, nome: profileInfo.name, email: profileInfo.email, likes: profileInfo.likes, img: "http://graph.facebook.com/" + profileInfo.id + "/picture?type=large"};
      localService.setCadastro(user);
      $ionicLoading.hide();
      $state.go('app.novaconta');
    }, function(fail){ console.log('profile info fail', fail); });
  }

  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();
    facebookConnectPlugin.api('/me?fields=email,name,likes&access_token=' + authResponse.accessToken, null,
      function (response) { info.resolve(response); },
      function (response) { info.reject(response);}
    );
    return info.promise;
};

  function logout(){
    facebookConnectPlugin.logout(function () { $scope.facebookSignIn(); },
    function (fail) { console.log(fail); });
  }

  $scope.login = function(){
    $ionicLoading.show();
    var credentials = "?login="+$scope.user.login+"&senha="+$scope.user.password;
    apiService.get("Usuario/AutenticacaoUsuario/", credentials, function(res){
      console.log(res);
      localService.setUsuario(res.data[0]);
      $ionicLoading.hide();
      $ionicHistory.nextViewOptions({ historyRoot: true });
      $state.go("app.meuspets");
    }, function(err){
      console.log(err);
      $ionicLoading.hide();
      var confirmPopup = $ionicPopup.alert({ title: "Erro ao Logar!", okText: 'ok' });
      confirmPopup.then(function(){});
    });
  }
})

.controller('MeusPetsCtrl', function($scope, $state, apiService, localService, $ionicHistory, $ionicPopup) {
  var usr = localService.getUsuario();
  (!usr) ? usr = {} : null;
  console.log(usr);

  if(!usr.email){ $state.go("app.login"); }
  $ionicHistory.clearHistory();

  $scope.pets = localService.getPets().list;
  console.log($scope.pets);
  //if(!$scope.pets){ getPets(); }
  getPets();
  function getPets(){
    apiService.get("Pet/GetBuscarPetPorUsuario/?idUsuario=", usr.id, function(res){
      if(res.data.length > 0){  localService.setPets({list:res.data}); $scope.pets = res.data; }else{ alertCad(); }
      console.log(res);
    }, function(err){ console.log(err); });
  }

  function alertCad(){
    var confirmPopup = $ionicPopup.confirm({ title:  'Nenhum Pet cadastrado <br> Deseja cadastrar agora?', cancelText: 'Agora Não', okText: 'Cadastrar' });
    confirmPopup.then(function (res) { if (res) { $state.go('app.novopet');}});
  }
  $scope.newpet = function(){  $state.go("app.novopet"); }
})

.controller('NovoPetCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService, $ionicPopup) {
  var pets = localService.getPets().list;
  var usr = localService.getUsuario();
  if($stateParams.petId){
    $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
    $scope.title = "Editar Pet";
  }else{
    $scope.pet = {};
    $scope.title = "Novo Pet";
  } 
  
  console.log($scope.pet);
  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.pet.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.user.img = null; }
  
  $scope.send = function(){
    $scope.pet.img = null;
    $scope.pet.idUsuario = usr.id;
    $scope.pet.isAtivo = true;

    $ionicLoading.show();
    ($stateParams.petId) ? apiService.put('pet/PutPet/', $scope.pet, success, err) : apiService.post('pet/PostPet/', $scope.pet, success, err);

    function success(res){
      $ionicLoading.hide();console.log(res);
      $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' }).then(function(){ $state.go("app.meuspets"); });
    }
    function err(err){ $ionicLoading.hide(); console.log(err)};
  }
})

.controller('PetCtrl', function($scope, $stateParams, $state, localService, $ionicActionSheet, $ionicLoading, apiService, $ionicPopup, $ionicHistory) {
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  $scope.menu = function(dest){  $state.go(dest, { 'petId': $scope.pet.id }); }

  $scope.config = function(){
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "Remover" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.novopet", { 'petId': $scope.pet.id }); break;
          case 1: remove($scope.pet.id); break;
        }
        return true;
      }
    });
  }

  var remove = function(id){
    $ionicLoading.show();
    apiService.deleta('pet/DeletePet/?idPet=', id, function(res){ $ionicLoading.hide();
      console.log(res);
      index = pets.findIndex(x => x.id==id);
      pets.splice(index, 1);
      localService.setPets(pets);
      var confirmPopup = $ionicPopup.alert({ title: "Pet deletado!", okText: 'ok' });
      confirmPopup.then(function(){ $ionicLoading.hide(); $ionicHistory.clearCache(); $state.go("app.meuspets"); });
    }, function(err){ $ionicLoading.hide();
      $ionicPopup.alert({ title: "Erro ao deletar", okText: 'ok' }).then(function(){ });
      console.log(err); });
  }
})

.controller('MeusVetsCtrl', function($scope, $state) {
  $scope.vets = [
    { id: 1, nome: 'Dr. Gustavo', crmv: "SP-1234", clinica: "Pet Life", fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750", img:"img/vet-pic.png"},
    { id: 2, nome: 'Dr. Augusto', crmv: "SP-1234", clinica: "Clinica Veterinária Augusto", fone: "(11) 3343-5678", celular: "(11) 95566-8876", endereco: "Rua Guaraiuva, 750", img:"img/no-image-vet.png"}
  ];

  $scope.newpet = function(){  $state.go("app.novovet"); }
})

.controller('NovoVetCtrl', function($scope, $state, apiService) {
 
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

.controller('FichaCtrl', function($scope, $state, $stateParams, localService) {
  var pets = localService.getPets().list;

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  console.log($scope.pet);

  $scope.calcAge = function(nascimento){
    var hoje = new Date();
    var anos  = Math.ceil(Math.abs(new Date(nascimento) - new Date(hoje)) / (1000 * 3600 * 24)) / 365.25;
    var meses = Math.floor((12*(anos % 1)).toFixed(1));
    var umeses = (meses == 1) ? 'mês' : 'meses';
    var uanos = (Math.floor(anos) == 1) ? 'Ano' : 'Anos'; 
    return Math.floor(anos)+' '+uanos+' e '+meses+' '+umeses;
  }

  $scope.humanAge = function(){
    var hoje = new Date();
    var anos  = Math.floor(Math.ceil(Math.abs(new Date($scope.pet.dataNascimento) - new Date(hoje)) / (1000 * 3600 * 24)) / 365.25);
    var age = {
      small:[1, 15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80],
      med  :[1, 15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87],
      big:  [1, 15, 24, 28, 32, 36, 45, 50, 55, 61, 66, 72, 77, 82, 88, 93, 120]
    }

    switch(true){ 
      case $scope.pet.peso < 10: return age.small[anos]+' Anos'; break;
      case $scope.pet.peso > 9 && $scope.pet.peso < 24: return age.med[anos]+' Anos'; break;
      case $scope.pet.peso > 23: return age.big[anos]+' Anos'; break;
    }
  }
})

.controller('TimelineCtrl', function($scope, $state, $stateParams, $ionicLoading, apiService, localService) {
  $scope.itens = localService.getTimeline().list;
  var pets = localService.getPets().list;
  var pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  getItens();
  function getItens(){
    $ionicLoading.show();
    apiService.get("timeline/GetBuscarTimelinePorPet/?idPet=", pet.id, function(res){
      $ionicLoading.hide();
      console.log(res);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.new = function(){
    $state.go("app.newtimeline");
  }

})

.controller('NewTimelineCtrl', function($scope, $state, $stateParams, $ionicLoading, apiService, localService, $ionicPopup) {
  
  if($stateParams.id){
    var itens = localService.getTimeline().list;
    $scope.timeline = itens.filter(function(item) { return item.id == $stateParams.id; })[0];
    $scope.titulo = "Editar Item";
  }else{
    $scope.timeline = {};
    $scope.titulo = "Adicionar Item";
  }

  $scope.send = function(){
    $ionicLoading.show();
    apiService.post('timeline/PostTimeline/', $scope.timeline, function(res){ $ionicLoading.hide();console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      //confirmPopup.then(function(){ $ionicHistory.goBack(); $state.go("app.vacina", { 'petId': $scope.vacina.idPet }); });
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

})

.controller('VacinaCtrl', function($scope, $state, $stateParams, localService, apiService, $ionicLoading) {
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  $scope.vacinas = localService.getVacinas().list;
  if(!$scope.vacinas){ getVacinas(); }

  function getVacinas(){
    $ionicLoading.show();
    apiService.get("Vacina/GetBuscarTodasVacinasPorPet/?idPet=", $scope.pet.id, function(res){
      $ionicLoading.hide();
      if(res.data.length > 0){ localService.setVacinas({list:res.data}); $scope.vacinas = res.data; }else{  }
      console.log(res);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.viewVacina = function(id){  $state.go("app.vacinaDetalhe", { 'vacId': id }); }
  $scope.addVacina = function(id){  $state.go("app.novavacina", { 'petId': $scope.pet.id }); }
})

.controller('VacinaDetalheCtrl', function($scope, $state, $stateParams, localService) {
  var vacinas = localService.getVacinas().list;
  $scope.vacina = vacinas.filter(function(item) { return item.id == $stateParams.vacId; })[0];
  console.log($scope.vacina);

  $scope.editVacina = function(){  $state.go("app.vacinaEdit", { 'vacId': $scope.vacina.id }); }
})

.controller('VacinaEditCtrl', function($scope, $state, $stateParams, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory) {
  console.log($stateParams.vacId);

  var vacinas = localService.getVacinas().list;
  $scope.vacina = vacinas.filter(function(item) { return item.id == $stateParams.vacId; })[0];

  $scope.picture = function(){ 
    $scope.getPhoto().then(function(res){ 
      $scope.vacina.base64 = res; 
      (!$scope.vacina.img) ? $scope.vacina.img = $scope.vacina.base64 : null;
    }, function(err){ console.log(err); });
  }
  $scope.delete = function(){ $scope.user.img = null; }

  $scope.send = function(){
    $ionicLoading.show();
    ($scope.vacina.base64) ? $scope.vacina.img = null : null;
    apiService.post('vacina/PostVacina/', $scope.vacina, function(res){ $ionicLoading.hide();console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Atualizado com Sucesso!", okText: 'ok' });
      index = vacinas.findIndex(x => x.id==$scope.vacina.id);
      vacinas[index] = $scope.vacina;
      localService.setVacinas({list:vacinas});
      confirmPopup.then(function(){ $ionicHistory.goBack(); $state.go("app.vacina", { 'petId': $scope.vacina.idPet }); });
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }
})

.controller('NovaVacinaCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory) {
  $scope.vacina = {};
  var usr = localService.getUsuario();
  var vacinas = localService.getVacinas().list;

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.vacina.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.user.img = null; }
  
  $scope.send = function(){
    $scope.vacina.isAtivo = true;
    $scope.vacina.idPet = $stateParams.petId;

    $ionicLoading.show();
    apiService.post('vacina/PostVacina/', $scope.vacina, function(res){ $ionicLoading.hide();console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      //vacinas.list.push();
      //localService.setVacinas();
      confirmPopup.then(function(){ $ionicHistory.goBack(); $state.go("app.vacina", { 'petId': $scope.vacina.idPet }); });
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }
})

.controller('BanhosCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService) {
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  console.log($scope.pet);

  getBanhos();

  function getBanhos(){
    $ionicLoading.show();
    apiService.get("Banho/BuscarTodosBanhosPorPet/?idPet=", $scope.pet.id, function(res){
      $ionicLoading.hide();
      //if(res.data.length > 0){  localService.setVacinas({list:res.data}); $scope.vacinas = res.data; }else{  }
      console.log(res);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.novo = function(){
    $state.go("app.novobanho");
  }
})

.controller('NovoBanhoCtrl', function($scope, $stateParams, $state) {
  
})

.controller('MinhaContaCtrl', function($scope, $stateParams, $state, localService) {
  $scope.user = localService.getUsuario();
})

.controller('NovaContaCtrl', function($scope, $stateParams, $state, $ionicLoading, localService, apiService, $ionicPopup, validationService) {
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
      "idredesocial":$scope.user.facebookID,
      "id":null
    }

    if($scope.user.senha == $scope.user.confsenha){
      var val = validationService.erro([
        {type:'string',value:data.nome},
        {type:'email',value:data.email},
        {type:'senha',value:data.senha}
      ]).then(function(res){
        $ionicLoading.show();
        apiService.post('usuario/PostUsuario/', data, function(res){

          console.log(res);
          $ionicLoading.hide();
          var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
          confirmPopup.then(function(){
            data.id = res.data[0].idUsuario;
            (res.data[0].imagemUsuario.length > 0) ? data.img = res.data[0].imagemUsuario : null;
            localService.setUsuario(data);
            $state.go("app.meuspets");
          });
        }, function(err){
          $ionicLoading.hide();
          console.log(err);
        });
      }, 
      function(err){
        $ionicPopup.alert({ title: err, okText: 'ok' }).then(function(){});
      });
    }else{
      $ionicPopup.alert({ title: "Senha não confere com a confirmação", okText: 'ok' }).then(function(){});
    }
  }

  $scope.picture = function(){
    $scope.getPhoto().then(function(res){ $scope.user.base64 = res; $scope.user.img = res; }, function(err){ console.log(err); });
  }
  $scope.delete = function(){ $scope.user.img = null; }
})

.service('validationService', function($q){
  var ret = false;
  var erro = function(fields){
    var i=0;
    for (i;i<fields.length;i++){
      (!fields[i].value) ? fields[i].value = "" : null;
      if(fields[i].value.length < 1){
        ret = "Campos obrigatórios"; i = fields.length+1;
      }else{
        switch(fields[i].type){
          case 'email':
            var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!regex.test(fields[i].value)){ ret = "E-mail Inválido"; i = fields.length+1; }
          break;

          case 'fone': if(fields[i].value.length < 10){ ret = "Telefone inválido"; i = fields.length+1;}; break;
          case 'senha': if(fields[i].value.length < 6){ console.log(fields[i].value.length); ret = "A senha deve conter pelo menos 6 dígitos"; i = fields.length+1;}; break;
        }  
      }
    }

    return $q(function(resolve, reject){
      if(ret){reject(ret); }else{resolve("validado")}
    })
  }

  return {"erro":erro}
})

.service('localService', function(){
  var setUsuario = function(dt){window.localStorage.usuario = JSON.stringify(dt);}
  var getUsuario = function(){return JSON.parse(window.localStorage.usuario || '{}');}

  var setCadastro = function(dt){ window.localStorage.cadastro = JSON.stringify(dt);}
  var getCadastro = function(){return JSON.parse(window.localStorage.cadastro || '{}');}

  var setPets = function(dt){ window.localStorage.pets = JSON.stringify(dt);}
  var getPets = function(){return JSON.parse(window.localStorage.pets || '{}');}

  var setVacinas = function(dt){ window.localStorage.vacinas = JSON.stringify(dt);}
  var getVacinas = function(){return JSON.parse(window.localStorage.vacinas || '{}');}

  var setBanhos = function(dt){ window.localStorage.banhos = JSON.stringify(dt);}
  var getBanhos = function(){return JSON.parse(window.localStorage.banhos || '{}');}

  var setTimeline = function(dt){ window.localStorage.timeline = JSON.stringify(dt);}
  var getTimeline = function(){return JSON.parse(window.localStorage.timeline || '{}');}

  return{
    setUsuario : setUsuario,
    getUsuario : getUsuario,
    setCadastro : setCadastro,
    getCadastro : getCadastro,
    setPets : setPets,
    getPets : getPets,
    setVacinas : setVacinas,
    getVacinas : getVacinas,
    setBanhos : setBanhos,
    getBanhos : getBanhos,
    setTimeline : setTimeline,
    getTimeline : getTimeline
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
    (data.base64) ? data.base64 = data.base64.substring(23, data.base64.length) : null;
    console.log(JSON.stringify(data));
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
