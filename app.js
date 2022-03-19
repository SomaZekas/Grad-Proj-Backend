/**
 * https://www.npmjs.com/package/js-sha256
 * 
 */
const express = require('express');
const app = express();
//const bodyParser = require('body-parser')
//const multer = require('multer')
//const upload = multer()
const sha256 = require('js-sha256').sha256;
const session = require('express-session');
const path = require('path');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test').then(()=> {
    console.log('Connected');
}).catch(err => {
    console.log('Error!');
    console.log(err);
})

const Owner = require('./models/Owner')
const Guest = require('./models/Guest')
const Employee = require('./models/Employee')


const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({ secret: '^kk#o@OZ332o06^4' }))

//Testing
app.get('/owners', (req, res) => {
    Owner.find()
    .then(owners => {
        res.json({
            confirmation: 'success',
            data: owners
        })
    })
    .catch(err => {
        res.json({
            confirmation: 'failure',
            message: err.message
        })
    })
})

//Web
app.post('/sign-in', async (req, res) => {
    const {email, password} = req.body;
    if (email.match(regexEmail) && email.length > 5 && password.length >= 3) {
        const isValidEmployee = await Employee.findOne({email});
        if (sha256(password) == isValidEmployee.password) {
            req.session.employee_id = isValidEmployee._id;
            return res.redirect('/');
            // return res.status(200).json({
            //     'confirmation': 'success',
            //     'name': isValidEmployee.name.charAt(0).toUpperCase() + isValidEmployee.name.slice(1)
            // });
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


})

app.get('/sign-up.html', (req, res) => {
    console.log('sign in');
    if (!req.session.employee_id) {
        res.redirect('/sign-in.html');
    } else {
        res.sendFile(path.resolve(__dirname, './private/sign-up.html'));
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

//Login from mobile app
app.post('/owners', async (req, res) => {
    const {from} = req.body;
    if (from == 'Mobile') {
        const {email, password} = req.body;
        console.log(email);
        if (email.match(regexEmail) && email.length > 5 && password.length >= 3) {
            const isValidOwner = await Owner.findOne({email});
            if (sha256(password) == isValidOwner.password) {
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
app.post('/owners/newguest', async (req, res) => {
    //console.log(req.body);
    const {from, ownerEmail} = req.body;
    if (from == 'Mobile') {
        //const {name, date, car_id, hashed} = req.body;
        //Date regex?
        //const regexDate = [0-3][0-9]-[01][1-9]-[0-9][0-9][0-9][0-9]; //to be checked
        //Car plate regex?
        //console.log(date);
        let newGuest;
        try {
            newGuest = await Guest.create(req.body);
            res.status(200).json({
                'confirmation': 'success',
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                'confirmation': 'failure',
            });
        }

        const guest_owner = await Owner.findOne({email: ownerEmail});
        await guest_owner.updateOne({ $push: { active_qr: newGuest._id }});
        await newGuest.updateOne({owner_id: guest_owner._id});
        
    }
})

//Hardware
// app.post('/gate/image', (req, res) => {
//     console.log(req.body);
//     res.send('Thank you')
// })

app.listen(5000, () => {
    console.log('Server is listening on port 5000...');
})

/**
 * Web:
 * ----
 * - Authorize the view of records, logs, edit of owner's data
 * - Authorize Sign up (admin -> owners, employees. employees(sales) -> owners.)
 * - Session ID (expires?)
 * - Associate employees with owner
 * - Once gate opens, details of guest and data are shown in the web
 * - Owner's forgot passward, send to email
 * Mobile:
 * -------
 * - Generate QR code
 * - Link all in one project
 * - Test in android and ios
 * - Output in apk (depoloy first), (USB debugging?)
 * - Session id
 * - Save guest data for future use?
 * Server:
 * -------
 * - Logging every action (ALL)
 * - Authenticate QR Code data (HARDWARE)
 * - Send confirmation to selected gate (HARDWARE)
 * - server saves the image from gate with timestamp (HARDWARE)
 * - Selected image will be added in the selected owner's database (HARDWARE)
 * - Delete scanned guest data? (HARDWARE)
 * - Hashing passwords (WEB)
 * - When adding a new admin, employee, and owner, make sure the email isn't already registered (WEB)
 * - Associate employees with created owners (WEB)
 * Hardware:
 * ---------
 * - Authenticate with server (save session id?)
 * - Read QR code
 * - Send text to server
 * - read response from server, if confirmed then open gate
 * - if gate opened, take screenshot from camera 2 and send to server.
 * Database:
 * ---------
 * - array of objects id in owner's database
 * Deployment:
 * -----------
 * - deploy
 * - from http to https domain name
 * ----------------------------------------------------------------------------
 * Network workFlow:
 * ---------
 * - Mobile:
 *  - Recive and save public key, if not saved
 *  - Send data of guest with their hash to server (DONE)
 * - Hardware:
 *  - Sign in server
 *  - Send scanned QR code to server
 *  - If authenticated, opens door, takes images, and send to server
 *  ----------------------------------------------------------------------------
 * Deployment sites:
 * -----------------
 * https://aws.amazon.com/?nc2=h_lg
 * https://www.netlify.com/pricing/
 * https://www.heroku.com/home
 * https://www.turbo360.co/
 * https://mlab.com/
 * 
 */