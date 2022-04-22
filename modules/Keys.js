const NodeRSA = require('node-rsa');
const fs = require('fs');

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

// keyRSA.importKey(privKey, 'private')
// keyRSA.importKey(pubKey, 'public')
//console.log(keyRSA.getKeySize());
//console.log(keyRSA.getMaxMessageSize());
// console.log(keyRSA.exportKey('private'));
// console.log(keyRSA.exportKey('public'));

const keyRSA = new NodeRSA();
keyRSA.setOptions({encryptionScheme: 'pkcs1'});
keyRSA.importKey(fs.readFileSync('./keys/private.pem', 'utf-8'), 'private');
keyRSA.importKey(fs.readFileSync('./keys/public.pem', 'utf-8'), 'public');

module.exports = keyRSA
