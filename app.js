/**
 * https://www.npmjs.com/package/js-sha256
 * https://www.npmjs.com/package/node-rsa
 * 
 * https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
 * 
 * How To Serve A React App From A Node Express Server: https://www.youtube.com/watch?v=QBXWZPy1Zfs
 * Deploy a React App with ExpressJS and Nginx: https://www.youtube.com/watch?v=6CjbezdbB8o
 * https://www.freecodecamp.org/news/how-to-create-a-react-app-with-a-node-backend-the-complete-guide/
 * 
 * 
 */
const express = require('express');
const app = express();
const sha256 = require('js-sha256').sha256;
const session = require('express-session');
const path = require('path');
//const bodyParser = require('body-parser')


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test').then(()=> {
    console.log('Connected');
    addLogs('server-database', '0', '0', '0');

}).catch(err => {
    console.log('Error!');
    console.log(err);
    
})

const hardware = require('./routes/hardware');
const mobile = require('./routes/mobile');

const Admin = require('./models/Admin')
const Employee = require('./models/Employee')
const Guest = require('./models/Guest')
const Owner = require('./models/Owner')

const addLogs = require('./modules/Log');
const Hardware = require('./models/Hardware');

const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

//logs server
addLogs('server-boot', '0', '0', '0');

//app.use(express.static('./public'))
app.use(express.static('./public/build'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({ secret: '^kk#o@OZ332o06^4' }))

app.use('/owners', mobile)
app.use('/gate', hardware)


//Testing
// app.get('/keys', (req, res) => {
//     res.json({
//         'public': keyRSA.exportKey('public'),
//         'private': keyRSA.exportKey('private')
//     })
// })


//Web
app.post('/sign-in', async (req, res) => {
    const {email, password} = req.body;
    if ((email != '' && password != '') && email.match(regexEmail) && email.length > 5 && password.length >= 3) {
        const isValidEmployee = await Employee.findOne({email: email, job_title: 'sales'});
        const isValidAdmin = await Admin.findOne({email});
        const ip = req.ip
        // const ip = req.headers['x-forwaded-for']
        // const ip = req.socket.remoteAddress;
        // console.log(ip);
        if (isValidEmployee && sha256(password) == isValidEmployee.password) {
            req.session.user = isValidEmployee._id;
            addLogs('web-employee-login', isValidEmployee._id, '0', ip);
            return res.status(200).json({
                    'confirmation': 'success',
                    'name': isValidEmployee.name.charAt(0).toUpperCase() + isValidEmployee.name.slice(1),
                    'role': isValidEmployee.job_title
                });
        } else if (isValidAdmin && sha256(password) == isValidAdmin.password) {
            req.session.user =  isValidAdmin._id;
            addLogs('web-admin-login', isValidAdmin._id, '0', ip);
            return res.status(200).json({
                'confirmation': 'success',
                'name': isValidAdmin.name.charAt(0).toUpperCase() + isValidAdmin.name.slice(1),
                'role': 'admin'
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
})

app.post('/add-person', async (req, res) => {
    const { national_id, nationality, gender, religion, name, phone, address, email, password } = req.body;

    const authorizedAdmin = await Admin.findById(req.session.user);
    const authorizedEmployee = await Employee.findOne({_id: req.session.user, job_title: 'sales'});

    
    if (national_id != '' && 
        nationality != '' && 
        gender != '' &&
        religion != '' &&
        name != '' &&
        phone != '' &&
        address != '' &&
        email != '' &&
        password != '' &&
        email.match(regexEmail)) {

        req.body.password = sha256(password);
        
        if (authorizedAdmin) {
            if (req.body.select == 'Admin') {
                const alreadyExists = await Admin.findOne({email: req.body.email})
                if (alreadyExists) {
                    return res.status(200).json({
                        'confirmation': 'failure',
                        'message': 'Email already exists!'
                    });
                }

                try {
                    const newAdmin = await Admin.create(req.body);
                    await authorizedAdmin.updateOne({$push: { added: newAdmin._id}});
                    await newAdmin.updateOne({ added_by_admin: authorizedAdmin._id});
            
                    res.status(200).json({
                        'confirmation': 'success',
                    });

                    addLogs('web-admin-adds-admin', authorizedAdmin._id, newAdmin._id, '0');
                } catch (error) {
                    console.log(error);
                    res.status(400).json({
                        'confirmation': 'failure',
                        'message': 'Try Again!'
                    });
                }

            } else if (req.body.select == 'Employee') {
                const alreadyExists = await Employee.findOne({email: req.body.email})
                if (alreadyExists) {
                    return res.status(200).json({
                        'confirmation': 'failure',
                        'message': 'Email already exists!'
                    });
                }

                try {
                    const newEmployee = await Employee.create(req.body);
                    await authorizedAdmin.updateOne({$push: { added: newEmployee._id}})
                    await newEmployee.updateOne({ added_by_admin: authorizedAdmin._id})
            
                    res.status(200).json({
                        'confirmation': 'success',
                    });

                    addLogs('web-admin-adds-employee', authorizedAdmin._id, newEmployee._id, '0');
                } catch (error) {
                    console.log(error);
                    res.status(400).json({
                        'confirmation': 'failure',
                        'message': 'Try Again!'
                    });
                }

            } else if (req.body.select == 'Owner') {
                const alreadyExists = await Owner.findOne({email: req.body.email})
                if (alreadyExists) {
                    return res.status(200).json({
                        'confirmation': 'failure',
                        'message': 'Email already exists!'
                    });
                }

                try {
                    const newOwner = await Owner.create(req.body);
                    await authorizedAdmin.updateOne({$push: { added: newOwner._id}})
                    await newOwner.updateOne({ added_by_employee: authorizedAdmin._id})
            
                    res.status(200).json({
                        'confirmation': 'success',
                    });

                    addLogs('web-admin-adds-owner', authorizedAdmin._id, newOwner._id, '0');
                } catch (error) {
                    console.log(error);
                    res.status(400).json({
                        'confirmation': 'failure',
                        'message': 'Try Again!'
                    });
                }

            } else {
                res.send('Error!')
            }
        } else if (authorizedEmployee) {
            const alreadyExists = await Owner.findOne({email: req.body.email})
            if (alreadyExists) {
                return res.status(200).json({
                    'confirmation': 'failure',
                    'message': 'Email already exists!'
                });
            }

            try {
                const newOwner = await Owner.create(req.body);
                await authorizedEmployee.updateOne({$push: { added: newOwner._id}})
                await newOwner.updateOne({ added_by_employee: authorizedEmployee._id})
        
                res.status(200).json({
                    'confirmation': 'success',
                });

                addLogs('web-employee-adds-owner', authorizedEmployee._id, newOwner._id, '0');
            } catch (error) {
                console.log(error);
                res.status(400).json({
                    'confirmation': 'failure',
                    'message': 'Try Again!'
                });
            }

        } else {
            return res.status(400).json({
                'confirmation': 'failure',
                'message': 'Unauthorized!'
            });
        }
    } else {
        return res.status(400).json({
            'confirmation': 'failure',
            'message': 'Enter Valid Credentials!'
        });
    }        
    
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.end();
})

app.get('/logs/:type', async (req, res) => {
    const {type} = req.params
    const authorizedAdmin = await Admin.findById(req.session.user)
    if (authorizedAdmin && type != 'gate-pictures') {
        res.sendFile(path.resolve(__dirname, './logs/' + type + '-logs.txt'));
        addLogs('web-admin-logs', authorizedAdmin._id, type, '0')
    } else if (authorizedAdmin && type == 'gate-pictures') {
        Guest.find().select('entrance_img')
        .then(guests => {
            res.json({
                confirmation: 'success',
                data: guests
            })

            addLogs('web-admin-logs', authorizedAdmin._id, type, '0')
        })
        .catch(err => {
            res.json({
                'confirmation': 'failure',
                'message': err.message
            })
        })
    } else {
        res.status(401).json({
            'confirmation': 'failure',
            'message': 'Unauthorized!'
        });
    }
})

app.get('/devices', async (req, res) => {
    const authorizedAdmin = await Admin.findById(req.session.user);
    if (authorizedAdmin) {
        Hardware.find()
        .then(hardwares => {
            res.json({
                confirmation: 'success',
                data: hardwares
            })

            //addLogs('web-admin-logs', authorizedAdmin._id, type, '0')
        })
        .catch(err => {
            res.json({
                'confirmation': 'failure',
                'message': err.message
            })
        })
    } else {
        res.status(401).json({
            'confirmation': 'failure',
            'message': 'Unauthorized!'
        });
    }
})

app.listen(5000, () => {
    console.log('Server is listening on port 5000...');
})

/**
 * Web:
 * ----
 * - Authorize the view of records, edit of owner's data
 * - Session ID (expires?)
 * - Once gate opens, details of guest and data are shown in the web
 * - Owner's forgot passward, send to email
 * - Validate input
 * - Gate Pictures
 * - Hardware Devices
 * - Add 'title' data when admin adds an employee
 * Mobile:
 * -------
 * - Generate QR code
 * - Link all in one project
 * - Test in android and ios
 * - Output in apk (depoloy first), (USB debugging?)
 * - Session id
 * - Save guest data for future use?
 * - Owner generates his own qr to enter
 * Server:
 * -------
 * - Logging every action (ALL)
 * - server saves the image from gate with timestamp (done in name) (HARDWARE)
 * - Authenticate hardware (HARDWARE)
 * - Add date during qr code creation
 * - Check QR Code date 24 hrs max
 * Hardware:
 * ---------
 * - Authenticate with server
 * - try and catch to handle server down issues in requests.
 * - try and catch to hide errors.
 * - test with rest of components.
 * - script runs once booted.
 * - link all and finish.
 * Database:
 * ---------
 * - Add Hardware model.
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
 *  - Send scanned QR code to server, and take a picture
 *  - If authenticated, opens door, and send picture to server
 *  ----------------------------------------------------------------------------
 * Deployment sites:
 * -----------------
 * https://aws.amazon.com/?nc2=h_lg
 * https://www.netlify.com/pricing/
 * https://www.heroku.com/home
 * https://www.turbo360.co/
 * https://mlab.com/
 * ------------------------------------------------------------------------------
 * Ideas:
 * ------
 * - Telegram Bot
 * - Mobile app for admin
 * 
 */