( function(){
  'use strict';

  angular
  .module('mxApp')
  .filter('facebookLink', facebookLink);

  function facebookLink() {

    return function(input) {
      return input.replace("facebook:", "");
    };

  }

})();
