var express = require('express');
var router = express.Router();
var Cookies = require('cookies')
var keys = ['keyboard cat']

const db = require('../models');

class User1{
  constructor(firstName,lastName,email,password){
    this.firstName = firstName;
    this.lastName=lastName;
    this.email=email;
    this.password=password;
  }
}
let user= new User1("","","","");

//======================================================================================================================
//get requaest for register.
router.get('/', function(req, res, next) {

  return res.redirect('/register');
});
//======================================================================================================================
router.get('/register', function(req, res, next) {
  if(req.session.active)
    return res.redirect('/weather');

  return res.render('register', { erorrLoggin: "",erorMessage:"" });
});
//=====================================================================================================================
//check if the email isn't already exist in the data base and send to password.
router.get('/register/password', function(req, res, next) {

  if(req.session.email===undefined)
    res.redirect('/register')
  else
  {
    db.User.findOne({
      where: {email: user.email}
    }).then(info => {
      if (info === null || info.password===null )
        return res.render('password');

      return res.redirect('/register')
    }).catch((err)=>{
      req.session.destroy();
      res.redirect('/register');
    });
  }
});
//======================================================================================================================
//first register in local value without password
router.post('/register', function(req, res, next) {

  let sess=req.session;
  user.firstName=req.body.FirstName;
  user.lastName=req.body.LastName
  user.email=req.body.email.toLowerCase();
  sess.email=user.email.toLowerCase();

  db.User.findOne({
    where: {email: user.email}
  }).then(info => {
    if (info !== null) {
      res.render('register', {erorrLoggin: "",erorMessage: "The email is already exist. try again please"});
    } else {
      var cookies = new Cookies(req, res, {keys: keys})
      cookies.set('LastVisit', new Date().toISOString(), {signed: true, maxAge: 60 * 1000});
      sess.register=true;
      res.redirect('/register/password');
    }
  })
      .catch((err) => {
        res.render('register', {erorrLoggin: "",erorMessage: ""});
      })




});

//======================================================================================================================
//creat the user in data base with password
router.post('/register/password', function(req, res, next) {
  var cookies = new Cookies(req, res, { keys: keys })
  var thereIsStillTime = cookies.get('LastVisit', { signed: true })

  if (thereIsStillTime) {
    user.password=req.body.password;
    db.User.create(user)
        .then((info) => res.redirect('/login'))
        .catch((err) => {
          return res.render('/register', { erorrLoggin: "Login failed Please try again",erorMessage:"" });
        })
  }
  else
    res.redirect('/register')
});

module.exports = router;
