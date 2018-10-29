angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $ionicSideMenuDelegate, $ionicActionSheet, $q, localService, $state, $window, apiService) {

  $scope.closemenu = function(){
    $ionicSideMenuDelegate.toggleLeft();
  }

  $scope.getAge = function (nasc) {
      var nascimento = new Date(nasc)
      var hoje = new Date();
      var diferencaAnos = hoje.getFullYear() - nascimento.getFullYear();
      if ( new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) < 
           new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate()) )
          diferencaAnos--;
      return diferencaAnos+' Anos';
  }

  $scope.sair = function(){window.localStorage.clear(); $state.go("app.login"); }

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

  $scope.dateSelect = function(dt, future){
     // - (2*365.25*24*60*60*1000) //menos 2 anos
    var age = (dt) ? new Date(dt) : new Date((new Date()).valueOf());
    var options = {date: age, mode: 'date', allowOldDates: true, allowFutureDates: true, doneButtonLabel: 'Ok', doneButtonColor: '#888888', cancelButtonLabel: 'Cancela', cancelButtonColor: '#cccccc',locale: 'pt-BR'};
    return $q(function(resolve, reject){
      $window.datePicker.show(options, function(date){ console.log(date); resolve(date);}, function(){reject('erro')});
    });
  }

  $scope.diffDates = function(d1, d2){
    var ret = {};
    var ms = new Date(d1) - new Date(d2);
    (ms < 0) ? ms = ms*(-1) : null;

    if(parseInt(ms/31536000000) > 0) { ret.valor = (ms < 0) ? parseInt(ms/31536000000)*(-1) : parseInt(ms/31536000000); ret.unidade = " Anos"; return ret};
    if(parseInt(ms/2628000000) > 0) { ret.valor = (ms < 0) ? parseInt(ms/2628000000)*(-1) : parseInt(ms/2628000000); ret.unidade = " Meses"; return ret};
    if(parseInt(ms/86400000) > 0) { ret.valor = (ms < 0) ? parseInt(ms/86400000)*(-1) : parseInt(ms/86400000); ret.unidade = " Dias"; return ret};
  }

  $scope.glGetVet = function(id){
    return $q(function(resolve, reject){
      apiService.get("veterinario/GetBuscarVeterinarioPorIdUsuario/?idUsuario=", id, function(res){
        if(res.data.length > 0){ localService.setVeterinarios({list:res.data});};
        resolve(res);
      }, function(err){reject(err)});
    });
  }

  $scope.glGetPetshop = function(id){
    return $q(function(resolve, reject){
      apiService.get("petshop/GetBuscarPetShopPorUsuario/?idUsuario=", id, function(res){
        if(res.data.length > 0){ localService.setPetshops({list:res.data});}
        resolve(res);
      }, function(err){ console.log(err); reject(err)});
    });
  }

  $scope.glGetVacinas = function(id){
    return $q(function(resolve, reject){
      apiService.get("Vacina/GetBuscarTodasVacinasPorUsuario?idUsuario=", id, function(res){
        if(res.data.length > 0){ localService.setVacinas({list:res.data});}
        resolve(res);
      }, function(err){ $ionicLoading.hide(); console.log(err); });
    });
  }

  $scope.diasLembrete = [
    {qtd: null, desc: "Retorno"},
    {qtd: null, desc: "Não se aplica"},
    {qtd: 1, desc: "Quinzenal"},
    {qtd: 2, desc: "Mensal"},
    {qtd: 3, desc: "Trimestral"},
    {qtd: 4, desc: "Semestral"},
    {qtd: 5, desc: "Anual"}
  ];

  $scope.validationService = function(fields){
    var ret = false;
    console.log(fields);
    var i=0;
    for (i;i<fields.length;i++){
      (!fields[i].value) ? fields[i].value = "" : null;
      if(fields[i].value.length < 1){
        console.log(fields[i]);
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

  $rootScope.refreshPet = false;

})

.controller('NovaSenhaCtrl', function($scope, $state, apiService, $ionicLoading, localService, $q, $ionicHistory, $ionicPopup, $stateParams) {
  $scope.senha = {};
  $scope.close = function(){
    $ionicHistory.nextViewOptions({disableBack: true}); $state.go("app.login");
  }

  $scope.send = function(){
    if($scope.senha.codigo && $scope.senha.pass){
      if($scope.senha.pass == $scope.senha.conf){
        var credentials = "?login="+$stateParams.mail+"&codigoSenhaReset="+$scope.senha.codigo+"&novaSenha="+$scope.senha.pass;
        $ionicLoading.show();
        apiService.get("Usuario/RecuperarSenhaUsuario", credentials, function(res){
          console.log(res);
          $ionicLoading.hide();
          $ionicPopup.alert({ title: "Senha alterada!!", okText: 'ok' }).then(function(){
            $ionicHistory.nextViewOptions({disableBack: true}); $state.go("app.login", {'mail':$stateParams.mail});
          });
        }, function(err){
          console.log(err);
          $ionicLoading.hide();
          $ionicPopup.alert({ title: "Erro ao alterar senha!", okText: 'ok' }).then(function(){});
        });
      }else{
        console.log($scope.senha.pass,$scope.senha.conf);
        $ionicPopup.alert({ title: "Senhas não conferem!", okText: 'ok' }).then(function(){});
      }
    }else{
      $ionicPopup.alert({ title: "Preencha todos os campos!", okText: 'ok' }).then(function(){});
    }
  }
})

.controller('loginCtrl', function($scope, $state, $ionicSideMenuDelegate, $stateParams, apiService, $ionicLoading, localService, $q, $ionicHistory, $ionicPopup) {
  $ionicSideMenuDelegate.canDragContent(false);
  $scope.user = {};
  $scope.user.login = ($stateParams.mail) ? $stateParams.mail : null;
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
              entrar(success.data[0].id);
            }
          }, function(err){ console.log(err); getInfos(res); });
        }, function(err){ console.log(err); $ionicLoading.hide(); });
      }
    })
  }

  $scope.novasenha = function(){
    if($scope.user.login){
      $ionicLoading.show();
      apiService.get("Usuario/ResetarSenha/?login=", $scope.user.login, function(res){
        $ionicLoading.hide();
        console.log(res);
        $state.go("app.novasenha", {mail:$scope.user.login});
      }, function(err){
        console.log(err);
        $ionicLoading.hide();
         $state.go("app.novasenha", {mail:$scope.user.login});
      });
    }else{
      $ionicPopup.alert({ title: "Digite seu e-mail!", okText: 'ok' }).then(function(){});
    }
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
      // $state.go("app.meuspets");
      entrar(res.data[0].id);
    }, function(err){
      console.log(err);
      $ionicLoading.hide();
      var confirmPopup = $ionicPopup.alert({ title: "Erro ao Logar!", okText: 'ok' });
      confirmPopup.then(function(){});
    });
  }

  function entrar(id){
    $ionicLoading.show();
    if(!localService.getVeterinarios().list){
      console.log("get vets");
      $scope.glGetVet(id).then(function(res){console.log(res); verPetshop(id);
      }, function(err){ console.log(err); verPetshop(id); });
    }else{ verPetshop(id); }
  }

  function verPetshop(id){
    if(!localService.getPetshops().list){
      console.log("get petshops");
      $scope.glGetPetshop(id).then(function(res){ console.log(res); $ionicLoading.hide(); $state.go("app.meuspets");
      }, function(err){ console.log(err); $ionicLoading.hide(); $state.go("app.meuspets"); });
    }else{ $ionicLoading.hide(); $state.go("app.meuspets"); }
  }
})

