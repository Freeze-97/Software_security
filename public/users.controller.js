
angular.module('usersApp', []) 
    .controller('allUsersController', function allUsersController($scope, $http, $window) { 
                
        //Visa alla meddelande för användare 
        $scope.getMessages = function(){
            $http.get('/all/messages').then(

                //Få alla meddelande
                function successCallback(response){
                    $scope.messages = response.data.messages;
                },

                //Om något gick fel 
                function errorCallback(response){
                    console.log("Error getting the messages: response = " + JSON.stringify(response));
                }
            )
        };

        // Redirect till deleteMessage.html
        $scope.goToDeleteMessageSite = function(){
            $http.get('deletemessage/check').then(

                // Om användare är inloggad 
                function successCallback(response){
                    $window.location.href='/deletemessage';
                },

                // Om något gick fel 
                function errorCallback(response){
                    confirm(response.data.message); 
                }
            )
        }; 

        // Redirect till index.html 
        $scope.goToLogInPage = function(){
            $http.get('login/check').then(

                // Om användare är inloggad 
                function successCallback(response){
                    $window.location.href='/login'; 
                },

                // Om något gick fel 
                function errorCallback(response){
                    confirm(response.data.message); 
                }
            )
        }

        // Lägga till ett nytt meddelande 
        $scope.addMessage = function(){

            // Meddelande's innehåll 
            const body = {
                content: $scope.content,
                numberOfVotes: 0
            }

            // Försök lägga till det nya meddelande 
            $http.post('/messages/add', body).then(
                function successCallback(response){
                    $scope.getMessages(); 
                },

                // Om något gick fel 
                function errorCallback(response){
                    confirm(response.data.message); 
                }
            )
            
            // Töm text-field 
            $scope.content = null;
        }; 

        // Vote up meddelande  
        $scope.voteUp = function(id){

            // Uppdatera information på websida 
            for(var i = 0; i < $scope.messages.length; i++){
                if($scope.messages[i].id == id){
                    $scope.messages[i].id++; 
                    break; 
                }
            }

            // Uppdatera information i databasen 
            $http.put("/messages/voteup/"+id).then(
                function successCallback(response){
                    $scope.getMessages(); 
                },
                function errorCallback(response){
                    confirm(response.data.message); 
                }
            )
        }; 

        // Vote down meddelande 
        $scope.voteDown = function(id){

            // Uppdatera information på websida 
            for(var i = 0; i < $scope.messages.length; i++){
                if($scope.messages[i].id == id){
                    $scope.messages[i].id--; 
                    break; 
                }
            }

            // Uppdatera information i databasen 
            $http.put("/messages/votedown/"+id).then(
                function successCallback(response){
                    $scope.getMessages(); 
                },
                function errorCallback(response){
                    confirm(response.data.message); 
                }
            )
        }; 

        //Hämta information om alla meddelande
        $scope.getMessages();    
    }
);