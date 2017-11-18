var db       = require("../models");
var express  = require("express");
var passport = require('passport');

var NewsAPI    = require('newsapi');
var newsapi    = new NewsAPI('f73f0f2a2ab7465db203fc11b279c500');
var cron = require('node-cron');

var router   = express.Router();

// for adding categories
// db.Category.create({
//   title: catTitle,
//   route: catTitle.replace(/\s+/g, "").toLowerCase()
// }).then(function(data){
//   console.log(data);
// })

// hack for console error
router.get("favicon.ico", function(request, response) {
  response.status(204);
});

// views ==============================================

// display all categories on homepage 
router.get("/", function(req, res) {
  db.Category.all().then(function(data) {
    var dbCategories = [];
    for (var instance in data) {
      dbCategories.push(data[instance].dataValues);
    }

  //console.log("cate", data);
    var hdlbars = {
        categories: dbCategories,
        currentUser: getCurrentuserId(req),
        isLoggedIn: req.isAuthenticated()

        // get user data from session
    }
    //console.log("cat", hdlbars);
    res.render("index", hdlbars);
  })
});

// account page view for logged in user
router.get("/account", function(req, res) {
  //console.log(">>>>>>",req.params.id)
  // only do this for use that is logged in

  if(req.isAuthenticated()){
    //console.log("current user: ",req.session.passport.user)
    db.User.findById(req.session.passport.user).then(function(data) {
      console.log('userdata: ', data)
      var hdlbars = {
          user: data.dataValues,
          isLoggedIn: req.isAuthenticated()
      }
      //console.log("\n <<<<<<<<< user: hdlbars ", hdlbars);
      //console.log("cat", hdlbars);
      res.render("account", hdlbars);
    })
  } else{
      res.redirect('/');
  }
});

router.put("/account/profile", function(req, res) {
    console.log("inside profile")
    console.log(req.body.username);
    console.log(req.session.passport.user)
      db.User.update(
      {
        username: req.body.username,
        location: req.body.location,
        fullname: req.body.fullname
      },
        {where: {id:req.session.passport.user}},
        //image:  req.body.image,
        //include: [db.User] //where id: req.params.userId:
      ).then(function(dbPost) {
        console.log("\n>>>> dbPost",dbPost);
        res.json(dbPost);
      });
});



// logout of user account
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


// RESTFUL ROUTES  for posts ==============================================

// get all post that are assiociated with category ID for categor feed. √
router.get("/category/:category/:categoryId", function(req, res){

  var category = req.params.category;
  var categoryId = parseInt(req.params.categoryId);

  db.Post.findAll({
    where: {
      CategoryId: req.params.categoryId,
    },
    order: [
      ['createdAt', 'DESC'],
    ],
    include: [db.User]
  }).then(function(data){
    var dbPost = [];
    for (var instance in data) {
      dbPost.push(data[instance].dataValues);
    }
    
    hdlbars = {
      category: category,
      categoryId: categoryId,
      post: dbPost,
      currentUser: getCurrentuserId(req),
      isLoggedIn: req.isAuthenticated()
    }
    //console.log("hdlbrs: ", hdlbars.post[0].User);
    res.render("category", hdlbars);
  });


});


// shows all posts for a specific user

router.get("/user/:userId/post", function(req, res) {  
    
      db.User.findAll({
        where: {id: req.params.id},
        include: [db.Post]
      }).then(function(dbPost) {
        res.json(dbPost);
      });
});

// shows specific post of a specific user
router.get("/post/:postId", function(req, res) {
      db.Post.findOne({
        where: {id:req.params.postId},
        include: [db.User, db.Comment]
      }).then(function(data) {
        //console.log("\n>>>> dbPost",dbPost);
        var dbPost = [];
        for (var instance in data) {
          dbPost.push(data.dataValues);
        }
        // res.json(dbPost);
        hdlbars = {
          currentUser: getCurrentuserId(req),
          isLoggedIn: req.isAuthenticated(),
          post: dbPost[0]
        }
        console.log("single post thread data: ", hdlbars)
        res.render("post", hdlbars);
      });
});

