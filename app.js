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
//const bodyParser = require('body-parser')
const multer = require('multer')
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// // dotenv file
// const CLOUNDINARY_CLOUD_NAME = 'dodmtp0m2';
// const CLOUDINARY_KEY = '872594197768919';
// const CLOUDINARY_SECRET = 'caLYZKrjQcANYesu0IPYCt4vJJQ';
// //put in module
// cloudinary.config({
//     cloud_name: CLOUNDINARY_CLOUD_NAME,
//     api_key: CLOUDINARY_KEY,
//     api_secret: CLOUDINARY_SECRET
// });

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: 'test',
//         allowedFormats: ['jepg', 'png', 'jpg'],
//         use_filename: true,
//         public_id: (req, file) => {
//             const timestamp = Date.now();
//             return timestamp + '_' + file.originalname;
//         }
//     } 
// });

const {storage} = require('./modules/Cloudinary')
const upload = multer({storage})

const sha256 = require('js-sha256').sha256;
const NodeRSA = require('node-rsa');
const session = require('express-session');
const path = require('path');
const fs = require('fs');


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test').then(()=> {
    console.log('Connected');
    //logs connected to server
}).catch(err => {
    console.log('Error!');
    console.log(err);
})

const mobile = require('./routes/mobile');

const addLogs = require('./modules/Log');

const Owner = require('./models/Owner')
const Guest = require('./models/Guest')
const Employee = require('./models/Employee')
const Admin = require('./models/Admin')


// let keyRSA;
// let privateKey;
// let publicKey;

// if (fs.statSync('./keys/private.pem').size == 0) {
    
//     keyRSA = new NodeRSA({b: 1024}).generateKeyPair();
//     keyRSA.setOptions({encryptionScheme: 'pkcs1'});
    
//     privateKey = keyRSA.exportKey('private');
//     publicKey = keyRSA.exportKey('public');
    
//     fs.openSync('./keys/private.pem', 'w');
//     fs.writeFileSync('./keys/private.pem', privateKey, 'utf-8');
    
//     fs.openSync('./keys/public.pem', 'w');
//     fs.writeFileSync('./keys/public.pem', publicKey, 'utf-8');
// } else {
//     privateKey = fs.readFileSync('./keys/private.pem', 'utf-8');
//     publicKey = fs.readFileSync('./keys/public.pem', 'utf-8');
//     keyRSA.importKey(privateKey, 'private')
//     keyRSA.importKey(publicKey, 'public')
// }

const keyRSA = new NodeRSA();
keyRSA.setOptions({encryptionScheme: 'pkcs1'});
keyRSA.importKey(fs.readFileSync('./keys/private.pem', 'utf-8'), 'private');
keyRSA.importKey(fs.readFileSync('./keys/public.pem', 'utf-8'), 'public');

// keyRSA.importKey(privKey, 'private')
// keyRSA.importKey(pubKey, 'public')
//console.log(keyRSA.getKeySize());
//console.log(keyRSA.getMaxMessageSize());
// console.log(keyRSA.exportKey('private'));
// console.log(keyRSA.exportKey('public'));

const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

//app.use(express.static('./public'))
app.use(express.static('./public/build'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({ secret: '^kk#o@OZ332o06^4' }))

app.use('/owners', mobile)

//logs server
addLogs('server-boot', '0', '0', '0');

//React testing
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
    //test then clean
    // console.log(req.body);
    // console.log(req.session.user);
    
    const authorizedAdmin = await Admin.findById(req.session.user);
    const authorizedEmployee = await Employee.findOne({_id:req.session.user, job_title: 'sales'});
    
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
                await authorizedAdmin.updateOne({$push: { added: newAdmin._id}})
                await newAdmin.updateOne({ added_by_admin: authorizedAdmin._id})
        
                res.status(200).json({
                    'confirmation': 'success',
                });
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
                await authorizedAdmin.updateOne({$push: { added: newPerson._id}})
                await newOwner.updateOne({ added_by_employee: authorizedAdmin._id})
        
                res.status(200).json({
                    'confirmation': 'success',
                });
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

    //try promise

    //logs owner adds guest (to be tested)
    //addLogs('mobile-owner-add-guest', guest_owner._id, newGuest._id, '0')
        
    
})

