// require the modules we will need for our routes
var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');

/*when user enters localhost:3000/login the application comes here*/ 
router.get('/login', function(req, res){
	console.log(req.user);
	if (req.user) return res.redirect('/');

	res.render('accounts/login', { message: req.flash('loginMessage') });

});

/* when the user submis the login credentials the application comes here*/
router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/profile',
	failureRedirect: '/login',
	failureFlash: true
}));

/*when user enters localhost:3000/profile or logs-in the application comes here*/ 
router.get('/profile', function(req, res, done){
	/* retrieve the login user from the database */ 
	User.findOne({ _id: req.user._id}, function(err, user){
		
		if(err) return next(err);
		/* redirect the user to the profile page */ 
		res.render('accounts/profile', {user: user});
	});
});

/*when user enters localhost:3000/signup the application comes here*/
router.get('/signup', function(req, res, next){
	res.render('accounts/signup', {
		errors: req.flash('errors')
	});
});

/*when user submits signup details the application comes here*/ 
router.post('/signup', function(req, res, next){

	/* get our mongoose model to create a new User object*/
	var user = new User();

	/* populate the user properties based on what the user submits. 
	The req.body.. parameters have to match the form parameters in the signup.ejs */
	user.profile.name = req.body.name;
	user.profile.picture = user.gravatar();
	user.password = req.body.password;
	user.email = req.body.email;
	user.address = req.body.address;
	
	/* fetch user and test if they exist */
	User.findOne({email: req.body.email}, function(err, existingUser){
		/* check if the user already exists */
		if (existingUser) {
			/*return an error message to indicate user already exists*/ 
			req.flash('errors', 'Account with that email address already exists');
			/* redirect the user back to signup page with the error */ 
			return res.redirect('/signup')
		}else{
			/* save the user to the database if there is no error.
			Note that we pass the user object for hashing the password as well*/ 
			user.save(function(err, user){

			if (err) return next(err);

				req.logIn(user, function(err){

					if (err) return next(err);

				 	res.redirect('/profile');
				})
			});
		}
	});
});

/* when user logs out the application comes here */ 
router.get('/logout', function(req, res, next){
	req.logout();
	return res.redirect('/');
});

module.exports = router;