.controller('MeusPetsCtrl', function($scope, $rootScope, $state, apiService, localService, $ionicHistory, $ionicPopup) {
  localService.setCurrent({});
  var usr = localService.getUsuario();
  (!usr) ? usr = {} : null;
  console.log(usr);

  if(!usr.email){ $state.go("app.login"); }
  $ionicHistory.clearHistory();

  $scope.pets = localService.getPets().list;
  console.log($scope.pets);
  if(!$scope.pets){ getPets(); }else{
    ($rootScope.refreshPet) ? getPets() : null;
  }
  //getPets();
  function getPets(){
    apiService.get("Pet/GetBuscarPetPorUsuario/?idUsuario=", usr.id, function(res){
      if(res.data.length > 0){ localService.setPets({list:res.data}); $scope.pets = res.data; }
      $rootScope.refreshPet = false;
      console.log(res);
    }, function(err){ console.log(err); });
  }

  function alertCad(){
    var confirmPopup = $ionicPopup.confirm({ title:  'Nenhum Pet cadastrado <br> Deseja cadastrar agora?', cancelText: 'Agora Não', okText: 'Cadastrar' });
    confirmPopup.then(function (res) { if (res) { $state.go('app.novopet');}});
  }
  $scope.newpet = function(){  $state.go("app.novopet"); }

  $scope.tempo = function(data, tipo){
    var ret = null;
    switch(tipo){
      case 'vacina':
      if(data){
        var df = $scope.diffDates(data, new Date());
        if(df){ ret = (df.valor < 0) ? "Vacinas em dia" : df.valor+df.unidade;}else{ ret = "Vacinas em dia";}
      }else{
        ret = "Aplicar vacinas"
      }
      break;

      case 'banho':
        if(data){
          var df = $scope.diffDates(new Date(), data);
          if(df){ ret = (df.valor < 0) ? "Hora do banho" : df.valor+df.unidade;}else{ ret = "Hora do banho";}
        }else{
          ret = "Hora do banho";
        }
      break;

      case 'vermifugo':
        if(data){
          var df = $scope.diffDates(new Date(), data);
          if(df){ ret = (df.valor < 0) ? "Aplicar vermífugo" : df.valor+df.unidade;}else{ ret = "Aplicar vermífugo";}
        }else{
          ret = "Aplicar vermífugo";
        }
      break;
    }

    return ret;
  }
})

.controller('NovoPetCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory) {
  var pets = localService.getPets().list || [];
  var usr = localService.getUsuario();
  $scope.imagem = null;
  if($stateParams.petId){
    $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
    $scope.title = "Editar Pet";
    $scope.imagem = $scope.pet.img;
  }else{
    $scope.pet = {};
    $scope.title = "Novo Pet";
  }

  console.log($scope.pet);
  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.imagem = res; $scope.pet.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.imagem = null; $scope.pet.base64 = null; $scope.pet.img = null;}

  $scope.getDate = function(){ $scope.dateSelect($scope.pet.dataNascimento, false).then(function(res){ if(res){$scope.pet.dataNascimento = res; }}, function(err){ console.log(err); });}
  $scope.getAplicacao = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.pet.vermifugo = res; }}, function(err){ console.log(err); });}
  $scope.getRetorno = function(){ $scope.dateSelect(null, true).then(function(res){ if(res){$scope.pet.retorno = res; }}, function(err){ console.log(err); });}

  $scope.send = function(){
    //$scope.pet.img = null;
    $scope.pet.idUsuario = usr.id;
    $scope.pet.isAtivo = true;

    $ionicLoading.show();
    ($stateParams.petId) ? apiService.put('pet/PutPet/', $scope.pet, success, err) : apiService.post('pet/PostPet/', $scope.pet, success, err);

    function success(res){
      $ionicHistory.clearCache();
      $ionicLoading.hide();console.log(res);
      (res.data[0].idPet) ? res.data[0].id = res.data[0].idPet : null;
      if($stateParams.petId){
        index = pets.findIndex(x => x.id==$stateParams.petId);
        delete res.data[0].status;
        delete res.data[0].base64;
        pets[index] = res.data[0];
      }else{
        pets.push(res.data[0]);
      }
      localService.setPets({list:pets});
      $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' }).then(function(){ $state.go("app.meuspets"); });
    }
    function err(err){ $ionicLoading.hide(); console.log(err); $ionicPopup.alert({ title: "Erro ao salvar", okText: 'ok' }).then(function(){});};
  }
})

