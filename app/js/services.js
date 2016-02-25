(function(){
  'use strict';

  angular
    .module('mxApp')
    .factory('AccountFactory', ['$firebaseArray', '$firebaseObject', '$cookies', 'FIREBASE_REF', AccountFactory]);

    function AccountFactory($firebaseArray, $firebaseObject, $cookies, FIREBASE_REF) {

      function redirect(location){
        window.location = location;
      }

      var ref = new Firebase(FIREBASE_REF);
      var uid = $cookies.get('mxuser');
      var profile = null;

      function setCookie(name, value, days){

        var expires;

        if (days) {
          var date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          expires = "; expires=" + date.toGMTString();
          document.cookie = name + '=' + value + expires + "; path=/";
        } else {
          expires = "";
          document.cookie = name + "=" + value + expires + "; path=/";
        }

      }

      return {

        facebookLogin: function(){

          ref.authWithOAuthPopup("facebook", function(error, authData) {

            if (error) {

              alert("It looks like your login failed. Please report this error to the site admin if the problem persists.", error);

            } else {

              // The user's id
              uid = authData.uid;

              // the data for the user object being created.
              var user = {
                facebookId: authData.facebook.id,
                created:    Date.now(),
                name:       authData.facebook.displayName,
                avatar:     authData.facebook.profileImageURL
              };

              // Set the user's FB ID as a cookie
              setCookie('mxuser', uid, 1);

              // attempt to get the child in the collection by uid.
              ref.child('users').child(uid).once('value', function(snapshot){

                // if data exists
                if (snapshot.exists()) {

                  // get the ref (in this case /users/uid) and update its content
                  snapshot.ref().update(user);

                } else {

                  // If account doesn't exist, wrap the data in an object with
                  // a member named after the uid so we can pass it as an update
                  // to the parent
                  var payload = {};
                  payload[uid] = user;

                  // get the ref's parent and call update on it.
                  snapshot.ref().parent().update(payload);

                }

              });

              // Once they're logged in, redirect the user to their account page
              redirect('/account');

            }

          });

        },

        userProfile: function(){
          if(uid){
            profile = $firebaseObject(ref.child('users').child(uid));
            return profile;
          }
        },

        emailAdd: function(email){
          var userEmail = email;
          ref.child('users').child(uid).update({
            email: userEmail
          });
        },

        emailDelete: function(){
          ref.child('users').child(uid).child('email').remove();
        },

        logout: function(){
          $cookies.remove('mxuser');
          redirect('/');
        }

      };

    }

})();