app.get('/logout', (req, res) => {
    //logs of user logged out
    req.session.destroy();
    //res.redirect('/');
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
            //logs of admin viewed records
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


// app.get('/verify-role-react', (req, res) => {
//     console.log(req.body);
//     res.json({
//         'confirmation': 'success',
//         'role': 'admin'
//     })
// })



//Testing
// app.get('/keys', (req, res) => {
//     res.json({
//         'public': keyRSA.exportKey('public'),
//         'private': keyRSA.exportKey('private')
//     })
// })

//Web
// app.post('/sign-in', async (req, res) => {
//     const {email, password} = req.body;
//     console.log(email, password);
//     if ((email != '' && password != '') && email.match(regexEmail) && email.length > 5 && password.length >= 3) {
//         const isValidEmployee = await Employee.findOne({email});
//         const isValidAdmin = await Admin.findOne({email});
//         const ip = req.ip
//         // const ip = req.headers['x-forwaded-for']
//         // const ip = req.socket.remoteAddress;
//         // console.log(ip);
//         if (isValidEmployee && sha256(password) == isValidEmployee.password) {
//             req.session.user = isValidEmployee._id;
//             addLogs('web-employee-login', isValidEmployee._id, '0', ip);
//             return res.status(200).redirect('/');
//             // return res.status(200).json({
//             //     'confirmation': 'success',
//             //     'name': isValidEmployee.name.charAt(0).toUpperCase() + isValidEmployee.name.slice(1)
//             // });
//         } else if (isValidAdmin && sha256(password) == isValidAdmin.password) {
//             req.session.user =  isValidAdmin._id;
//             addLogs('web-admin-login', isValidAdmin._id, '0', ip);
//             return res.status(200).redirect('/');
//         } else {
//             return res.status(401).json({
//                 'confirmation': 'failure',
//                 'message': 'Wrong Credentials.'
//             });
//         }
//     } else {
//         return res.status(401).json({
//             'confirmation': 'failure',
//             'message': 'Enter valid credentials.'
//         });
//     }

// })

// app.get('/sign-up.html', async (req, res) => {
//     //console.log('sign in');
//     const validSessionAdmin = await Admin.findById(req.session.user);
//     const validSessionEmployee = await Employee.findById(req.session.user)
//     if (validSessionAdmin) {
//         res.sendFile(path.resolve(__dirname, './private/sign-up-admin.html'));
        
//     } else if (validSessionEmployee) {
//         res.sendFile(path.resolve(__dirname, './private/sign-up.html'));

//     } else {
//         res.redirect('/sign-in.html')
//     }
// })

// app.get('/logs.html', async (req, res) => {
//     const validSessionAdmin = await Admin.findById(req.session.user);
//     if (validSessionAdmin) {
//         res.sendFile(path.resolve(__dirname, './private/logs.html'));
//         //logs of admin
//     } else {
//         res.send('unauthorized');
//     }
// })





//Hardware
var qrValid;
app.post('/gate', async (req, res) => {
    const {data} = req.body;
    const decryptedHash = keyRSA.decrypt(data, 'utf-8');
    qrValid = await Guest.findOne({hashed: decryptedHash, used: false});
    if (qrValid) {
        await qrValid.updateOne({used: true});
        //logs guest entered
        addLogs('hardware-guest', qrValid._id, qrValid.owner_id, '0')
        //logs gate opened for guest ----
        return res.send('Confirmed');
    } else {    
        return res.send('Failed');
    }
    
})

app.post('/gate/image', upload.single('file'), async (req, res) => {
    //add a way to verify before adding picture
    const {path, filename} = req.file;
    const uploadTime = new Date().toLocaleString();
    await qrValid.updateOne({ entrance_img: {url: path, filename: filename, dateUploaded: uploadTime} });
    //logs hardware sent picture
    res.send('Done');

    //Saves images in cloudinary
})

app.listen(5000, () => {
    console.log('Server is listening on port 5000...');
})

/**
 * Web:
 * ----
 * - Authorize the view of records, logs, edit of owner's data
 * - Session ID (expires?)
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
 * - Owner generates his own qr to enter
 * Server:
 * -------
 * - Logging every action (ALL) (Hardware)
 * - server saves the image from gate with timestamp (HARDWARE)
 * - Selected image will be added in the selected guest's database (HARDWARE)
 * - Authenticate hardware (HARDWARE)
 * - Hashing passwords (WEB)
 * Hardware:
 * ---------
 * - Authenticate with server (save session id?)
 * - read response from server, if confirmed then open gate, and save image from camera 2?
 * - if gate opened, take screenshot from camera 2 and send to server.
 * Database:
 * ---------
 * - 
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