.controller('PetCtrl', function($scope, $stateParams, $state, localService, $ionicActionSheet, $ionicLoading, apiService, $ionicPopup, $ionicHistory) {
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
  localService.setCurrent($scope.pet);

  $scope.menu = function(dest){  $state.go(dest, { 'petId': $scope.pet.id }); }

  $scope.config = function(){
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "<span class='destructive'>Remover</span>" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.novopet", { 'petId': $scope.pet.id }); break;
          case 1: remove($scope.pet.id); break;
        }
        return true;
      }
    });
  }

  var remove = function(id){
    var confirmPopup = $ionicPopup.confirm({ title:  'seu Pet será excluído!', cancelText: 'Cancelar', okText: 'Ok' });
    confirmPopup.then(function (res) { if (res) {
      $ionicLoading.show();
      apiService.deleta('pet/DeletePet/?idPet=', id, function(res){ $ionicLoading.hide();
        console.log(res);
        index = pets.findIndex(x => x.id==id);
        console.log("remover");
        console.log(pets[index]);
        pets.splice(index, 1);
        localService.setPets(pets);
        var confirmPopup = $ionicPopup.alert({ title: "Pet excluído!", okText: 'ok' });
        confirmPopup.then(function(){ $ionicLoading.hide(); $ionicHistory.clearCache(); $state.go("app.meuspets"); });
      }, function(err){ $ionicLoading.hide();
        $ionicPopup.alert({ title: "Erro ao deletar", okText: 'ok' }).then(function(){ });
        console.log(err); });
    }});
  }

  $scope.tempo = function(data, tipo){
    var ret = null;
    switch(tipo){
      case 'vacina':
      if(data){
        var df = $scope.diffDates(data, new Date());
        if(df){ ret = (df.valor < 0) ? "Vacinas em dia" : df.valor+df.unidade;}else{ ret = "Vacinas em dia";}
      }else{
        ret = "Aplicar vacinas"
      }
      break;

      case 'banho':
        if(data){
          var df = $scope.diffDates(new Date(), data);
          if(df){ ret = (df.valor < 0) ? "Hora do banho" : df.valor+df.unidade;}else{ ret = "Hora do banho";}
        }else{
          ret = "Hora do banho";
        }
      break;

      case 'vermifugo':
        if(data){
          var df = $scope.diffDates(new Date(), data);
          if(df){ ret = (df.valor < 0) ? "Aplicar vermífugo" : df.valor+df.unidade;}else{ ret = "Aplicar vermífugo";}
        }else{
          ret = "Aplicar vermífugo";
        }
      break;
    }

    return ret;
  }
})

.controller('MeusVetsCtrl', function($scope, $state, localService, apiService, $ionicLoading, $ionicPopup, $ionicActionSheet) {
  $scope.vets = localService.getVeterinarios().list;
  var usr = localService.getUsuario();

  (!$scope.vets) ? getVets() : null;

  function getVets(){
    $ionicLoading.show();
    apiService.get("veterinario/GetBuscarVeterinarioPorIdUsuario/?idUsuario=", usr.id, function(res){
      $ionicLoading.hide();
      if(res.data.length > 0){ localService.setVeterinarios({list:res.data}); $scope.vets = res.data; };
      console.log(res);
    }, function(err){ console.log(err); $ionicLoading.hide();});
  }

  $scope.newpet = function(){  $state.go("app.novovet"); }


  $scope.config = function(id){
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "<span class='destructive'>Remover</span>" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.novovet", { 'vetId': id }); break;
          case 1: remove(id); break;
        }
        return true;
      }
    });
  }

  var remove = function(id){
    var confirmPopup = $ionicPopup.confirm({ title:  'Excluir veterinário?', cancelText: 'Cancelar', okText: 'Sim' });
    confirmPopup.then(function (res) { if (res) {
      $ionicLoading.show();
      apiService.deleta('Veterinario/DeleteVeterinario?idVeterinario=', id, function(res){ $ionicLoading.hide();
        console.log(res);
        index = $scope.vets.findIndex(x => x.id==id);
        console.log("remover");
        console.log($scope.vets[index]);
        $scope.vets.splice(index, 1);
        localService.setVeterinarios($scope.vets);
        $ionicLoading.hide();
        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go("app.meusvets");
      }, function(err){ $ionicLoading.hide();
        $ionicPopup.alert({ title: "Erro ao deletar", okText: 'ok' }).then(function(){ });
        console.log(err); });
    }});
  }
})

.controller('NovoVetCtrl', function($scope, $state, apiService, $ionicLoading, $ionicPopup, $ionicHistory, localService, $stateParams) {
  var vets = localService.getVeterinarios().list || [];
  var usr = localService.getUsuario();

  console.log($stateParams.vetId);
  $scope.imagem = null;

  if($stateParams.vetId){
    $scope.vet = vets.filter(function(item) { return item.id == $stateParams.vetId; })[0];
    $scope.title = "Editar Vet";
    $scope.imagem = $scope.vet.img;
  }else{
    $scope.vet = {};
    $scope.title = "Novo Vet";
  }

  $scope.vet.idUsuario = usr.id;
  $scope.vet.isAtivo = true;

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.vet.base64 = res; $scope.imagem = res;}, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.vet.base64 = null; $scope.imagem = null;}

  $scope.send = function(){
    $ionicLoading.show();
    ($scope.vet.base64) ? $scope.vet.img = null : null;
    if(!$stateParams.vetId){
      apiService.post('veterinario/PostVeterinario/', $scope.vet, successPost, error);
    }else{
      apiService.put('veterinario/PutVeterinario/', $scope.vet, successPut, error);
    }
  }

  function successPost(res){
    $ionicLoading.hide();
    res.data[0].localizacao = "";
    (res.data[0].idVeterinario) ? res.data[0].id = res.data[0].idVeterinario : null;
    delete res.data[0].status;
    vets.push(res.data[0]);
    localService.setVeterinarios({list:vets});
    $ionicPopup.alert({ title: "Sucesso!", okText: 'ok' }).then(function(){
      $ionicHistory.clearCache();
      $ionicHistory.nextViewOptions({historyRoot: true});
      $state.go("app.meusvets"); });
    console.log(res);
  }

  function successPut(res){
    console.log(res);
    $ionicLoading.hide();
    res.data[0].localizacao = "";
    (res.data[0].idVeterinario) ? res.data[0].id = res.data[0].idVeterinario : null;
    var index = vets.findIndex(x => x.id==$stateParams.vetId);
    delete res.data[0].base64;
    vets[index] = res.data[0];
    localService.setVeterinarios({list:vets});
    $ionicPopup.alert({ title: "Sucesso!", okText: 'ok' }).then(function(){
      $ionicHistory.clearCache();
      $ionicHistory.nextViewOptions({historyRoot: true});
      $state.go("app.meusvets");});
  }

  function error(err){
    $ionicLoading.hide();
    $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' }).then(function(){ });
    console.log(err);
  }
})

.controller('MeusPetshopsCtrl', function($scope, $state, localService, apiService, $ionicLoading, $ionicActionSheet, $ionicPopup, $ionicHistory) {
  $scope.petshops = localService.getPetshops().list || [];
  var usr = localService.getUsuario();

  (!$scope.petshops.length > 0) ? getPetshops() : null;

  function getPetshops(){
    $ionicLoading.show();
    apiService.get("petshop/GetBuscarPetShopPorUsuario/?idUsuario=", usr.id, function(res){
      $ionicLoading.hide();
      if(res.data.length > 0){ localService.setPetshops({list:res.data}); $scope.petshops = res.data; }else{  }
      console.log(res);
    }, function(err){ console.log(err); $ionicLoading.hide();});
  }

  $scope.newpetshop = function(){  $state.go("app.novopetshop"); }

  $scope.config = function(id){
    console.log(id);
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "<span class='destructive'>Remover</span>" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.novopetshop", { 'psId': id }); break;
          case 1: remove(id); console.log(id); break;
        }
        return true;
      }
    });
  }

  var remove = function(id){
    console.log(id);
    var confirmPopup = $ionicPopup.confirm({ title:  'Excluir PetShop?', cancelText: 'Cancelar', okText: 'Sim' });
    confirmPopup.then(function (res) { if (res) {
      $ionicLoading.show();
      apiService.deleta('PetShop/DeletePetShop?idPetShop=', id, function(res){ $ionicLoading.hide();
        console.log(res);
        index = $scope.petshops.findIndex(x => x.id==id);
        console.log("remover");
        console.log($scope.petshops[index]);
        $scope.petshops.splice(index, 1);
        localService.setPetshops($scope.petshops);
        $ionicLoading.hide();
        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({disableBack: true});
        $state.go("app.meuspetshops");
      }, function(err){ $ionicLoading.hide();
        $ionicPopup.alert({ title: "Erro ao deletar", okText: 'ok' }).then(function(){ });
        console.log(err); });
    }});
  }
})

