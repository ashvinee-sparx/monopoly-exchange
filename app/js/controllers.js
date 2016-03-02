(function(){
  'use strict';

  angular
    .module('mxApp')
    .controller('mainCtrl', [ '$scope', '$rootScope', '$cookies', '$location', '$firebaseObject', '$firebaseArray', 'FIREBASE_REF', 'AccountFactory', mainCtrl ]);

    function mainCtrl($scope, $rootScope, $cookies, $location, $firebaseObject, $firebaseArray, FIREBASE_REF, AccountFactory){


      // Setup our variables
      var ref = new Firebase(FIREBASE_REF);
      var ticketsRef = new Firebase(FIREBASE_REF + '/tickets');
      var prizesRef = new Firebase(FIREBASE_REF + '/prizes');
      var alertsRef = new Firebase(FIREBASE_REF + '/alerts');
      var uid = $cookies.get('mxuser');
      var ticketsArray = [
        'A500A', 'A501B', 'A502C', 'A503D', 'A504E',
        'B505A', 'B506B', 'B507C', 'B508D', 'B509E',
        'C510A', 'C511B', 'C512C', 'C513D', 'C514E',
        'D515A', 'D516B', 'D517C', 'D518D', 'D519E',
        'E521A', 'E522B', 'E523C', 'E524D', 'E525E',
        'F526A', 'F527B', 'F528C', 'F529D', 'F530E',
        'G531A', 'G532B', 'G533C', 'G534D',
        'H535A', 'H536B', 'H537C', 'H538D',
        'I539A', 'I540B', 'I541C', 'I542D',
        'J543A', 'J544B', 'J545C', 'J546D',
        'K547A', 'K548B', 'K549C', 'K550D',
        'L551A', 'L552B', 'L553C', 'L554D',
        'M555A', 'M556B', 'M557C', 'M558D',
        'N559A', 'N560B', 'N561C', 'N562D',
        'O563A', 'O564B', 'O565C', 'O566D',
        'P567A', 'P568B', 'P569C', 'P570D',
        'Q571A', 'Q572B', 'Q573C', 'Q574D',
        'R575A', 'R576B', 'R577C', 'R578D',
        'S579A', 'S580B', 'S581C', 'S582D',
        'T583A', 'T584B', 'T585C', 'T586D',
        'U587A', 'U588B', 'U589C', 'U590D',
        'V591A', 'V592B', 'V593C', 'V594D',
        'W595A', 'W596B', 'W597C', 'W598D',
        'X599A', 'X600B', 'X601C', 'X602D',
        'Y603A', 'Y604B', 'Y605C', 'Y606D',
        'Z607A', 'Z608B', 'Z609C', 'Z610D',
        '$611A', '$612B', '$614D', '$615E', '$616F', '$617G', '$618H',
        '?619A', '?620B', '?621C', '?622D', '?623E', '?624F', '?625G', '?626H'
      ];

      $scope.uid = uid;
      $rootScope.uid = uid;

      // Detect the view so that we can apply an active class to the nav links
      $scope.getView = function (path) {
        if ( $location.path().substr(0, path.length) === path ) {
          return 'active';
        } else {
          return '';
        }
      };

      // Really basic redirect to manage logged out users and home page
      // TODO: Implement with ui.router $stateChangeStart and $stateChangeSuccess events
      if( $scope.uid === undefined && window.location.pathname !== '/' ){
        window.location = '/';
      } else if ( $scope.uid && window.location.pathname === '/' ) {
        window.location = '/account';
      }

      // Login Service
      $scope.facebookLogin = function(){
        AccountFactory.facebookLogin();
      };

      // Logout Service
      $scope.logout = function(){
        AccountFactory.logout();
      };

      // Profile Service
      $scope.profile = AccountFactory.userProfile();

      // Email Add
      $scope.emailAdd = function(userEmail) {
        AccountFactory.emailAdd(userEmail);
        $scope.email = '';
      };

      // Email Delete
      $scope.emailDelete = function(){
        AccountFactory.emailDelete();
      };

      // List Tickets
      // Filtering done in the view
      $scope.ticketsList = $firebaseArray(ticketsRef);

      // Make sure the ticket number entered is valid
      $scope.validateTicket = function(ticketObj){

        if(!ticketObj.number){
          $scope.invalidTicketMessage = "Oops! Make sure you've entered a number.";
        }

        $scope.ticketForm = ticketObj;

        // Grab ticket number from the ticket form object
        var number = $scope.ticketForm.number;

        // Assign default ticket type
        if($scope.ticketForm.type === undefined){
          $scope.ticketForm.type = false;
        }

        $scope.ticketType = $scope.ticketForm.type;

        // Convert all entries to uppercase
        number = number.toUpperCase();

        // Check entry against valid ticket numbers
        if( ticketsArray.indexOf( number ) >= 0){
          // If the entered ticket matches an index, add it
          $scope.addTicket(number);
          // Make sure the invalid ticket message doesn't display
          $scope.invalidTicketMessage = false;
        } else {
          // Display the invalid ticket message to the user
          $scope.invalidTicketMessage = "Invalid number. Double check your ticket.";
        }

      };

      // Ticket Add
      $scope.addTicket = function(number) {

        $scope.number = number;

        // Get the first character of the ticket number
        $scope.ticketNum = number;
        var firstVal = $scope.ticketNum.charAt(0);

        // Exception for tickets starting with '?' and '$'
        if(firstVal === '?'){
          firstVal = 'ZZZ';
          number = number.replace('?','ZZZ');
        } else if (firstVal === '$') {
          firstVal = 'ZZ';
          number = number.replace('$','ZZ');
        }

        // Prize categories are labeled from A - Z, ZZ, ZZZ which corresponds with
        // the first letter of the ticket so we'll get the
        // ticket set for that prize in the database.
        prizesRef.child(firstVal).once("value", function(snapshot) {

          // Put the prize's ticket numbers into an array
          var ticketSet = snapshot.val().tickets;
          var ticketSetArr = ticketSet.split(" ");
          var prizeName;

          // Loop through array for user's ticket number
          for(var i = 0; i < ticketSetArr.length; i++){
            if( ticketSetArr[i].match(number) ){
              // When a match is made, assign the prize's name to the ticket
              prizeName = snapshot.val().name;
            }
          }

          // If the user is logged in, add the new ticket to the db
          if(uid){

            ticketsRef.push({
              needed:   $scope.ticketType,
              created:  Date.now(),
              num:      $scope.ticketNum,
              user:     uid,
              prize:    prizeName
            });

            // Get the last created ticket ID and pass it to the alert checker
            ref.child('tickets').limitToLast(1).once("child_added", function(snapshot) {
              userTicketAlert( snapshot.key() );
            });

          } else {
            alert("Sorry, it doesn't look like you're logged in");
          }

        // If there's a Firebase error, display it
        }, function(err){
          alert(err);
        });

        // Clear and reset the form
        $scope.ticketForm.$setPristine();
        $scope.ticketForm.$setUntouched();
        $scope.ticketForm.number = '';

      };

      var userTicketAlert = function(ticketId){

        // Gets the obj for the last submitted ticket
        ref.child('tickets').child(ticketId).on('value', function(snapshot){

          var matchingUserIds = [];
          var alertEmails = [];
          var matchingTicketNum = snapshot.val().num;

          if (snapshot.val().needed){

            // Get matching user IDs
            ref.child('tickets').orderByChild('num').equalTo( snapshot.val().num ).on('value', function(ticketSnapshot){
              ticketSnapshot.forEach(function(snap){
                matchingUserIds.push(snap.val().user);
              });
            });

            // Get emails
            ref.child('users').on('value', function(snapshot){
              snapshot.forEach(function(childSnapshot) {

                angular.forEach(matchingUserIds, function(value, key) {
                  if(childSnapshot.key() === value) {
                    var email = childSnapshot.val().email;
                    alertEmails.push(email);
                  }
                });

              });

              // Check for duplicate email addresses and remove them
              alertEmails = alertEmails.filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
              });

              // Create the alert
              alertsRef.push({
                emails:     alertEmails.join(', '),
                users:      matchingUserIds,
                ticket:     matchingTicketNum,
                date:       Date.now(),
                sent:       false,
              });

            });

          } else {
            // Bail if the submitted ticket isn't a "needed" ticket
            return;
          }

        });
      };

      // Ticket Deleted
      $scope.deleteTicket = function(ticket){
        if (confirm("Are you sure?")) {
          ref.child('tickets').child(ticket.$id).remove();
        }
      };

    }


})();
