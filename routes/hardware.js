//Importing packages and libraries.
const express = require('express');
const router = express.Router();
const multer = require('multer')
const {storage} = require('../modules/Cloudinary')
const upload = multer({storage})

//Importing RSA functions.
const keyRSA = require('../modules/Keys');

//Importing models used in this route.
const Guest = require('../models/Guest');
const Hardware = require('../models/Hardware');

//Importing logs module.
const addLogs = require('../modules/Log');

var qrValid;
router.post('/', async (req, res) => {
    console.log(req.body);
    const {Device_id, password, data} = req.body;
    const validHardware = await Hardware.findOne({Device_id: Device_id, password: password});
    if (validHardware) {
        const decryptedHash = keyRSA.decrypt(data, 'utf-8');
        qrValid = await Guest.findOne({hashed: decryptedHash, used: false});
        const dateCurrent = new Date().toLocaleDateString();
        const dateDB = new Date(qrValid.date).toLocaleDateString();
        console.log(dateDB + ' ///// ' + dateCurrent);
        if (qrValid && (dateDB < dateCurrent || dateDB == dateCurrent)) {
            await qrValid.updateOne({used: true});
            await validHardware.updateOne({no_of_guests_opened: validHardware.no_of_guests_opened + 1});
            //logs guest entered
            addLogs('hardware-guest', qrValid._id, qrValid.owner_id, '0')
            //logs gate opened for guest ----
            addLogs('hardware-openned-gate', validHardware._id, qrValid._id, '0');
            return res.send('Confirmed');
        } else {    
            return res.send('Failed');
        }

    } else {
        return res.send('Wrong Crendentials!');
    }
    
})

router.post('/image', upload.single('file'), async (req, res) => {
    //add a way to verify before adding picture
    const {path, filename} = req.file;
    const uploadTime = new Date().toLocaleString();
    await qrValid.updateOne({ entrance_img: {url: path, filename: filename, dateUploaded: uploadTime} });
    //logs hardware sent picture
    addLogs('hardware-sent-picture', '0', qrValid._id, path);
    res.send('Done');

    //Saves images in cloudinary
})

module.exports = router
