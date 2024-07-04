// Importera
const express = require("express"),
      path = require("path"),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      session = require('express-session'),
      cookieParser = require('cookie-parser'),
      csurf = require('csurf'),
      Users = require('./models/users.js'),
      Messages = require('./models/messages.js');      

//Anslutning till Mongodb
mongoose.connect("mongodb+srv://Jingzhong1234:Jingzhong1234@dt162g.vd9jr.mongodb.net/data?retryWrites=true&w=majority",
{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify: false });    

// Skapa en instans av express
const app = express();


// Skapa statisk sökväg
app.use(express.static(path.join(__dirname, 'public')));

// Port för anslutning
const port = process.env.PORT || 3000;

// Session 
app.use(session({
    secret: "mysecret",
    resave: true, 
    saveUninitialized: true,
    cookie:{
        httpOnly: true
    }
})); 

//Body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); 

//Lägg till "Access-Control-Allow-Origin"
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
    next();
  });

// Starta servern
app.listen(port, function(req, res) {
    console.log("Server running on port " + port);
});

/** 
// Förhindra CSRF-attack 
app.use(csurf()); 
 
// Generera CSRF-token
app.use((req, res, next)=>{
    res.cookie("XSRF-TOKEN", req.csrfToken());  
    next(); 
});
**/

// Ladda alla meddelande from databasen 
function getMessages(req, res){

    // Få fram alla meddelande alla användare har postat tidigare 
    Messages.find().exec( (error, data) =>{
        if(error){
            res.status(400).send({message: "Error, fail to get messages"});  
        }else{

            // Om det finns minst ett meddelande som sparas i databasen 
            if(data.length > 0){
                var obj = {"messages": data};
                res.status(200).json(obj);
             
            // Om databasen innehåller 0 st meddelande    
            }else{
                res.status(400).send({message: "Error, the collection doesn't contain any message"});             
            }
        }
    });
}

// När användare loggar in 
function logIn(req, res){

    // Kolla om användarnamn användare har matat in existrerar i databasen 
    Users.find({userName: req.body.userName}).exec((error, user)=>{
        if(error){
            res.status(400).send({message: "Error, cannot get information about the user"}); 
        }else{

            // Om användarnamn hittas i databasen 
            if(user.length > 0){  

                // Convertera lösenord till hash value 
                var pass = req.body.password;
                var crypto = require('crypto');
                var hash = crypto.createHash('sha512').update(pass).digest('hex');
              
                // Om användare har matat in rätt lösenord 
                if(user[0].password == hash){
            
                    // Användarnamn sparas i session 
                    req.session.username = req.body.userName; 
                    res.status(200).send();

                // Om användare har matat in fel lösenord eller användarnamn    
                }else{
                    res.status(400).send({message: "Invalid username or password"});
                }
                
            // Om användare inte har loggat in     
            }else{
                res.status(400).send({message: "Invalid username or password"}); 
            }
        }
    });
}

// Redirect till home.html 
app.get('/home', function(req, res){
    res.redirect("/home.html");
}); 

// Kontrollera om användare är inloggad om användare vill gå till deleteMessage.html
app.get('/deletemessage/check', function(req, res){

    // Om användare är inloggad 
    if(req.session.username){
        res.status(200).send(); 
      
    // Om användare inte är inloggad     
    }else{
        res.status(400).send({message: "You need to sign in"}); 
    }
}); 

// Redirect till deleteMessage.html 
app.get('/deletemessage', function(req, res){
    res.redirect("/deleteMessage.html"); 
})

// Kontrollera om användare är inloggad om användare vill logga ut 
app.get('/login/check', function(req, res){

    // Om användare är inloggad 
    if(req.session.username){

        // Ta bort data som sparas i session 
        req.session.destroy(); 

        // Ta om att användare är inloggad 
        res.status(200).send(); 

    // Om användare inte är inloggad     
    }else{
        res.status(400).send({message: "You are not logged in yet"}); 
    }
}); 

// Redirect till index.html 
app.get('/login', function(req, res){
    res.redirect("/index.html"); 
}); 


// Lägga till ett meddelande 
app.post('/messages/add', (req, res)=>{
   
    // Om användre är inloggad 
    if(req.session.username){

        // Data om det nya meddelanden  
        var newMessage = {};  
        newMessage.userName = req.session.username; 
        newMessage.content = req.body.content; 
        newMessage.numberOfVotes = req.body.numberOfVotes; 
    
        // Variabel som kontrollerar om användares inmatningar är giltig
        var inputOk = true; 
        
        // Variabel som visar användare vilka data inte är giltiga 
        var str = ""; 

        // Kontrollera om meddlande's innehåll är tom  
        if(newMessage.content == null){
            inputOk = false; 
            str += "Empty message"; 
        }

        // Om det är ett tomt meddelande 
        if(!inputOk){
            res.status(400).send({message: str + ", please re-enter the message."});

        //Om användares inmatningar är giltiga     
        }else{
  
            Messages.find().exec((error, data)=>{
                if(error){
                    res.status(400).send({message: "cannot get the size of the collection"});
                }else{
                    if(data.length > 0){

                        // Beräkna det nya meddelanden's id
                        var lastMessageID = data[data.length-1].id + 1; 

                        // Spara meddelande 
                        var message = new Messages({
                            userName: newMessage.userName,
                            content: newMessage.content,
                            id: lastMessageID,
                            numberOfVotes: newMessage.numberOfVotes
                        }); 
                        message.save();
                        res.redirect("/");
                    } 
                }
            });
        }

    // Om användare inte är inloggad     
    }else{
        res.status(400).send({message: "Please log in first"}); 
    }
});

