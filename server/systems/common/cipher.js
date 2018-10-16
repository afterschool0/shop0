/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CipherModule;
(function (CipherModule) {
    var path = require('path');
    var config = require('config').get("systems");
    var LocalAccount = require(path.join(process.cwd(), "models/systems/accounts/account"));
    var cipher_crypto = require('crypto');
    var cipher_cryptico = require('cryptico');
    var cipher_mode = 'aes-256-cbc';
    var seed = '0123456789abcdef';
    var Cipher = /** @class */ (function () {
        function Cipher() {
        }
        Cipher.Md5 = function (data) {
            var md5hash = cipher_crypto.createHash('md5');
            md5hash.update(data);
            return md5hash.digest('hex');
        };
        Cipher.FixedCrypt = function (name, password) {
            var crypted = "";
            try {
                var key = new Buffer(Cipher.Md5(password), 'utf8');
                var iv = new Buffer(seed, 'utf8');
                var cipher = cipher_crypto.createCipheriv(cipher_mode, key, iv);
                crypted = cipher.update(name, 'utf8', 'hex');
                crypted += cipher.final('hex');
            }
            catch (ex) {
                console.log(ex.message);
            }
            return crypted;
        };
        Cipher.FixedDecrypt = function (name, password) {
            var decrypted = "";
            try {
                var key = new Buffer(Cipher.Md5(password), 'utf8');
                var iv = new Buffer(seed, 'utf8');
                var decipher = cipher_crypto.createDecipheriv(cipher_mode, key, iv);
                decrypted = decipher.update(name, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
            }
            catch (ex) {
                console.log(ex.message);
            }
            return decrypted;
        };
        Cipher.PublicKey = function (passphrase) {
            var secretkey = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.publicKeyString(secretkey);
        };
        Cipher.PublicKeyEncrypt = function (publickey, plain) {
            return cipher_cryptico.encrypt(plain, publickey);
        };
        Cipher.PublicKeyDecrypt = function (passphrase, crypted) {
            var secretkey = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.decrypt(crypted, secretkey);
        };
        Cipher.Token = function (username, key, callback) {
            LocalAccount.findOne({ $and: [{ provider: "local" }, { username: username }] }).then(function (account) {
                if (account) {
                    var token_object = { username: username, key: key, timestamp: Date.now() };
                    var encoded_token = Cipher.FixedCrypt(JSON.stringify(token_object), config.tokensecret);
                    callback(null, encoded_token);
                }
                else {
                    callback({ code: 1, message: "account not found." }, null);
                }
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Cipher.Account = function (encoded_token, key, callback) {
            try {
                var token_string = Cipher.FixedDecrypt(encoded_token, config.tokensecret);
                var token_object = JSON.parse(token_string);
                if (token_object.key == key) {
                    LocalAccount.findOne({ $and: [{ provider: "local" }, { username: token_object.username }] }).then(function (account) {
                        if (account) {
                            callback(null, account);
                        }
                        else {
                            callback({ code: 1, message: "account not found." }, null);
                        }
                    }).catch(function (error) {
                        callback(error, "");
                    });
                }
                else {
                    callback({ code: 1, message: "auth fail." }, null);
                }
            }
            catch (exept) {
                callback(exept, null);
            }
        };
        return Cipher;
    }());
    CipherModule.Cipher = Cipher;
})(CipherModule = exports.CipherModule || (exports.CipherModule = {}));
module.exports = CipherModule;
//# sourceMappingURL=cipher.js.map