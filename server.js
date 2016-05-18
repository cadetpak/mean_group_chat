// loads express module
var express = require('express');
//add this AFTER installing in body-parser
var bodyParser = require('body-parser');
// you need this to make paths ..
var path = require('path');
//creates new variable users which will hold all our sucessfully registered users
var users = [];
//creates new variable messages which will hold all our posted messages
var messages = [];
//invokes express 
var app = express();
// sets variable 'is_user' as a function that when given 'user' as parameter ... 
var is_user = function(user){
	// enter loop for the users array .. 
	for (var i = 0; i < users.length; i++){
		// checks if the user sent through parameter is one of the users in the users array .. if so .. 
		if (user == users[i]){
			console.log("I checked if this input name is one of our current users with the IS_USER method, and this user name is already taken!")
			return true;
		}
	}
	// else if the user (name) is not already in there .. 
	console.log("I checked if this input name is one of our current users with the IS_USER method, and this user name is NOT taken -- welcome new user!!!")
	return false;
	// jump back to 'page_load'
}


// (The following must be set in THIS order RIGHT after var app = express(); -- A. Selects our port and listens)
var server = app.listen(8000, function() {
	console.log("Listening on port 8000!");
});
// B. Creates the IO variable
var io = require('socket.io').listen(server);
// // C. Sets Sockets IO line (done!) now ALL of your Socket Code will go afterwards!
io.sockets.on('connection', function (socket) {

	// 2. when 'page_load' is triggered and sent the input name as variable 'user' ... 
	socket.on("page_load", function(data){
		// immediately runs the is_user function 
		// if running the is_user returns the user-variable as true ... 
		if (is_user(data.user) === true){
			// run 'exiting_user' on index.ejs and send this error message
			socket.emit("existing_user", {error: "This user already exists"})
		}
		// else if user is new .. 
		else{
			// push into the users array, this users data we just got back from is_user
			users.push(data.user);
			// then run the 'load_messages' on index.ejs whiel sending current user data as 'current_user' and all messages in array
			socket.emit("load_messages", {current_user: data.user, messages: messages})
		}
	})
	// when new message is sent in form through (data)..
	socket.on("new_message", function(data){
		// push into the empty messages array the pertinent data
		messages.push({name: data.user, message: data.message})
		// trigger to emit 'post_new_message' in index.ejs and send as data (variable new_message which echos back the submitted info)
		io.emit("post_new_message", {new_message: data.message, user: data.user})
	})
	
})
// need this to use body-parser
app.use(bodyParser.urlencoded());
// handles static content
app.use(express.static(path.join(__dirname, "./static")));
// sets up EJS and views folder
app.set('views', path.join(__dirname, 'views'));
// need for EJS
app.set('view engine', 'ejs');
// ROOT route, that renders index.ejs
app.get('/', function(req, res) {
	res.render('index');
});






