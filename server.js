// set up ======================================================

const express    = require("express");
const methodO    = require("method-override");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

const app  = express();
const PORT = process.env.PORT || 3033;

const passport     = require('passport');
const flash        = require('connect-flash');
const cookieParser = require('cookie-parser');
const session      = require('express-session'); // cookie session

// configuration ==============================================

var db = require("./models");
require('./config/passport')(passport); // pass passport for configuration


// set up express application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(express.static("public"));
app.use(function(err, req, res, next) {
    console.log(err);
});

// set up HB for templating
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// required for passport

//app.use(session({ secret: 'thueeugurg5hi5ri7ri5tfg576rihufgk76g65ehi4wu3qa23' })); // session secret
app.use(session({
    key: 'user_sid',
    secret: 'kjakjasdksdkldksdfklsdkdjkldsif',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());
app.use(methodO("_method"));

// routes ======================================================

var routes = require("./routes/api-routes");
app.use("/", routes);


// launch ======================================================
db.sequelize.sync({}).then(function() {
	app.listen(PORT, function() {
	  console.log("App listening on PORT " + PORT);
	});
});