.controller('NovoPetshopCtrl', function($scope, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory, $stateParams) {
  var petshops = localService.getPetshops().list || [];
  var usr = localService.getUsuario();

  console.log($stateParams.psId);

  if($stateParams.psId){
    $scope.petshop = petshops.filter(function(item) { return item.id == $stateParams.psId; })[0];
    console.log($scope.petshop);
    $scope.title = "Editar petshop";
  }else{
    $scope.petshop = {};
    $scope.title = "Novo petshop";
  }

  $scope.petshop.idUsuario = usr.id;
  $scope.petshop.isAtivo = true;

  $scope.send = function(){
    $ionicLoading.show();
    if(!$stateParams.psId){
      apiService.post('petshop/PostPetshop/', $scope.petshop, success , error);
    }else{
      apiService.put('petshop/PutPetshop/', $scope.petshop, success , error);
    }
  }

  function success(res){
    $ionicLoading.hide();
    delete res.data[0].status;
    delete res.data[0].base64;
    (res.data[0].idPetShop) ? res.data[0].id = res.data[0].idPetShop : null;

    if($stateParams.psId){
      var index = petshops.findIndex(x => x.id==$stateParams.psId);
      petshops[index] = res.data[0];
    }else{ petshops.push(res.data[0]); }

    (res.data[0].endereco.endereco) ? res.data[0].endereco = res.data[0].endereco.endereco : null;

    console.log(res.data[0].idPetshop);

    localService.setPetshops({list:petshops});

    $ionicPopup.alert({ title: "Sucesso!", okText: 'ok' }).then(function(){ $ionicHistory.clearCache(); $state.go("app.meuspetshops"); $ionicHistory.nextViewOptions({historyRoot: true})});
    console.log(res);
  }

  function error(err){
    $ionicLoading.hide();
    $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' }).then(function(){ });
    console.log(err);
  }
})

.controller('FichaCtrl', function($scope, $state, $stateParams, localService) {
  var pets = localService.getPets().list;

  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  $scope.edit = function(){
    $state.go("app.novopet", { 'petId': $scope.pet.id });
  }

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

.controller('TimelineCtrl', function($scope, $state, $stateParams, $ionicLoading, apiService, localService, $ionicActionSheet, $ionicPopup, $ionicHistory) {
  $scope.timeline = localService.getTimeline().list || [];
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  getItens();
  function getItens(){
    $scope.spinner = true;
    apiService.get("Timeline/GetBuscarTimelinePorPet?idPet=", $scope.pet.id, function(res){
      $scope.spinner = false; 
      $scope.timeline = res.data;
      $ionicLoading.hide();
      localService.setTimeline({list:res.data});
      console.log(res);
    }, function(err){ $scope.spinner = false; $ionicLoading.hide(); console.log(err); });
  }

  $scope.new = function(){
    $state.go("app.newtimeline");
  }

  $scope.shareFacebook = function(item) {
    $ionicLoading.show();

     var opt = {
      method: "feed",
      name : "name",
      caption: "Caption "+" http://qualitydigital.com.br/",
      description: "Descrição",
      title: "Titulo",
        hashtag: '#truepets'
    }

    if(!item.img) { opt.href = "http://qualitydigital.com.br/"};
    if(item.img) {opt.picture = item.img}

    facebookConnectPlugin.showDialog(opt, function (result) {
      $ionicLoading.hide();
      console.log(result);
    }, function (err) {
      console.log(err);
      $ionicLoading.hide();
    });
  };

  $scope.config = function(idTimeline){
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "<span class='destructive'>Remover</span>" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.newtimeline", { 'id': idTimeline }); break;
          case 1: remove(idTimeline); break;
        }
        return true;
      }
    });
  }

  var remove = function(id){
    var confirmPopup = $ionicPopup.confirm({ title:  'Excluir esse registro?', cancelText: 'Cancelar', okText: 'Excluir' });
    confirmPopup.then(function (res) { if (res) {
      $ionicLoading.show();
      apiService.deleta('Timeline/DeleteTimeline?idTimeline=', id, function(res){ $ionicLoading.hide();
        console.log(res);
        index = $scope.timeline.findIndex(x => x.id==id);
        console.log("remover");
        console.log($scope.timeline[index]);
        $scope.timeline.splice(index, 1);
        localService.setMedicamentos({list:$scope.timeline});
        var confirmPopup = $ionicPopup.alert({ title: "Excluído com sucesso!", okText: 'ok' });
        confirmPopup.then(function(){ $ionicLoading.hide(); });
      }, function(err){ $ionicLoading.hide();
        $ionicPopup.alert({ title: "Erro ao excluir!", okText: 'ok' }).then(function(){ });
        console.log(err); });
    }});
  }

})

.controller('NewTimelineCtrl', function($scope, $rootScope, $state, $stateParams, $ionicLoading, apiService, localService, $ionicPopup, $ionicHistory) {
  
  if($stateParams.id){
    $scope.titulo = "Editar postagem";
    var id = $stateParams.id;
    var itens = localService.getTimeline().list || [];
    $scope.timeline = itens.filter(function(item) { return item.id == id; })[0] || {};
  }else{
    $scope.titulo = "Nova postagem";
    $scope.timeline = {};
    $scope.timeline.Data = new Date();
  } 
  
  var pet = localService.getCurrent();
  $scope.imagem = $scope.timeline.img;

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.imagem = res; $scope.timeline.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.imagem = null; $scope.timeline.base64 = null; $scope.timeline.img = null;}

  $scope.send = function(){
    $scope.timeline.idUsuario = pet.idUsuario;
    $scope.timeline.idPet = pet.id;
    $ionicLoading.show();
    $scope.timeline.ativo = true;
    
    if($stateParams.id){
      apiService.put('Timeline/PutTimeline/', $scope.timeline, sucesso, erro);
    }else{
      apiService.post('timeline/PostTimeline/', $scope.timeline, sucesso, erro);
    }
  }

  function sucesso(res){ 
    $ionicLoading.hide();
    console.log(res);
    var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
    $rootScope.refreshPet = true;
    confirmPopup.then(function(){ $ionicHistory.clearCache(); $ionicHistory.goBack(); });
  }

  function erro(err){ 
    $ionicLoading.hide(); 
    console.log(err); 
    $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' }).then(function(){})
  }

  $scope.getData = function(){ 
    $scope.dateSelect(null, false).then(function(res){ 
      if(res){$scope.timeline.Data = res; }
    }, function(err){ console.log(err); });}
})

