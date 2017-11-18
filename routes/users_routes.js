var bcrypt = require('bcryptjs');
var db  = require('../models');
var express = require('express');
var router  = express.Router();

//this is the users_controller.js file
router.get('/new', function(req,res) {
	res.render('user/new');
});

router.get('/sign-in', function(req,res) {
	res.render('user/sign_in');
});

router.get('/sign-out', function(req,res) {
  req.session.destroy(function(err) {
     res.redirect('/person');  // the name of the routes come from Amber html page
  })
});

//if user trys to sign in with the wrong password or email tell them that on the page
router.post('/login', function(req, res) {
  
  // this is same as select * from users where email = 'the email the user typed in' limit 1
  db.User.findOne({
    where: {email: req.body.email}
  }).then(function(user) {
  		res.send(user);
  		
		if (user == null){
		  res.redirect('/user/sign-in')  //the users/sign-in is just an example and can be any name
		}

	// password_has somes from user data model. At the moment this column is not inside 
	// the user data model

    bcrypt.compare(req.body.password, user.password_hash, function(err, result) {
        if (result == true){

          req.session.logged_in = true;
          req.session.user_id = user.id;
          req.session.user_email = user.email;

          res.redirect('/person');
        }else{
		      res.redirect('/user/sign-in')
		    }
    });
  })
});

router.post('/create', function(req,res) {
	/* this is same as
		SELECT *
		FROM users
		WHERE email = 'email the user typed in'
	*/
	db.User.findAll({
    where: {email: req.body.email}
  }).then(function(users) {
  		res.send(users);

		if (users.length > 0){
			console.log(users);
			res.send('The email or username already exists for this account');
		}else{

			// hash the password

			bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(req.body.password, salt, function(err, hash) {
						db.User.create({
							email: req.body.email,
							password_hash: hash
						}).then(function(user){

							req.session.logged_in = true;
							req.session.user_id = user.id;
							req.session.user_email = user.email;

							res.redirect('/person')
						});
					});
			});

		}
	});
});

module.exports = router;
