var express = require('express');
var router = express.Router();

const db = require('../models');


//======================================================================================================================
//get requaest for login. check if the session is active
router.get('/', function(req, res, next) {
    if(req.session.active)
        return res.redirect('/weather')
    if(req.session.register)
    {
        req.session.register=undefined;
        return  res.render('login',{erorEmail: "",errorPassword:"" ,registrationMessage:"Registration was successful!"});
    }
    return res.render('login',{erorEmail: "",errorPassword:"" ,registrationMessage:""});
});

//======================================================================================================================
//find if email and password are exist in the data base
router.post('/', function(req, res, next) {

    db.User.findOne({
        where: {email: req.body.email}
    }).then(info => {
        if(info==null)
            return res.render('login', {erorEmail: 'Email not found. Please try again',errorPassword:"" ,registrationMessage:""});
        if (info.password!== req.body.password)
        {
            return res.render('login', {erorEmail: "",errorPassword:'Incorrect password. Please try again' ,registrationMessage:""});
        }
        req.session.email=req.body.email;
        req.session.active=true;
        res.redirect('/weather');

    })
        .catch((err) => {
            return res.render('login', {erorEmail: "",errorPassword:"" ,registrationMessage:""});
        })

});

module.exports = router;