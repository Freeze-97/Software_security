
angular.module('deleteUsersApp', []) 
    .controller('deleteUsersController', function deleteUsersController($scope, $http) {

        //Få information om alla användare 
        $scope.getMessages = function(){
            $http.get('/messages/user') 
            .then(function successCallback(response) {

                $scope.messages= response.data.messages;
            },  

            //Om något blir fel 
            function errorCallback(response) { 
                console.log("Error, response=" + JSON.stringify(response));
            });
        };
        
        // Ta bort ett specifikt meddelande från database 
        $scope.deleteMessage = function(id){

            // Ta bort ett specifikt meddelande från websida 
            for(var i = 0; i < $scope.messages.length; i++){
                if($scope.messages[i].id == id){
                    $scope.messages.splice(i, 1); 
                    break; 
                }
            }

            // Försök att ta bort ett specifikt meddelande från database 
            $http.delete("/messages/"+id).then(
                function successCallback(response){
                    $scope.getMessages(); 
                },
                
                // Om något gick fel 
                function errorCallback(response){
                    confirm("Error, cannot delete the message"); 
                }
            )
        }

        //Hämta alla information om alla anställda
        $scope.getMessages();
    }
);
