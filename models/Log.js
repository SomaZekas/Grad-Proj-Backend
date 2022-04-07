const fs = require('fs')

const addLogs = (type, id1, id2, ip) => {
    const logTime = new Date().toLocaleString();
    if (type == 'server-boot'){
        fs.appendFile(
            './logs/server-logs.txt',
            logTime + ': Server successfully booted.\n',
            err => { if (err) throw err; }
        )

    } else if (type == 'web-employee-login') {
        fs.appendFile(
            './logs/employee-logs.txt',
            logTime + ': Employee with id of {_id: ObjectId(\'' + id1 + '\')} logged in with ip ' + ip + '.\n',
            err => { if (err) throw err; }
        )
    } else if (type == 'web-admin-login') {
        fs.appendFile(
            './logs/admin-logs.txt',
            logTime + ': Admin with id of {_id: ObjectId(\'' + id1 + '\')} logged in with ip ' + ip + '.\n',
            err => { if (err) throw err; }
        )
    } else if (type == 'mobile-owner-login') {
        fs.appendFile(
            './logs/owner-logs.txt',
            logTime + ': Owner with id of {_id: ObjectId(\'' + id1 + '\')} logged in with ip ' + ip + '.\n',
            err => { if (err) throw err; }
        )
    } else if (type == 'mobile-owner-add-guest') {
        fs.appendFile(
            './logs/owner-logs.txt',
            logTime + ': Owner with id of {_id: ObjectId(\'' + id1 + '\')} a guest with id of {_id: ObjectId(\'' + id2 + '\')} and generated a QR Code.\n',
            err => { if (err) throw err; }
        )
    } else if (type == 'hardware-guest') {
        fs.appendFile(
            './logs/guest-logs.txt',
            logTime + ': Guest with id of {_id: ObjectId(\'' + id1 + '\')} entered the premiter with QR Code linked with owner\'s id of {_id: ObjectId(\'' + id2 + '\')}.\n',
            err => { if (err) throw err; }
        )
    }
}

module.exports = addLogs;