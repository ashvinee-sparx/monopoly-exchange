(function(){
  'use strict';

  angular
    .module('mxApp', [
      'ui.router',
      'firebase',
      'ngCookies'
    ])
    .constant('FIREBASE_REF', 'https://monopoly-exchange.firebaseio.com/')
    .config([ '$locationProvider', '$stateProvider', config ]);

    function config($locationProvider, $stateProvider) {

      // Configure the app's path
      $locationProvider.html5Mode({
        // Disables hashbang mode
        enabled: true,
        // Unrelated to hashbang but avoids $location error
        requireBase: false
      });

      // Setup the template routes/states
      $stateProvider
        .state('home', {
          url: '/',
          controller: 'mainCtrl',
          templateUrl: '/templates/home.html'
        })
        .state('account', {
          url: '/account',
          controller: 'mainCtrl',
          templateUrl: '/templates/account.html'
        })
        .state('userTickets', {
          url: '/my-tickets',
          controller: 'mainCtrl',
          templateUrl: '/templates/user-tickets.html'
        })
        .state('faq', {
          url: '/faq',
          controller: 'mainCtrl',
          templateUrl: '/templates/faq.html'
        });

    }

})();