// router.get("/user/:userId/post/:postId", function(req, res) {
   
//       db.Post.findAll({
//         where: {id:req.params.postId},
//         include: [db.User] //where id: req.params.userId:
//       }).then(function(dbPost) {
//         console.log("\n>>>> dbPost",dbPost);
//         res.json(dbPost);
//       });
// });  // for this one because it is our existing post we dont use create but update and delete
router.put("/post/:postId", function(req, res) {
      console.log(req.params.postId)
      db.Post.update(

        {likes:  req.body.likes},

        {where: {id: req.params.postId}},
        {include: [db.User]} //where id: req.params.userId:

      ).then(function(dbPost) {
        console.log("\n>>>> dbPost",dbPost);
        res.json(dbPost);
      });
});

// edit or update a post of a specific user
router.put("/user/:userId/post/:postId", function(req, res) {
   
      db.Post.update({

        title:req.body.title,
        body:  req.body.body,
        
        where: {id:req.params.postId},
        include: [db.User] //where id: req.params.userId:

      }).then(function(dbPost) {
        console.log("\n>>>> dbPost",dbPost);
        res.json(dbPost);
      });
});

router.delete("/user/:userId/post/:postId", function (req, res) {

      db.Post.destroy({
        where: {
          id: req.params.postId,
          include: [db.User]
        }
      }).then(function() {
        res.redirect('/');
      });
});

// create a post from category page
router.post("/user/:userId/post", function(req, res) { 


    var timeInMs = new Date();
    var createdAtArr = timeInMs.toString().split(" ");
    var time = parseInt(createdAtArr[4].split(":")[0]) + ":" + createdAtArr[4].split(":")[1];
    var dateTime =  createdAtArr[0] + ", " + 
                          createdAtArr[1] + " " + 
                          createdAtArr[2] + ", " +
                          time;

    db.Post.create({
      title: req.body.title,
      body: req.body.body,
      UserId: parseInt(req.params.userId),
      CategoryId: parseInt(req.body.categoryId),
      createdAtStr: dateTime,
    }).then(function(dbPost) {
      db.Post.findOne({
        where: {
          id: dbPost.dataValues.id
        },
        include: [db.User]
      }).then(function(response){
        //console.log(res.dataValues.User.username);
        var newPost = {
          post: response.dataValues,
          username: response.dataValues.User.username
        }
        //console.log("response for new post: ", newPost)
        res.json(newPost);
      });
    }).catch(function (err) {
      // handle error;
      console.log(err);

    });       
});


// router.put("/api/user", function(req, res){
//   // add to save column
//     db.User.update({
//         saves:req.body.postToSave
//         where: {id:req.session.passport.user},
//         include: [db.Post]

//       }).then(function(dbUser) {
//         console.log("\n>>>> dbUser",dbUser);
//         //res.json(dbPost);
//       });
// })

// process the signup form ==============================================
//=======================================================================

router.post('/signup', function(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) {
      //console.log("passport err", err)
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
      return res.send({ success : false, message : 'authentication failed' });
    }
    
    // ***********************************************************************
    // "Note that when using a custom callback, it becomes the application's
    // responsibility to establish a session (by calling req.login()) and send
    // a response."
    // Source: http://passportjs.org/docs
    // ***********************************************************************

    req.login(user, loginErr => {
      if (loginErr) {
        //console.log("loginerr", loginerr)
        return next(loginErr);
      }
      //var userId = user.dataValues.id;
      console.log('redirecting....');

      return res.redirect(req.headers.referer);
      // return res.redirect("/account");
      
    });      
  })(req, res, next);
});

