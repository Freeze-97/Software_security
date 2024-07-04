var mongoose = require("mongoose"); 
var Schema = mongoose.Schema; 

var usersSchema = new Schema({
    userName: {type: String, required: true},
    password: {type: String, required: true},
}); 

module.exports = mongoose.model("Users" ,usersSchema); 
