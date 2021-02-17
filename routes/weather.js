var express = require('express');
var router = express.Router();

const db = require('../models');
class location{
    constructor(email,locationName,longitude,latitude){
        this.email = email;
        this.locationName=locationName;
        this.longitude=longitude;
        this.latitude=latitude;
    }
}
//====================================================================================================================
//get requast for weather page
router.get('/', function(req, res, next) {

    if(req.session.active)
    {
        return db.User.findOne({
            where: {email: req.session.email}
        })
            .then(info => {
                return  res.render('weather', {emailmessage: info.firstName + " " + info.lastName, erorMessage: ""});
            }).catch((err) => {
                return res.redirect('/logout');
            });
    }
    else
        return res.redirect('/login');

});
//======================================================================================================================
//logout from the website and render to login page
router.post('/logout', function(req, res, next) {

    req.session.destroy();
    return res.redirect('/login');

});

//======================================================================================================================
//middleware check if the user in logged in
router.use(function (req, res, next) {
    if(!req.session.active)
    {
       return  res.sendStatus(404)
    }
    else
        next();
});
//======================================================================================================================
//send all list of places to client
router.get('/displayList', function(req, res, next) {
    allList(req, res);
});

//======================================================================================================================
//add new place to data base
router.post('/updateList', function(req, res, next) {

    let place =new location(req.session.email,req.body.locationName,req.body.longitude,req.body.latitude);
    return db.Location.findOne({
        where: {email: place.email,locationName: place.locationName}
    }).then(info => {
        if (info !== null) {
            res.sendStatus(205);
        } else {
            db.Location.create(place)
                .then(allList(req,res))
                .catch((err) => {
                    return res.redirect('/logout');
                })
        }
    })  .catch((err) => {
        return res.redirect('/logout');
    })

});
//======================================================================================================================
//delete one place from list
router.delete('/deleteFromList', (req, res,next) => {

    return db.Location.findOne( {where: {email: req.session.email,locationName: req.body.locationName}})
        .then((contact) => contact.destroy({ force: true }))
        .then(()=>{allList(req, res)})
        .catch((err) => {
            return res.redirect('/logout');
        })

});
//======================================================================================================================
router.delete('/deleteAllList', (req, res,next) => {

    return db.Location.destroy( {where: {email: req.session.email}})
        .then( allList(req, res))
        .catch((err) => {
            return res.redirect('/logout');
        })
});
//======================================================================================================================
//get long & lat for one place
router.post('/locationData', function(req, res, next) {

    return db.Location.findOne({
        where: {email: req.session.email,locationName: req.body.locationName}
    }).then(info => {res.send({info});})
        .catch((err) => {
            return res.redirect('/logout');
        })

});
//======================================================================================================================
// get all list of places from data base
let allList= function(req, res) {
    return  db.Location.findAll({where: {email:req.session.email}})
        .then(info => res.send(info))
        .catch((err) => {
            return res.redirect('/logout');
        });

};
module.exports = router;
