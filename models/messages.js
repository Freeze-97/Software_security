var mongoose = require("mongoose"); 
var Schema = mongoose.Schema; 

var messagesSchema = new Schema({
    userName: {type: String, required: true},
    id: {type: Number, required: true},
    content: {type: String, required: true},
    numberOfVotes: {type: Number, required: true},
}); 

module.exports = mongoose.model("Messages", messagesSchema);