.controller('VacinaCtrl', function($scope, $state, $stateParams, localService, apiService, $ionicLoading) {
  var pets = localService.getPets().list;
  var vac = localService.getVacinas().list || [];
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
  (!vac.length > 0) ? getVacinas() : findVacinas(false);

  $scope.retvacina = [" ", "Quinzenal","Mensal", "Trimestral", "Semestral", "Anual"];

  console.log($scope.vacinas);
  console.log($scope.pet);

  function getVacinas(){
    $ionicLoading.show();
    apiService.get("Vacina/GetBuscarTodasVacinasPorUsuario?idUsuario=", $scope.pet.idUsuario, function(res){
      $ionicLoading.hide();
      if(res.data.length > 0){ localService.setVacinas({list:res.data}); vac = res.data;}
      console.log(res);
      findVacinas(true);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.viewVacina = function(id){  $state.go("app.vacinaDetalhe", { 'vacId': id }); }
  $scope.addVacina = function(id){  $state.go("app.novavacina", { 'petId': $scope.pet.id }); }

  function findVacinas(ws){
    $scope.vacinas = vac.filter(function(item) { return item.idPet == $stateParams.petId; });
    if(!ws){ ($scope.vacinas.length <= 0) ? getVacinas() : null; }
  }
})

.controller('VacinaDetalheCtrl', function($scope, $state, $stateParams, localService, $ionicActionSheet, $ionicPopup, apiService, $ionicLoading, $ionicHistory, $rootScope) {
  var vacinas = localService.getVacinas().list;
  $scope.vacina = vacinas.filter(function(item) { return item.id == $stateParams.vacId; })[0];

  $scope.config = function(){
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "<span class='destructive'>Remover</span>" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.vacinaEdit", { 'vacId': $scope.vacina.id }); break;
          case 1: remove($scope.vacina.id); break;
        }
        return true;
      }
    });
  }

  var remove = function(id){
    var confirmPopup = $ionicPopup.confirm({ title:  'Excluir essa vacina?', cancelText: 'Cancelar', okText: 'Excluir' });
    confirmPopup.then(function (res) { if (res) {
      $ionicLoading.show();
      apiService.deleta('Vacina/DeleteVacina?idVacina=', id, function(res){ $ionicLoading.hide();
        console.log(res);
        index = vacinas.findIndex(x => x.id==id);
        console.log("remover");
        console.log(vacinas[index]);
        vacinas.splice(index, 1);
        localService.setVacinas({list:vacinas});
        var confirmPopup = $ionicPopup.alert({ title: "Excluído com sucesso!", okText: 'ok' });
        confirmPopup.then(function(){ 
          $ionicLoading.hide(); 
          $ionicHistory.clearCache(); 
          $rootScope.refreshPet = true;
          // campo: idPet se precisar chamar a pg medicamentos:idPet
          $ionicHistory.goBack();  
        });
      }, function(err){ $ionicLoading.hide();
        $ionicPopup.alert({ title: "Erro ao excluir!", okText: 'ok' }).then(function(){ });
        console.log(err); });
    }});
  }

})