//Ta bort ett specifikt meddelande en specifik användare har postat tidigare 
app.delete('/messages/:id', (req, res)=>{

    // Om användare är redan inloggad 
    if(req.session.username){
        
        // Ta bort ett specifik meddelande 
        Messages.deleteOne({id: req.params.id}).exec((error, obj)=>{
            if(error){
                res.status(400).send({message: "Fail to delete the message"}); 
            }
        }); 
        res.status(200).send({message: "The message was succesfully deleted"});

    // Om användare inte är inloggad     
    }else{

        res.status(400).send({message: "You need to sign in"}); 
    } 
});

// Endpoints som returnerar alla meddelande en specifik användare har postat 
app.get('/messages/user', (req, res)=>{

    // Om användare är inloggad 
    if(req.session.username){

        // Hitta alla meddeland användare har postat tidigare 
        Messages.find({userName: req.session.username}).exec((error, messages)=>{
            if(error){
                res.status(400).send({message: "Error, fail to get the messages"});  
            }else{
                
                // Skicka tillbaka alla meddelande 
                if(messages.length > 0){
                    var obj = {"messages": messages}; 
                   res.status(200).json(obj); 
                
                // Om användare inte har postat något meddelande tidigare, alltså 0 meddelande    
                }else{
                    res.status(400).send({message: "Error, the collection doesn't contain any message"}); 
                }
            }
        }); 

    // Om användare inte är inloggad     
    }else{
        res.status(400).status({message: "Please log in first"}); 
    }
});

//Uppdatera vote's värde(vote up)
app.put('/messages/voteup/:id', (req, res)=>{

    // Om användare är inloggad 
    if(req.session.username){

            // Hitta det meddelanden användare har klickat på 
            Messages.find({id: req.params.id}).exec((error, message)=>{
            if(error){
                res.status(400).send({message: "Fail to get the message"}); 

            // Om vi har hittat meddelanden     
            }else{
                if(message.length > 0){

                    // Vote's värde ökas med 1 
                    var votes = message[0].numberOfVotes + 1; 

                    // Uppdatera vote's värde 
                    Messages.findOneAndUpdate(
                        {"id": req.params.id},
                        {"numberOfVotes": votes},
                        function(error, result){
                            if(error){
                                res.status(400).send({message: "Error, fail to update the message"}); 
                            }else{
                                res.status(200).send({message: "The message has been updated"}); 
                            }
                        }
                    )
                
                // Om meddelande inte kan hittas     
                }else{
                    res.status(400).send({message: "Cannot find the message"}); 
                }
            }
        }); 
    
    // Om användare inte är inloggad     
    }else{
        res.status(400).send({message: "You need to sign in"}); 
    }

});

//Uppdatera vote's värde(vote down)
app.put('/messages/votedown/:id', (req, res)=>{
    
    // Om användare är inloggad 
    if(req.session.username){

        //Hitta meddelande som användare har klickat på 
        Messages.find({id: req.params.id}).exec((error, message)=>{
            if(error){
                res.status(400).send({message: "Fail to get the message"}); 
    
            }else{

                //Om vi har hittat meddelande 
                if(message.length > 0){

                    // Vote's värde minskas med 1 
                    var votes = message[0].numberOfVotes - 1; 

                    // Hitta meddelande och uppdatera vote's värde 
                    Messages.findOneAndUpdate(
                        {"id": req.params.id},
                        {"numberOfVotes": votes},
                        function(error, result){
                            if(error){
                                res.status(400).send({message: "Error, fail to update the message"}); 
                            }else{
                                res.status(200).send({message: "The message has been updated"}); 
                            }
                        }
                    )

                // Om meddelande inte kan hittas     
                }else{
                    res.status(400).send({message: "Cannot find the message"}); 
                }
            }
        }); 

    // Om användare inte är inloggad     
    }else{
        res.status(400).send({message: "Please log in first"}); 
    }
});

//Endpoints som returnerar alla meddelande 
app.get('/all/messages', getMessages);

//Endpoints som används när användare loggar in 
app.post('/login', logIn); 

/** 
//Error handler(csrf)
app.use((err, req, res, next)=>{
    if(err.code !== 'EBADCSRFTOKEN'){
        return next(err); 
    }
    res.status(403).send({message: "Session has expired or form tampered with"}); 
}); 
**/
  