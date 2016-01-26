// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var prod = true;

angular.module('starter', [
    'ionic',
    'starter.controllers',
    'starter.services',
    'angularMoment',
    'angular-storage',
    'ngCordova',
    'angular.filter',
    'angular-jwt'
])

// CONFIGURAÇÕES
.constant('CONFIG', {
    GYM_ID: 2,
    GCM_SENDER_ID: '688277362803',
    HTTP_TIMEOUT: 15000,
    WEBSERVICE_URL: (prod) ? 'http://api.asturia.kinghost.net' : 'http://localhost/academia-webservice',
    HOME: '/app/institucional',
    HOME_STATE: 'app.institucional',
    LOGIN_STATE: 'app.login',
    NATIVE_SCROLL: prod
})

.run(function(
    $ionicPlatform,
    $cordovaNetwork,
    $rootScope,
    $cordovaDialogs,
    $state,
    CONFIG,
    store
) {

     $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        if (error === "AUTH_REQUIRED") {
            event.preventDefault();
            $ionicPlatform.ready(function() {
                $cordovaDialogs
                    .confirm('Você deve estar logado, deseja entrar?', 'Área restrita para alunos', ['Agora não', 'Sim'])
                    .then(function(buttonIndex){
                        var btnIndex = buttonIndex;
                        if (btnIndex === 2) {
                            $state.go(CONFIG.LOGIN_STATE);
                        }
                    });
            });
        }
    });

    $rootScope.isOnline = true;

    $ionicPlatform.ready(function() {
        if (prod) {
            $rootScope.isOnline = $cordovaNetwork.isOnline();
            // listen for Online event
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                $rootScope.isOnline = true;
            });
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                $rootScope.isOnline = false;
            });
        }

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
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
.factory('myHttpInterceptor', function($q, CONFIG){
    return {
        request: function(config){
            // config.params = {gym_id: CONFIG.GYM_ID};
            config.timeout = CONFIG.HTTP_TIMEOUT;
            return config;
        }
    };
})

.config(function(
    $httpProvider,
    $stateProvider,
    $urlRouterProvider,
    CONFIG,
    jwtInterceptorProvider,
    $ionicConfigProvider
) {

    // CONFIG IONIC
    if (CONFIG.NATIVE_SCROLL) {
      $ionicConfigProvider.scrolling.jsScrolling(false);
    }
    if (ionic.Platform.isIOS()) {
      $ionicConfigProvider.backButton.text('Voltar');
    }
    // Interceptor to send the JWT for every $http call.
    jwtInterceptorProvider.tokenGetter = function(store, config){
        if (config.url.substr(config.url.length - 5) == '.html') {
            return null;
        }
        return store.get('jwt');
    };

    $httpProvider.interceptors.push('jwtInterceptor');
    $httpProvider.interceptors.push('myHttpInterceptor');

    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })
    .state('home', {
        url: '/home',
        data: {
            requiresLog: false
        },
        templateUrl: 'templates/home.html',
        controller: 'HomeController'
    })
    .state('app.teste', {
        url: '/teste',
        data: {
            requiresLogin: true
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/teste.html'
            }
        }
    })
    .state('app.login', {
        url: '/login',
        cache: false,
        views: {
            'menuContent' : {
                templateUrl: 'templates/login.html',
                controller: 'LoginController'    
            }
        }
    })
    .state('app.esqueci_minha_senha', {
        url: '/esqueci-minha-senha',
        views: {
        	'menuContent': {
		        templateUrl: 'templates/esqueci_minha_senha.html',
		        controller: 'EsqueciMinhaSenhaController'
        	}
        }
    })
    .state('logout', {
        url: '/logout',
        cache: false,
        // templateUrl: 'templates/logout.html',
        controller: 'LogoutController'
    })

    .state('app.institucional', {
        url: '/institucional',
        views: {
            'menuContent': {
                templateUrl: 'templates/institucional.html',
                controller: 'InstitucionalController'
            }
        },
        resolve: {
            data: function(GymConfig){
                return GymConfig.institucional();
            }
        }
    })

    .state('app.aulas', {
        url: '/aulas',
        views: {
            'menuContent': {
                templateUrl: 'templates/aulas.html',
                controller: 'AulasController'
            }
        }
    })
    .state('app.aula', {
        url: '/aula/:aulaId',
        views: {
            'menuContent': {
                templateUrl: 'templates/aula.html',
                controller: 'AulaController'
            }
        }
    })
    .state('app.horarios', {
        url: '/horarios',
        data: {
            requiresLogin: true
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/horarios.html',
                controller: 'HorariosController'
            }
        }
    })
    .state('app.comunicados', {
        url: '/comunicados',
        data: {
            requiresLogin: true
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/comunicados.html',
                controller: 'ComunicadosController'
            }
        }
    })
    .state('app.comunicado', {
        url: '/comunicado/:destaque/:comunicadoIndex',
        data: {
            requiresLogin: true
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/comunicado.html',
                controller: 'ComunicadoController'
            }
        }
    })
    .state('app.ficha', {
        url: '/ficha',
        data: {
            requiresLogin: true
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/ficha.html',
                controller: 'FichaController'
            }
        },
        resolve: {
            authRequire: function(User) {
                return User.authRequire();
            }
        },
    })
    .state('app.configuracoes-de-conta', {
        url: '/configuracoes-de-conta',
        data: {
            requiresLogin: true
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/configuracoes_de_conta.html',
                controller: 'ConfiguracoesDeContaController'
            }
        }
    })
    .state('app.alterar-senha', {
        url: '/alterar-senha',
        data: {
            requiresLogin: true
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/alterar_senha.html',
                controller: 'AlterarSenhaController'
            }
        }
    })
    .state('app.caixa-de-sugestoes', {
        url: '/caixa-de-sugestoes',
        resolve: {
            authRequire: function(User) {
                return User.authRequire();
            }
        },
        views: {
            'menuContent': {
                templateUrl: 'templates/caixa_de_sugestoes.html',
                controller: 'CaixaDeSugestoesController'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(CONFIG.HOME);
});
