# Tech Tie-Up
<img src="https://d26dzxoao6i3hh.cloudfront.net/items/1t3b2K351d1g3I310w2w/Screen%20Recording%202017-11-09%20at%2002.40%20PM.gif?v=161b5fb8?raw=true" >

A hybrid between reddit and stackoverflow.

## Motivation

a social environment for anything tech. A place where you can read about tech news and find recourses and also get help with a technical problem all in one place.  

<img src="https://d26dzxoao6i3hh.cloudfront.net/items/1I2F0E2F3a2R3O0p2V0X/Screen%20Recording%202017-11-09%20at%2002.41%20PM.gif?v=68d6d4a7?raw=true" >

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Installing

Clone to a local repository. Enjoy!

## Usage

run `node server.js`

## Built With
Required packages - `npm i` 
* [body-parser](https://www.npmjs.com/package/body-parser)
* [express](https://www.npmjs.com/package/express)
* [bcrypt](https://www.npmjs.com/package/bcrypt)
* [connect-flash](https://www.npmjs.com/package/connect-flash)
* [cookie-parser](https://www.npmjs.com/package/cookie-parser)
* [express-fileupload](https://www.npmjs.com/package/express-fileupload)
* [express-handlebars](https://www.npmjs.com/package/express-handlebars)
* [express-session](https://www.npmjs.com/package/express-session)
* [method-override](https://www.npmjs.com/package/method-override)
* [mysql2](https://www.npmjs.com/package/mysql2)
* [newsapi](https://www.npmjs.com/package/newsapi)
* [node-cron](https://www.npmjs.com/package/node-cron)
* [passport](https://www.npmjs.com/package/passport)
* [passport-github2](https://www.npmjs.com/package/passport-github2)
* [passport-local](https://www.npmjs.com/package/passport-local)
* [passport-oauth2](https://www.npmjs.com/package/passport-oauth2)
* [passport-remember-me](https://www.npmjs.com/package/passport-remember-me)
* [sequelize](https://www.npmjs.com/package/sequelize)
* [particles](https://github.com/VincentGarreau/particles.js/)


### Additions

*get all post for selected category*
```
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

```

*creating new post through admin for auto post* 
```
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
```
*running task of pull data from news api* 
```
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
```
route for login
```
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
```
