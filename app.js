
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var config = require('./utils/config.js');
var User = require('./models/userModel.js');

mongoose.connect(config.development.dbUrl);
var app = express();

//Settings for passport

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err, user);
	});
});

passport.use(new facebookStrategy({
	clientID: config.development.facebook.appId,
	clientSecret: config.development.facebook.appSecret,
	callbackURL: config.development.facebook.siteURL + "fbAuthed"
	},
	function(accessToken, refreshToken, profile, done){
		process.nextTick(function(){
			var query = User.findOne({'fbId': profile.id});

			query.exec(function(err, oldUser){
				if(oldUser){
					console.log("User found : " + oldUser.name + " and logged in!");
					done(null, oldUser);
				}else{

					var user = new User({fbId: profile.id, name: profile.displayName, emailId: profile.emails[0].value});
					user.save(function(err){ 
					if(err) {console.log(err);}	
					console.log("New User : " + user.name + " created and logged in!");
					done(null, user);
				});

				}
			});
		});
	}


));


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser()); //Added
app.use(express.bodyParser()); //added
app.use(express.session({secret: 'This is session!'})); //Added
app.use(passport.initialize()); //Added
app.use(passport.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/fbauth', passport.authenticate('facebook', {scope: 'email'}));
app.get('/fbAuthed', passport.authenticate('facebook', {failureRedirect: '/'}), routes.loggedIn);
app.get('/logout', function(req, res){
	req.logOut();
	res.redirect('/');
});
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});