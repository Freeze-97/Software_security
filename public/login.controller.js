
angular.module('logInsApp', []) 
.controller('logInsController', function logInsController($scope, $http, $window) {

    // Log in 
    $scope.logIn = function(){

        // Användarnamn och lösenord lagras i body 
        const body ={
            userName: $scope.username,
            password: $scope.password
        };

        // Försök att logga in 
        $http.post('/login', body).then(

            // Om användare har matat in rätt användarnamn och lösenord 
            function successCallback(response){
                $window.location.href='/home';
            },

            // Om användarnamn eller lösenord är felaktig 
            function errorCallback(response){
                confirm("Error, " + response.data.message); 
            }
        ); 

        // Nollställ input-field
        $scope.username = null; 
        $scope.password = null; 
    };
    
}
);
