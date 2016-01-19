angular.module('starter.controllers', [])

.controller('AppCtrl', function(
    $scope,
    $rootScope,
    Notification,
    User,
    store
) {
    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.menuIcons = {
            comunicados: 'ion-flag',
            aulas: 'ion-arrow-graph-up-right',
            ficha: 'ion-clipboard',
            horarios: 'ion-android-time',
            institucional: 'ion-android-time',
        };
        User
            .authData()
            .then(function(data){
                console.log(data);
                $rootScope.authData = data;
            });

        /**
         * Toda vez que entrar em uma view eu verifico se eu já enviei o meu DEVICE REG ID
         * após o envio e a resposta positiva salvamos local que o device já está registrado,
         * apesar de executar toda entrada de view só é feito o contato com o servidor
         * caso o cache local diga que este device ainda não foi registrado
         */
        Notification.register();
    });
})
.filter('weekdayHumanize', function(Weekdays) {
    return function(input) {
        var names = Weekdays.get();
        return Weekdays.getByIndex(input).name;
    };
})
.filter('getWeekdayNameByIndex', function(Weekdays) {
    return function(input) {
        var weekday = Weekdays.getByIndex(input);
        return weekday.name;
    };
})
.directive('itemListAula', function(){
    return {
        templateUrl:  'templates/Element/item_list_aula.html',
        scope: {
            'aula': '=content'
        }
    };
})
.directive('myNetworkAlert', function(){
    return {
        templateUrl:  'templates/Element/network_alert.html',
    };
})
.directive('fillContentHeight', function($window){
    return {
        restrict: 'C',
        link: function(scope, element){
            function fillHeight() {
                var windowH = $window.innerHeight;
                var content = document.getElementsByClassName('scroll-content');
                var scrollBar = document.getElementsByClassName('scroll-bar');
                console.log(scrollBar.length);
                if (scrollBar.length > 1) {
                  // content[0].removeChild(scrollBar[0]);
                }
                var finalH = (windowH - 44);
                finalH = (ionic.Platform.isIOS()) ? finalH - 15 : finalH;
                element[0].style.height = finalH + 'px';
            }
            fillHeight();
            $window.addEventListener("resize", fillHeight);

            // document.getElementsByClassName('scroll')[0].remove();
            ///document.getElementsByClassName('scroll-bar-v')[0].style.visibility = 'hidden';
        }
    };
})
.controller('HomeController', function(
    $scope,
    $ionicModal,
    $ionicLoading,
    $window
) {
    $window.localStorage.clear();
})
.controller('LogoutController', function(
    $scope,
    $timeout,
    $ionicLoading,
    CustomState,
    User
) {

    var delay = 1500;
    $ionicLoading.show({template: 'Saindo, aguarde...'});
    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $timeout(function(){
            User
                .logout()
                .then(function(homeState){
                    $ionicLoading.hide();
                    CustomState.goRoot(homeState);
                });
        }, delay);
    });
})
.controller('EsqueciMinhaSenhaController', function(
    $scope,
    $ionicLoading,
    User
) {

    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.form = {};
        $scope.wrongCredentials = false;
    });

    $scope.requestPasswordReset = function(){
        $ionicLoading.show({template: 'Enviando, aguarde...'});
        User
            .requestPasswordReset($scope.form)
            .then(function(){
                $scope.form.email = null;
            })
            .finally(function(){
                $ionicLoading.hide();
            });
    };
})
.controller('LoginController', function(
    $scope,
    $state,
    $ionicLoading,
    User,
    $window
) {

    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.form = {};
    });

    $scope.doLogin = function(){
        $ionicLoading.show({template: 'Entrando, aguarde...'});
        User
            .login($scope.form)
            .finally(function(){
                $ionicLoading.hide();
            });
    };
})
.controller('HorariosController', function($scope,
    $ionicModal,
    $stateParams,
    $state,
    Aulas,
    Horarios,
    Weekdays
) {
    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.horarios = Horarios.getLocalData();
        $scope.loading = !$scope.horarios;
        console.log($scope.horarios);

        Horarios
            .getServerData()
            .then(function(data){
                $scope.horarios = data;
            })
            .finally(function(){
                $scope.loading = false;
            });
    });

    $scope.weekdays = Weekdays.get();
    $scope.weekdayIndex = 1;

    $scope.changeTab = function(weekday){
        $scope.weekdayIndex = weekday;
    };
    $scope.getWeekdayByIndex = function(index){
        return Weekdays.getByIndex(index);
    };
    $ionicModal.fromTemplateUrl('templates/Modal/aula.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function(aula) {
        $scope.aula = Aulas.get('id', aula.id);
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.doRefresh = function() {
        Horarios
            .getServerData()
            .then(function(data){
                $scope.horarios = data;
            })
            .finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
    };
})

