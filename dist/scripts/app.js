'use strict';

var cellsim = angular.module('CellSimModule', [])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix("!");

    $routeProvider
      /*
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })*/
      .when('/view/:id', {
        templateUrl: 'views/viewSim.html',
        controller: 'ViewSimCtrl'
      })
      .otherwise({
        redirectTo: 'view/1'
      });
  }]);
