//Importing packages.
const express = require('express');
const router = express.Router();
const sha256 = require('js-sha256').sha256;

//Importing models used in this route.
const Owner = require('../models/Owner');
const Guest = require('../models/Guest');

//Importing logs module.
const addLogs = require('../modules/Log');

//Defining regex.
const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

//Login
router.post('/', async (req, res) => {
    const {from} = req.body; //Takes important variables from request body.
    const ip = req.ip; //Gets IP from the request.
    if (from == 'Mobile') { //Checks if request from mobile.
        const {email, password} = req.body; 

        //Checks if email and password are not empty, email in correct format, email's length, and password's length.
        if ((email != '' && password != '') && email.match(regexEmail) && email.length > 5 && password.length >= 3) {
            
            //Checks if user is authenticated.
            const isValidOwner = await Owner.findOne({email: email, password: sha256(password)});
            if (isValidOwner) {
                addLogs('mobile-owner-login', isValidOwner._id, '0', ip)
                
                return res.status(200).json({
                    'confirmation': 'success',
                    'name': isValidOwner.name.charAt(0).toUpperCase() + isValidOwner.name.slice(1)
                });
            } else {
                return res.status(401).json({
                    'confirmation': 'failure',
                    'message': 'Wrong Credentials.'
                });
            }
        } else {
            return res.status(401).json({
                'confirmation': 'failure',
                'message': 'Enter valid credentials.'
            });
        } 
        
    }
})

//Owner adds a new guest
router.post('/newguest', async (req, res) => {
    const {from, ownerEmail, ownerPassword, name, date, car_id} = req.body; //Takes important variables from request body.
    if (from == 'Mobile') { //Checks if request from mobile.
        
        //const {name, date, car_id, hashed} = req.body;
        //Date regex?
        //const regexDate = [0-3][0-9]-[01][1-9]-[0-9][0-9][0-9][0-9]; //to be checked
        //Car plate regex?
        //console.log(date);

        //Checks if credentials were valid, if not will return undefined.
        const validOwner = await Owner.findOne({email: ownerEmail, password: sha256(ownerPassword)});
        if (validOwner && (name != '' && date != '' && car_id != '')){
            try {
                const newGuest = await Guest.create(req.body); //Creating a new guest in database.

                //Linking both id in database.
                await validOwner.updateOne({ $push: { active_qr: newGuest._id }});
                await newGuest.updateOne({owner_id: validOwner._id});

                addLogs('mobile-owner-add-guest', validOwner._id, newGuest._id, '0');
                
                res.status(200).json({
                    'confirmation': 'success',
                });
            } catch (error) {
                console.log(error);
                res.status(400).json({
                    'confirmation': 'failure',
                });
            }
    

        } else {
            res.status(401).json({
                'confirmation': 'failure',
                'message': 'Enter valid credentials.'
            });
        }
        
    }
})

module.exports = router