.controller('VacinaEditCtrl', function($scope, $rootScope, $state, $stateParams, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory, $ionicScrollDelegate) {
  console.log($stateParams.vacId);
  var usr = localService.getUsuario();
  var vets = localService.getVeterinarios().list;
  var vacinas = localService.getVacinas().list;
  $scope.vacina = vacinas.filter(function(item) { return item.id == $stateParams.vacId; })[0];
  $scope.imagem = $scope.vacina.img;

  $scope.picture = function(){
    $scope.getPhoto().then(function(res){
      $scope.vacina.base64 = res;
      $scope.imagem = res;
      //(!$scope.vacina.imgVacina) ? $scope.vacina.imgVacina = $scope.vacina.base64 : null;
    }, function(err){ console.log(err); });
  }
  $scope.delete = function(){ $scope.vacina.base64 = null; $scope.imgagem = null; $scope.vacina.img = null;}

  $scope.getAplicacao = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.vacina.aplicacao = res.toISOString(); }}, function(err){ console.log(err); });}
  $scope.getRetorno = function(){ $scope.dateSelect(null, true).then(function(res){ if(res){$scope.vacina.retorno = res.toISOString(); }}, function(err){ console.log(err); });}

  $scope.send = function(){
    $scope.vacina.isAtivo = true;
    $scope.vacina.idUsuario = usr.id;

    if(!$scope.vacina.idVeterinario){
      if(inpt.value.length > 2){
        $ionicLoading.show();
        addVet(inpt.value);
      }else{
        $ionicPopup.alert({ title: "Informe o Veterinário", okText: 'ok' }).then(function(){});
      }
    }else{
      $ionicLoading.show();
      addVacina();
    }
  }

  function addVacina(){
    apiService.put('vacina/PutVacina/', $scope.vacina, function(res){ $ionicLoading.hide();console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      index = vacinas.findIndex(x => x.id==res.data.id);
      vacinas[index] = res.data;
      $rootScope.refreshPet = true;
      localService.setVacinas({list:vacinas});
      confirmPopup.then(function(){ $ionicHistory.goBack(); }); //$state.go("app.vacina", { 'petId': res.data[0].idPet });
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  function addVet(nome){
    data = { nome:nome, idUsuario: usr.id, isAtivo:true }
    apiService.post('veterinario/PostVeterinario/', data, function(res){
      res.data[0].localizacao = "";
      delete res.data[0].status;
      vets.push(res.data[0]);
      localService.setVeterinarios({list:vets});
      $scope.vacina.idVeterinario = res.data[0].idVeterinario;
      console.log(res);
      addVacina();
    }, function(err){
      console.log(err);
      console.log("erro vet");
    });
  }

  var inpt = document.getElementById('inpt');
  $scope.busca = '';

  $scope.focus = function(){
    $ionicScrollDelegate.scrollTo(0, 350, true);
    $scope.options = vets.filter(function(item) { return item.nome.substring(0,inpt.value.length) == inpt.value; });;
  }

  $scope.blur = function(){
    if(!$scope.vacina.idVeterinario && $scope.options.length == 1){
      $scope.add($scope.options[0]);
    }
    $scope.options = null;
  }

  $scope.add = function(item){
    $scope.vacina.idVeterinario = (!item.id) ? item.idVeterinario : item.id;;
    $scope.vacina.nomeVeterinario = item.nome;
    inpt.value = '';
  }

  $scope.removeItem = function(){
    $scope.vacina.idVeterinario = null;
    $scope.vacina.nomeVeterinario = null;
    setTimeout(function() { inpt.focus(); }, 100);
  }

  $scope.keypressed = function ($event) {
    $scope.options = vets.filter(function(item) { return item.nome.substring(0,inpt.value.length) == inpt.value; });
  };
})

.controller('NovaVacinaCtrl', function($scope, $rootScope, $stateParams, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory, $ionicScrollDelegate) {
  $scope.vacina = {};
  var usr = localService.getUsuario();
  var vacinas = localService.getVacinas().list || [];
  var vets = localService.getVeterinarios().list || [];

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.vacina.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.vacina.base64 = null; }

  $scope.getAplicacao = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.vacina.aplicacao = res.toISOString(); }}, function(err){ console.log(err); });}
  $scope.getRetorno = function(){ $scope.dateSelect(null, true).then(function(res){ if(res){$scope.vacina.retorno = res.toISOString(); }}, function(err){ console.log(err); });}

  $scope.send = function(){
    $scope.vacina.isAtivo = true;
    $scope.vacina.idPet = $stateParams.petId;
    $scope.vacina.idUsuario = usr.id;

    if(!$scope.vacina.idVeterinario){
      if(inpt.value.length > 2){
        $ionicLoading.show();
        addVet(inpt.value);
      }else{
        $ionicPopup.alert({ title: "Informe o Veterinário", okText: 'ok' }).then(function(){});
      }
    }else{
      $ionicLoading.show();
      addVacina();
    }
  }

  function addVacina(){
    console.log("enviando");
    console.log($scope.vacina);
    // $scope.vacina.retorno = $scope.vacina.aplicacao;
    apiService.post('Vacina/PostVacina/', $scope.vacina, function(res){ console.log(res);
      $scope.glGetVacinas(usr.id).then(function(res){
        console.log(res);
        $ionicLoading.hide();
        var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
        $rootScope.refreshPet = true;
        confirmPopup.then(function(){ $ionicHistory.goBack(); });
      }, function(err){
        console.log(err); $ionicLoading.hide();
        var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
        confirmPopup.then(function(){ $ionicHistory.goBack(); });
      });
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  function addVet(nome){
    data = { nome:nome, idUsuario: usr.id, isAtivo:true }
    apiService.post('veterinario/PostVeterinario/', data, function(res){
      res.data[0].localizacao = "";
      delete res.data[0].status;
      vets.push(res.data[0]);
      localService.setVeterinarios({list:vets});
      $scope.vacina.idVeterinario = res.data[0].idVeterinario;
      console.log(res);
      addVacina();
    }, function(err){
      console.log(err);
      console.log("erro vet");
    });
  }

  var inpt = document.getElementById('inpt');
  $scope.busca = '';

  $scope.focus = function(){
    $ionicScrollDelegate.scrollTo(0, 350, true);
    $scope.options = vets.filter(function(item) { return item.nome.substring(0,inpt.value.length) == inpt.value; });;
  }

  $scope.blur = function(){
    if(!$scope.vacina.idVeterinario && $scope.options.length == 1){
      $scope.add($scope.options[0]);
    }
    $scope.options = null;
  }

  $scope.add = function(item){
    $scope.vacina.idVeterinario = (!item.id) ? item.idVeterinario : item.id;
    $scope.vacina.nomeVeterinario = item.nome;
    inpt.value = '';
  }

  $scope.removeItem = function(){
    $scope.vacina.idVeterinario = null;
    $scope.vacina.nomeVeterinario = null;
    setTimeout(function() { inpt.focus(); }, 100);
  }

  $scope.keypressed = function ($event) {
    $scope.options = vets.filter(function(item) { return item.nome.substring(0,inpt.value.length) == inpt.value; });
  };
})

.controller('BanhosCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService) {
  var pets = localService.getPets().list || [];
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
  var banhos = localService.getBanhos().list || [];

  (banhos.length < 1) ? getBanhos() : findBanhos();

  function getBanhos(){
    $ionicLoading.show();
    apiService.get("Banho/BuscarTodosBanhosPorUsuario?idUsuario=", $scope.pet.idUsuario, function(res){
      $ionicLoading.hide();
      if(res.data.length > 0){ localService.setBanhos({list:res.data}); banhos = res.data}else{banhos = []}
      console.log(res);
      findBanhos();
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.novo = function(){
    $state.go("app.novobanho");
  }

  function findBanhos(){
    $scope.banhos = banhos.filter(function(item) { return item.idPet == $scope.pet.id; })
  }
})

.controller('NovoBanhoCtrl', function($scope, $rootScope, $stateParams, $state, localService, apiService, $ionicLoading, $ionicPopup, $ionicScrollDelegate, $ionicHistory) {
  var pet = localService.getCurrent();
  var banhos = localService.getBanhos().list || [];
  var petshops = localService.getPetshops().list || [];

  if($stateParams.id){
    $scope.titulo = "Editar banho";
    $scope.banho = banhos.filter(function(item) { return item.id == $stateParams.id; })[0];
    $scope.imagem = $scope.banho.img;
  }else{
    $scope.titulo = "Adicionar banho";
    $scope.imagem = null;
    $scope.banho = {};
    $scope.banho.idPet = pet.id;
    $scope.banho.idUsuario = pet.idUsuario;
  }

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.banho.base64 = res; $scope.imagem = res }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.banho.base64 = null; $scope.imagem = null }

  $scope.getData = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.banho.dataBanho = res; }}, function(err){ console.log(err); });}

  function addBanho(){
    $ionicLoading.show();
    apiService.post("banho/PostBanho/", $scope.banho, function(res){
      $rootScope.refreshPet = true;
      $ionicLoading.hide();
      console.log(res);
      banhos.push(res.data[0]);
      localService.setBanhos({list:banhos});
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      confirmPopup.then(function(){
        $ionicHistory.goBack(); //$state.go("app.medicamentos", { 'petId': res.data.idPet });
      });
    }, function(err){
      $ionicLoading.hide();
      $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' }).then(function(){});
      console.log(err);
    });
  }

   $scope.send = function(){
    ($scope.banho.base64) ? $scope.banho.img = null : null;
    if(!$scope.banho.idPetshop){
      if(inpt.value.length > 2){
        $ionicLoading.show();
        addPetshop(inpt.value);
      }else{
        $ionicPopup.alert({ title: "Informe o Petshop", okText: 'ok' }).then(function(){});
      }
    }else{
      $ionicLoading.show();
      addBanho();
    }
  }

  function addPetshop(nome){
    data = { nome:nome, idUsuario: pet.idUsuario, isAtivo:true }
    apiService.post('petshop/PostPetshop/', data, function(res){
      (res.data[0].idPetshop) ? res.data[0].id = res.data[0].idPetshop : null;
      petshops.push(res.data[0]);
      localService.setPetshops({list:petshops});
      $scope.banho.idPetshop = res.data[0].id;
      console.log(res);
      addBanho();
    }, function(err){
      console.log(err);
      console.log("erro petshop");
      $ionicLoading.hide();
    });
  }

  var inpt = document.getElementById('inpt');
  $scope.busca = '';

  $scope.focus = function(){
    $ionicScrollDelegate.scrollTo(0, 350, true);
    $scope.options = petshops.filter(function(item) { return item.nome.substring(0,inpt.value.length) == inpt.value; });;
  }

  $scope.blur = function(){
    if(!$scope.banho.idPetshop && $scope.options.length == 1){
      $scope.add($scope.options[0]);
    }
    $scope.options = null;
  }

  $scope.add = function(item){
    console.log(item);
    $scope.banho.idPetshop = item.id;
    $scope.banho.NomePetShop = item.nome;
    inpt.value = '';
  }

  $scope.removeItem = function(){
    console.log("kkk");
    $scope.banho.idPetshop = null;
    $scope.banho.NomePetShop = null;
    setTimeout(function() { inpt.focus(); }, 200);
  }

  $scope.keypressed = function ($event) {
    $scope.options = petshops.filter(function(item) { return item.nome.substring(0,inpt.value.length) == inpt.value; });
  };
})