router.post('/login', function(req, res, next) {
 
  passport.authenticate('local-login', function(err, user, info) {
    if (err) {
      //console.log("passport err", err)
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
      return res.send({ success : false, message : 'authentication failed' });
    }
    
    // ***********************************************************************
    // "Note that when using a custom callback, it becomes the application's
    // responsibility to establish a session (by calling req.login()) and send
    // a response."
    // Source: http://passportjs.org/docs
    // ***********************************************************************

    req.login(user, loginErr => {
      if (loginErr) {
        //console.log("loginerr", loginErr)
        return next(loginErr);
      }
      //var userId = user.dataValues.id;
      console.log('redirecting....')

      // if (!req.session.userid) {
      //   var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
      //   delete req.session.redirectTo;
      //   // is authenticated ?
      //   res.redirect(redirectTo);
      // } else {
      //     next();
      // }
      // console.log("=====================signup: ",req.headers.referer);
      return res.redirect(req.headers.referer);
      // return res.redirect("/account");
      
    });      
  })(req, res, next);
});



//edge casing for wild card
router.get("*", function(req, res, next) {
  if(req.url.indexOf('/api') == 0) return next();
  if(req.url.indexOf('/assets') == 0) return next();
  if(req.url.indexOf('/css') == 0) return next();
  res.render("index");
});

cron.schedule('0 0 * * * *', function(){
  newsapi.articles({
  source: 'hacker-news',
  category: 'technology', // optiona
  sortBy: 'top'
  }, (err, articlesResponse) => {
  if(err) {
    console.error(err)
  }
  else{
     findNewPost(articlesResponse.articles);
  } 
  });  
});

function findNewPost(newArticles){
    db.Post.findOne({
      where: {
        UserId: 2,
        CategoryId: 3,
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      include: [db.User]
    }).then(function(dbPost){
      var x = -1;
      for(var index in newArticles){
        var article = newArticles[index];
        x++;
        console.log('viewed article ', x)
        // check if article matches, if not post. otherwise go to next article.
        if(dbPost == null || article.url != dbPost.newsUrl){
          var timeInMs = new Date();
          var createdAtArr = timeInMs.toString().split(" ");
          var time = parseInt(createdAtArr[4].split(":")[0]) + ":" + createdAtArr[4].split(":")[1];
          var dateTime =  `${createdAtArr[0]}, ${createdAtArr[1]} ${createdAtArr[2]}, ${time}`
            

          console.log('created article ', x)
          console.log(article)
          db.Post.create({
            title: article.title,
            body: article.description,
            newsUrl: article.url,  
            UserId: 2, // hardcoded to `2` for admin
            CategoryId: 3, // hardcoded to `3` for tech news
            createdAtStr: dateTime,
          })

          return;
        }
      }
    });

/*

  dbPost = {
      title: articlesResponse.articles[0].title,
      body: articlesResponse.articles[0].description,
      url: articlesResponse.articles[0].url
    }
    //console.log(dbPost);
    newsPost = {
      category: "technews",
      categoryId: 3,
      post: dbPost,
      currentUser: 2
    }
    */
}


/*

create route for admin create post through heroku
console.log("\nhello world!");
  newsapi.articles({
  source: 'hacker-news',
  category: 'technology', // optiona
  sortBy: 'top'
  }, (err, articlesResponse) => {
  if(err) {
    console.error(err)
  }
  else{
    dbPost = {
      title: articlesResponse.articles[0].title,
      body: articlesResponse.articles[0].description,
      createdAtStr: articlesResponse.articles[0].publishedAt 
    }
    console.log(dbPost);
    newsPost = {
      category: "technews",
      categoryId: 3,
      post: dbPost,
      currentUser: 2,
      isLoggedIn: req.isAuthenticated()
    }
    //console.log("hdlbrs: ", hdlbars.post[0].User);
  } 
  });  



*/







function getCurrentuserId(req){
  var userId;
    if(req.isAuthenticated()){
      userId = req.session.passport.user;
    } else {
      userId = false
    }
    return userId
}

module.exports = router;