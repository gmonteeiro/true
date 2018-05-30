angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $ionicActionSheet, $q, localService, $state, $window, apiService) {

  $scope.closemenu = function(){
    $ionicSideMenuDelegate.toggleLeft();
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
    var options = {date: age, mode: 'date', allowOldDates: true, allowFutureDates: future, doneButtonLabel: 'Ok', doneButtonColor: '#888888', cancelButtonLabel: 'Cancela', cancelButtonColor: '#cccccc',locale: 'pt-BR'};
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
        if(res.data.length > 0){ localService.setPetshops({list:res.data});};
        resolve(res);
      }, function(err){ console.log(err); reject(err)});
    });
  }

  $scope.diasLembrete = [
    {qtd: null, desc: "Lembrete"},
    {qtd: 1, desc: "1 dia antes"},
    {qtd: 7, desc: "1 semana antes"},
    {qtd: 14, desc: "2 semanas antes"},
    {qtd: 30, desc: "1 mes antes"}
  ]

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
              //$state.go('app.meuspets');
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

.controller('MeusPetsCtrl', function($scope, $state, apiService, localService, $ionicHistory, $ionicPopup) {
  localService.setCurrent({});
  var usr = localService.getUsuario();
  (!usr) ? usr = {} : null;
  console.log(usr);

  if(!usr.email){ $state.go("app.login"); }
  $ionicHistory.clearHistory();

  $scope.pets = localService.getPets().list;
  console.log($scope.pets);
  if(!$scope.pets){ getPets(); }
  //getPets();
  function getPets(){
    apiService.get("Pet/GetBuscarPetPorUsuario/?idUsuario=", usr.id, function(res){
      if(res.data.length > 0){ localService.setPets({list:res.data}); $scope.pets = res.data; }
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
        var df = $scope.diffDates(data, new Date());
        ret = (df.valor < 0) ? "Vacinas em dia" : df.valor+df.unidade;
      break;

      case 'banho':
        var df = $scope.diffDates(new Date(), data);
        ret = (df.valor < 0) ? "Hora do banho" : df.valor+df.unidade;
      break;

      case 'vermifugo':
        var df = $scope.diffDates(new Date(), data);
        ret = (df.valor < 0) ? "Aplicar vermífugo" : df.valor+df.unidade;
      break;
    }

    return ret;
  }

})

.controller('NovoPetCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory) {
  var pets = localService.getPets().list;
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
})

.controller('MeusVetsCtrl', function($scope, $state, localService, apiService, $ionicLoading) {
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
})

.controller('NovoVetCtrl', function($scope, $state, apiService, $ionicLoading, $ionicPopup, $ionicHistory, localService) {
  var vets = localService.getVeterinarios().list;
  (!vets) ? vets = [] : null;
  var usr = localService.getUsuario();


  $scope.vet = {};
  $scope.vet.idUsuario = usr.id;
  $scope.vet.isAtivo = true;

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.vet.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.vet.base64 = null; }

  $scope.send = function(){
    $ionicLoading.show();
    apiService.post('veterinario/PostVeterinario/', $scope.vet, function(res){
      $ionicLoading.hide();
      res.data[0].localizacao = "";
      delete res.data[0].status;
      vets.push(res.data[0]);
      localService.setVeterinarios({list:vets});
      $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' }).then(function(){ $ionicHistory.clearCache(); $state.go("app.meusvets"); $ionicHistory.nextViewOptions({historyRoot: true})});
      console.log(res);
    }, function(err){
      $ionicLoading.hide();
      $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' }).then(function(){ });
      console.log(err);
    });
  }

})

.controller('MeusPetshopsCtrl', function($scope, $state, localService, apiService, $ionicLoading) {
  $scope.petshops = localService.getPetshops().list;
  var usr = localService.getUsuario();

  (!$scope.petshops) ? getPetshops() : null;

  function getPetshops(){
    $ionicLoading.show();
    apiService.get("petshop/GetBuscarPetShopPorUsuario/?idUsuario=", usr.id, function(res){
      $ionicLoading.hide();
      if(res.data.length > 0){ localService.setPetshops({list:res.data}); $scope.petshops = res.data; }else{ alertCad(); }
      console.log(res);
    }, function(err){ console.log(err); $ionicLoading.hide();});
  }

  $scope.newpetshop = function(){  $state.go("app.novopetshop"); }
})

