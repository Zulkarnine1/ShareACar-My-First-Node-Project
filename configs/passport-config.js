const passport = require('passport');
const User = require("../models/user")
module.exports = function(app){


app.use(passport.initialize());
app.use(passport.session());



passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

}