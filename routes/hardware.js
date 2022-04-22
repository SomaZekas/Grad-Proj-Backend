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

//Importing logs module.
const addLogs = require('../modules/Log');

var qrValid;
router.post('/', async (req, res) => {
    console.log(req.body);
    const {data} = req.body;
    const decryptedHash = keyRSA.decrypt(data, 'utf-8');
    qrValid = await Guest.findOne({hashed: decryptedHash, used: false});
    if (qrValid) {
        await qrValid.updateOne({used: true});
        //logs guest entered
        addLogs('hardware-guest', qrValid._id, qrValid.owner_id, '0')
        //logs gate opened for guest ----
        addLogs('hardware-openned-gate', '0', qrValid._id, '0');
        return res.send('Confirmed');
    } else {    
        return res.send('Failed');
    }
    
})

router.post('/image', upload.single('file'), async (req, res) => {
    //add a way to verify before adding picture
    console.log(req.file);
    const {path, filename} = req.file;
    const uploadTime = new Date().toLocaleString();
    await qrValid.updateOne({ entrance_img: {url: path, filename: filename, dateUploaded: uploadTime} });
    //logs hardware sent picture
    addLogs('hardware-sent-picture', '0', qrValid._id, path);
    res.send('Done');

    //Saves images in cloudinary
})

module.exports = router