.controller('NovoPetshopCtrl', function($scope, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory) {
  var petshops = localService.getPetshops().list;
  (!petshops) ? petshops = [] : null;
  var usr = localService.getUsuario();

  $scope.petshop = {};
  $scope.petshop.idUsuario = usr.id;
  $scope.petshop.isAtivo = true;

  $scope.send = function(){
    $ionicLoading.show();
    apiService.post('petshop/PostPetshop/', $scope.petshop, function(res){
      $ionicLoading.hide();
      // res.data[0].localizacao = "";
      delete res.data[0].status;
      petshops.push(res.data[0]);
      localService.setPetshops({list:petshops});
      $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' }).then(function(){ $ionicHistory.clearCache(); $state.go("app.meuspetshops"); $ionicHistory.nextViewOptions({historyRoot: true})});
      console.log(res);
    }, function(err){
      $ionicLoading.hide();
      $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' }).then(function(){ });
      console.log(err);
    });
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

.controller('TimelineCtrl', function($scope, $state, $stateParams, $ionicLoading, apiService, localService) {
  $scope.timeline = localService.getTimeline().list || [];
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];

  getItens();
  function getItens(){
    $ionicLoading.show();
    apiService.get("timeline/GetBuscarTimelinePorPet/?idPet=", $scope.pet.id, function(res){
      $scope.timeline = res.data;
      $ionicLoading.hide();
      console.log(res);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
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
})

.controller('NewTimelineCtrl', function($scope, $state, $stateParams, $ionicLoading, apiService, localService, $ionicPopup, $ionicHistory) {
  var id = ($stateParams.id) ? $stateParams.id : null;
  $scope.titulo = (id) ? "Editar postagem" : "Nova postagem";
  var pet = localService.getCurrent();

  var itens = localService.getTimeline().list || [];
  $scope.timeline = itens.filter(function(item) { return item.id == pet.id; })[0] || {};

  $scope.imagem = $scope.timeline.img;

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.imagem = res; $scope.timeline.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.imagem = null; $scope.timeline.base64 = null; $scope.timeline.img = null;}

  $scope.send = function(){
    console.log($scope.timeline);

    $scope.timeline.idUsuario = pet.idUsuario;
    $scope.timeline.idPet = pet.id;

    $ionicLoading.show();
    apiService.post('timeline/PostTimeline/', $scope.timeline, function(res){ $ionicLoading.hide();console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      confirmPopup.then(function(){  $ionicHistory.nextViewOptions({disableBack: true}); $state.go("app.timeline", {petId:$scope.timeline.idPet}); });
    }, function(err){ $ionicLoading.hide(); console.log(err); $ionicPopup.alert({ title: "Erro ao salvar!", okText: 'ok' }).then(function(){})});
  }

})

.controller('VacinaCtrl', function($scope, $state, $stateParams, localService, apiService, $ionicLoading) {
  var pets = localService.getPets().list;
  var vac = localService.getVacinas().list;
  (!vac) ? vac = [] : null;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
  $scope.vacinas = vac.filter(function(item) { return item.idPet == $stateParams.petId; });
  if($scope.vacinas.length < 1){ getVacinas(); }

  console.log($scope.vacinas);
  console.log($scope.pet);

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

  $scope.editVacina = function(){  $state.go("app.vacinaEdit", { 'vacId': $scope.vacina.id }); }
})

.controller('VacinaEditCtrl', function($scope, $state, $stateParams, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory, $ionicScrollDelegate) {
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

  $scope.getAplicacao = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.vacina.aplicacao = res; }}, function(err){ console.log(err); });}
  $scope.getRetorno = function(){ $scope.dateSelect(null, true).then(function(res){ if(res){$scope.vacina.retorno = res; }}, function(err){ console.log(err); });}

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
    $scope.vacina.idVeterinario = 1;
    apiService.put('vacina/PutVacina/', $scope.vacina, function(res){ $ionicLoading.hide();console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      index = vacinas.findIndex(x => x.id==res.data.id);
      vacinas[index] = res.data;
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
      $scope.vacina.idVeterinario = res.data[0].id;
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
    $scope.vacina.idVeterinario = item.id;
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

.controller('NovaVacinaCtrl', function($scope, $stateParams, $state, localService, $ionicLoading, apiService, $ionicPopup, $ionicHistory, $ionicScrollDelegate) {
  $scope.vacina = {};
  var usr = localService.getUsuario();
  var vacinas = localService.getVacinas().list;
  var vets = localService.getVeterinarios().list;

  $scope.picture = function(){ $scope.getPhoto().then(function(res){ $scope.vacina.base64 = res; }, function(err){ console.log(err); });}
  $scope.delete = function(){ $scope.vacina.base64 = null; }

  $scope.getAplicacao = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.vacina.aplicacao = res; }}, function(err){ console.log(err); });}
  $scope.getRetorno = function(){ $scope.dateSelect(null, true).then(function(res){ if(res){$scope.vacina.retorno = res; }}, function(err){ console.log(err); });}

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
    $scope.vacina.idVeterinario = 1;
    apiService.post('vacina/PostVacina/', $scope.vacina, function(res){ $ionicLoading.hide();console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      delete res.data[0].status;
      res.data[0].id = res.data[0].idVacina;
      res.data[0].img = res.data[0].imgVacina;
      vacinas.push(res.data[0]);
      localService.setVacinas({list:vacinas});
      console.log("pet");
      confirmPopup.then(function(){ $ionicHistory.goBack(); $state.go("app.vacina", { 'petId': res.data[0].idPet }); });
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  function addVet(nome){
    data = { nome:nome, idUsuario: usr.id, isAtivo:true }
    apiService.post('veterinario/PostVeterinario/', data, function(res){
      res.data[0].localizacao = "";
      delete res.data[0].status;
      vets.push(res.data[0]);
      localService.setVeterinarios({list:vets});
      $scope.vacina.idVeterinario = res.data[0].id;
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
    $scope.vacina.idVeterinario = item.id;
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
  console.log("teste");
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
  $scope.banhos = localService.getBanhos().list;
  (!$scope.banhos) ? getBanhos() : null;

  $scope.prox = function(data){
    var ultimo = new Date(data);
    var p = Number(ultimo.getDate()+7)+'/'+Number(ultimo.getMonth()+1)+"/"+ultimo.getFullYear();
    h = new Date();
    proximo = new Date(p);
    var atrasado = (h > proximo);
    console.log("prox");
    console.log({data:p, alert:atrasado});
    return { data:p, alert:atrasado};
  }

  function getBanhos(){
    $ionicLoading.show();
    apiService.get("Banho/BuscarTodosBanhosPet/?idPet=", $scope.pet.id, function(res){
      $ionicLoading.hide();
      $scope.banhos = res.data;
      if(res.data.length > 0){ localService.setBanhos({list:res.data}); $scope.prox(res.data[res.data.length-1].dataBanho) }
      console.log(res);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.novo = function(){
    $state.go("app.novobanho");
  }
})

.controller('NovoBanhoCtrl', function($scope, $stateParams, $state, localService, apiService, $ionicLoading, $ionicPopup, $ionicScrollDelegate) {
  var pet = localService.getCurrent();
  var banhos = localService.getBanhos().list;
  var petshops = localService.getPetshops().list;

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
      $ionicLoading.hide();
      console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      confirmPopup.then(function(){
        banhos.push(res.data);
        localService.setMedicamentos({list:banhos});
        $ionicHistory.goBack(); //$state.go("app.medicamentos", { 'petId': res.data.idPet });
      });
    }, function(err){
      $ionicLoading.hide();
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
      addPetshop();
    }
  }

  function addPetshop(nome){
    data = { nome:nome, idUsuario: pet.idUsuario, isAtivo:true }
    apiService.post('petshop/PostPetshop/', data, function(res){
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
  console.log("teste");
  var pets = localService.getPets().list;
  $scope.pet = pets.filter(function(item) { return item.id == $stateParams.petId; })[0];
  $scope.medicamentos = localService.getMedicamentos().list;
  
  (!$scope.medicamentos) ? getMedicamentos() : null;

  $scope.vazio = false;

  $scope.prox = function(data){
    var ultimo = new Date(data);
    var p = Number(ultimo.getDate()+7)+'/'+Number(ultimo.getMonth()+1)+"/"+ultimo.getFullYear();
    h = new Date();
    proximo = new Date(p);
    var atrasado = (h > proximo);
    return {  data:p, alert:atrasado};
  }

  function getMedicamentos(){
    $ionicLoading.show();
    apiService.get("Vermifugo/GetBuscarVermifugoPorPetId?idPet=", $scope.pet.id, function(res){
      $ionicLoading.hide();
      $scope.medicamentos = res.data;
      if(res.data.length > 0){ localService.setMedicamentos({list:res.data}); $scope.prox(res.data[res.data.length-1].data); }else{ $scope.vazio = true; }
      console.log(res);
    }, function(err){ $ionicLoading.hide(); console.log(err); });
  }

  $scope.novo = function(){
    $state.go("app.novomedicamento");
  }
})

.controller('NovoMedicamentoCtrl', function($scope, $stateParams, $state, localService, $ionicHistory, apiService, $ionicLoading, $ionicPopup) {
  var pet = localService.getCurrent();
  var medicamentos = localService.getMedicamentos().list;

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

  $scope.getAplicacao = function(){ $scope.dateSelect(null, false).then(function(res){ if(res){$scope.medicamento.dataAplicacao = res.toISOString(); }}, function(err){ console.log(err); });}
  $scope.getRetorno = function(){ $scope.dateSelect(null, true).then(function(res){ if(res){$scope.medicamento.dataRetorno = res.toISOString(); }}, function(err){ console.log(err); });}

  $scope.send = function(){
    $ionicLoading.show();
    apiService.post("vermifugo/postVermifugo/", $scope.medicamento, function(res){
      $ionicLoading.hide();
      console.log(res);
      var confirmPopup = $ionicPopup.alert({ title: "Cadastrado com Sucesso!", okText: 'ok' });
      confirmPopup.then(function(){
        medicamentos.push(res.data);
        localService.setMedicamentos({list:medicamentos});
        $ionicHistory.goBack(); //$state.go("app.medicamentos", { 'petId': res.data.idPet });
      });
    }, function(err){
      $ionicLoading.hide();
      console.log(err);
    });
  }
})

.controller('MinhaContaCtrl', function($scope, $stateParams, $state, localService) {
  $scope.user = localService.getUsuario();
})

.controller('NovaContaCtrl', function($scope, $stateParams, $state, $ionicLoading, localService, apiService, $ionicPopup, validationService, $ionicHistory) {
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
            $ionicHistory.nextViewOptions({
              historyRoot: true
            });
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