.controller('MedicamentosCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService) {
  $scope.vazio = false;
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
  var meds = localService.getMedicamentos().list;
  if(!meds){
    getMedicamentos()
  } else{
    $scope.medicamentos = meds.filter(function(item) { return item.idPet == $scope.pet.id; });
    ($scope.medicamentos.length > 0) ? $scope.vazio = false : $scope.vazio = true;
  }

  function getMedicamentos(){
    $ionicLoading.show();
    apiService.get("Vermifugo/GetBuscarVermifugoPorUsuario?idUsuario=", $scope.pet.idUsuario, function(res){
      $ionicLoading.hide();
      $scope.medicamentos = res.data.filter(function(item) { return item.idPet == $scope.pet.id; });
      if(res.data.length > 0){ localService.setMedicamentos({list:res.data}); }else{ $scope.vazio = true; }
      console.log(res);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.novo = function(){
    $state.go("app.novomedicamento");
  }

  $scope.goDetalhe = function(id){
    $state.go("app.detalhesMedicamento", { 'medId': id });
  }

})

.controller('DetalhesMedicamentoCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicActionSheet, $ionicHistory, $rootScope) {
  var meds = localService.getMedicamentos().list || [];
  $scope.med = meds.filter(function(item) { return item.id == $stateParams.medId; })[0];

  $scope.config = function(){
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "<span class='destructive'>Remover</span>" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.novomedicamento", { 'id': $scope.med.id }); break;
          case 1: remove($scope.med.id); break;
        }
        return true;
      }
    });
  }

  var remove = function(id){
    var confirmPopup = $ionicPopup.confirm({ title:  'Excluir esse medicamento?', cancelText: 'Cancelar', okText: 'Excluir' });
    confirmPopup.then(function (res) { if (res) {
      $ionicLoading.show();
      apiService.deleta('Vermifugo/DeleteVermifugo?idVermifugo=', id, function(res){ $ionicLoading.hide();
        console.log(res);
        index = meds.findIndex(x => x.id==id);
        console.log("remover");
        console.log(meds[index]);
        meds.splice(index, 1);
        localService.setMedicamentos({list:meds});
        var confirmPopup = $ionicPopup.alert({ title: "Excluído com sucesso!", okText: 'ok' });
        confirmPopup.then(function(){ 
          $ionicLoading.hide(); 
          $ionicHistory.clearCache(); 
          $rootScope.refreshPet = true;
          // campo: idPet se precisar chamar a pg medicamentos:idPet
          $ionicHistory.goBack();  
        });
      }, function(err){ $ionicLoading.hide();
        $ionicPopup.alert({ title: "Erro ao excluir!", okText: 'ok' }).then(function(){ });
        console.log(err); });
    }});
  }
})

.controller('NovoMedicamentoCtrl', function($scope, $rootScope, $stateParams, $state, localService, $ionicHistory, apiService, $ionicLoading, $ionicPopup) {
  var pet = localService.getCurrent();
  var medicamentos = localService.getMedicamentos().list || [];

  $scope.imagem = null;
  if($stateParams.id){
    $scope.titulo = "Editar medicamento";
    $scope.medicamento = medicamentos.filter(function(item) { return item.id == $stateParams.id; })[0];
    $scope.imagem = $scope.medicamento.img;
  }else{
    $scope.titulo = "Adicionar medicamento";
    $scope.imagem = null;
    $scope.medicamento = {};
    $scope.medicamento.idPet = pet.id;
  }

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.imagem = res; $scope.medicamento.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.imagem = null; $scope.medicamento.base64 = null; $scope.medicamento.img = null;}

  $scope.getAplicacao = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.medicamento.dataAplicacao = res.toISOString(); }}, function(err){ console.log(err); });}
  $scope.getRetorno = function(){ $scope.dateSelect(null, true).then(function(res){ if(res){$scope.medicamento.dataRetorno = res.toISOString(); }}, function(err){ console.log(err); });}

  $scope.send = function(){
    $ionicLoading.show();

    delete $scope.medicamento.Pet;

    if($stateParams.id){
      apiService.put("vermifugo/putVermifugo/", $scope.medicamento, success, error);
    }else{
      apiService.post("vermifugo/postVermifugo/", $scope.medicamento, success, error);
    }
  }

  function success(res){
    $ionicLoading.hide();
    console.log(res);
    var confirmPopup = $ionicPopup.alert({ title: "Salvo com Sucesso!", okText: 'ok' });
    confirmPopup.then(function(){
      if($stateParams.id){
        index = medicamentos.findIndex(x => x.id==$stateParams.id);
        delete res.data.Pet;
        medicamentos[index] = res.data;
      }else{
        medicamentos.push(res.data);
      }
      localService.setMedicamentos({list:medicamentos});
      $rootScope.refreshPet = true;
      $ionicHistory.goBack(); 
    });
  }

  function error(err){
    $ionicLoading.hide();
    $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' });
    console.log(err);
  }

})