.controller('AulasController', function($scope, $ionicModal, Aulas) {

    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.aulas = Aulas.getLocalData();
        $scope.loading = !$scope.aulas;
        $scope.aula = {};//Serve para a aula que vai aparecer no modal

        Aulas
            .getServerData()
            .then(function(data){
                console.log(data);
                $scope.aulas = data;
            })
            .finally(function(){
                $scope.loading = false;
            });

    });

    $ionicModal.fromTemplateUrl('templates/Modal/aula.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function(aula) {
        $scope.aula = aula;
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    $scope.changeTab = function(index){
        $scope.currentTab = index;
    };

    $scope.doRefresh = function() {
        Aulas
            .getServerData()
            .then(function(data){
                $scope.aulas = data;
            })
            .finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
    };
})

.controller('AulaController', function(
  $scope,
  $stateParams,
  Aulas
) {
    $scope.aula = Aulas.get('id', $stateParams.aulaId);
})

.controller('ConfiguracoesDeContaController', function($scope) {

})
.controller('AlterarSenhaController', function(
    $scope,
    $ionicLoading,
    User
) {
    $scope.form = {};
    $scope.formError = null;

    $scope.doSubmit = function(){
        $ionicLoading.show({template: 'Alterando senha, aguarde...'});
        console.log($scope.form);
        User
            .changePassword($scope.form)
            .then(function(result){
                $scope.form = {};
            })
            .finally(function(){
                $ionicLoading.hide();
            });
    };
})

.controller('FichaController', function(
    $scope,
    $stateParams,
    $ionicModal,
    Fichas
) {
    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.ficha = Fichas.getLocalData();
        $scope.loading = !$scope.ficha;
        // Só puxa do server se não tiver nenhuma.. fiz isso diferente das outras
        // paginas pq aqui eh diferente soh de tempos em tempos que muda e tb
        // pq estava bugando as marcações das checkboxes
        if (!$scope.ficha) {
            Fichas
                .getServerData()
                .then(function(data){
                    $scope.ficha = data;
                })
                .finally(function(){
                    $scope.loading = false;
                });
        }
    });

    $scope.exercisesColumns = Fichas.getExercisesColumns();

    $scope.currentTab = 0;

    $scope.clearCheckboxes = function(){
        // $cordovaDialogs.confirm(
        //     'Tem certeza que deseja limpar todas as seleções dos exercícios deste grupo?',
        //     'Limpar seleções',
        //     ['Limpar', 'Cancelar'])
        //     .then(function(buttonIndex) {
        //         if (buttonIndex == 1) {
        //             angular.forEach($scope.ficha.exercises[$scope.currentTab], function(value){
        //                 value.checked = false;
        //             });
        //         }
        //     });
    };

    $ionicModal.fromTemplateUrl('templates/Modal/ficha_detalhes.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    $scope.changeTab = function(index){
        $scope.currentTab = index;
    };

    $scope.doRefresh = function() {
        Fichas
            .getServerData()
            .then(function(data){
                $scope.ficha = data;
            })
            .finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
    };
})

.controller('ComunicadosController', function(
    $scope,
    Comunicados
) {
    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.comunicados = Comunicados.getLocalData();
        $scope.loading = !$scope.comunicados;

        Comunicados
            .getServerData()
            .then(function(data){
                $scope.comunicados = data;
            })
            .finally(function(){
                $scope.loading = false;
            });
    });

    $scope.doRefresh = function() {
        Comunicados
            .getServerData()
            .then(function(data){
                console.log(data[1]);
                $scope.comunicados = data;
            })
            .finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
    };
})
.controller('ComunicadoController', function($scope, $stateParams, Comunicados) {
    $scope.comunicado = Comunicados.getLocalData()[$stateParams.destaque][$stateParams.comunicadoIndex];
})
.controller('CaixaDeSugestoesController', function(
    $ionicLoading,
    $scope,
    $timeout,
    CaixaDeSugestoes
) {
    var delay = 1500;
    $scope.sugestao = {};

    $scope.send = function(sugestao){
        $ionicLoading.show({
            template: 'Enviando, aguarde...'
        });
        $timeout(function(){
            CaixaDeSugestoes
                .send(sugestao)
                .then(function(){
                    $scope.sugestao = {};
                })
                .finally(function(){
                    $ionicLoading.hide();
                });
        }, delay);
    };
})

.controller('InstitucionalController', function(
    $scope,
    CustomState
) {
    $scope.goExternal = function(url) {
        CustomState.goExternal(url);
    };
});