.controller('MinhaContaCtrl', function($scope, $stateParams, $state, localService, $ionicActionSheet, apiService, $ionicLoading, $ionicPopup, $ionicHistory) {
  $scope.user = localService.getUsuario();

  $scope.config = function(){
    $ionicActionSheet.show({buttons: [ { text: "Editar" }, { text: "<span class='destructive'>Excluir minha conta</span>" }],titleText: "Configurações",cancelText: "Cancelar",cancel: function () {},buttonClicked: function (index) {
        switch (index) {
          case 0: $state.go("app.editarconta"); break;
          case 1: 
            var confirmPopup = $ionicPopup.confirm({ title:  'Tem certeza que deseja <br> excluir sua conta?', cancelText: 'Cancelar', okText: 'Sim, Excluir' });
            confirmPopup.then(function (res) { if (res) { remove($scope.user.id);}});
          break;
        }
        return true;
      }
    });
  }

  function remove(id){
    $ionicLoading.show();
    apiService.deleta('usuario/DeleteUsuario?idUsuario=', id, function(res){ 
      $ionicLoading.hide();
      console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Excluído com sucesso!", okText: 'ok' });
      confirmPopup.then(function(){  
        $ionicHistory.nextViewOptions({ historyRoot: true }); 
        $scope.sair(); 
      });
    }, function(err){ $ionicLoading.hide();
      $ionicPopup.alert({ title: "Erro ao deletar", okText: 'ok' }).then(function(){ });
      console.log(err); 
    });
  }
})

.controller('NovaContaCtrl', function($scope, $stateParams, $state, $ionicLoading, localService, apiService, $ionicPopup, $ionicHistory) {
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
      var val = $scope.validationService([
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
            (data.base64) ? data.base64 = null : null;
            (res.data[0].imagemUsuario.length > 0) ? data.img = res.data[0].imagemUsuario : null;
            localService.setUsuario(data);
            $ionicHistory.nextViewOptions({
              historyRoot: true
            });
            localService.setCadastro(null);
            $state.go("app.meuspets");
          });
        }, function(err){
          $ionicLoading.hide();
          var msg = "";
          (err.data.Message) ? msg = err.data.Message : msg = "Erro ao salvar!";
          $ionicPopup.alert({ title: msg, okText: 'ok' });
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

.controller('EditarContaCtrl', function($scope, $stateParams, $state, $ionicLoading, localService, apiService, $ionicPopup, $ionicHistory) {
  $scope.user = localService.getUsuario();
  $scope.imagem = $scope.user.img;

  console.log($scope.user);

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.img = null; $scope.imagem = res; $scope.user.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.imagem = null; $scope.user.base64 = null;}

  $scope.save = function(){
    $ionicLoading.show();
    apiService.put('usuario/PutUsuario/', $scope.user, function(res){
      console.log(res);
      $ionicLoading.hide();
      $ionicPopup.alert({ title: "Salvo com Sucesso!", okText: 'ok' }).then(function(){
        (res.data[0].imagemUsuario.length > 0) ? res.data[0].img = res.data[0].imagemUsuario : null;
        (res.data[0].idUsuario) ? res.data[0].id = res.data[0].idUsuario : null;
        localService.setUsuario(res.data[0]);
        $ionicHistory.nextViewOptions({ historyRoot: true });
        $state.go("app.minhaconta");
      });
    }, function(err){
      $ionicLoading.hide();
      $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' });
      console.log(err);
    });
  }
})

.controller('RecomendationListCtrl', function($scope, TDCardDelegate, $stateParams, $state, $ionicLoading, localService, apiService, $ionicPopup, $ionicHistory) {
  $scope.pets = localService.getPets().list;
  console.log($scope.pets);
  var previousCard = [];

  $scope.cards = localService.getPets().list;

  // $scope.cards = Array.prototype.slice.call($scope.pets, 0);

  $scope.cardDestroyed = function(index) {
    previousCard.push($scope.cards[index]);
    // currentCard = index+1;
    $scope.cards.splice(index, 1);
  };

  $scope.addCard = function() {
    var newCard = $scope.pets[Math.floor(Math.random() * $scope.pets.length)];
    newCard.id = Math.random();
    $scope.cards.push(angular.extend({}, newCard));
  }
  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    $scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    $scope.addCard(index);
  };

  $scope.crushed = function(){
    $ionicPopup.confirm({
      title: '<div class="">'+
      '<img src="img/likecrush.png">'+
      '<span class="crushed-title">Você adicionou '+$scope.cards[0].nome+'!</span>'+
      '<span class="crushed-subtitle">Agora ele está na sua lista de crushes.</span>'+
      '</div>',
      cssClass: 'crushed-popup',
      cancelText: 'Ver crushes',
      okText: 'Navegar mais'
    }).then(function (res) {
      if (res) {
        // console.log(id);
        $scope.cardDestroyed(0);
      }else{

      }
    })
  }
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

  var setVeterinarios = function(dt){ window.localStorage.veterinarios = JSON.stringify(dt);}
  var getVeterinarios = function(){return JSON.parse(window.localStorage.veterinarios || '{}');}

  var setPetshops = function(dt){ window.localStorage.petshops = JSON.stringify(dt);}
  var getPetshops = function(){return JSON.parse(window.localStorage.petshops || '{}');}

  var setCurrent = function(dt){ window.localStorage.current = JSON.stringify(dt);}
  var getCurrent = function(){return JSON.parse(window.localStorage.current || '{}');}

  var setMedicamentos = function(dt){ window.localStorage.medicamentos = JSON.stringify(dt);}
  var getMedicamentos = function(){return JSON.parse(window.localStorage.medicamentos || '{}');}

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
    getTimeline : getTimeline,
    setVeterinarios : setVeterinarios,
    getVeterinarios : getVeterinarios,
    setPetshops : setPetshops,
    getPetshops : getPetshops,
    setCurrent : setCurrent,
    getCurrent : getCurrent,
    setMedicamentos : setMedicamentos,
    getMedicamentos : getMedicamentos
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
    return $http.post(ApiURL + url, data)
    .then(function (result) {
      success(result);
    }, function (error) {
      failure(error);
    });
  }

  function put(url, data, success, failure) {
    //var num = (img[11] == "p") ? 22 : 23;
    (data.base64) ? data.base64 = data.base64.substring(23, data.base64.length) : null;
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
