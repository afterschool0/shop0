/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace CipherModule {

    const path: any = require('path');

    const LocalAccount: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

    const _config: any = require('config');
    const config: any = _config.get("systems");

    const cipher_crypto: any = require('crypto');
    const cipher_cryptico: any = require('cryptico');

    const cipher_mode = 'aes-256-cbc';
    const seed = '0123456789abcdef';

    interface Decoded {
        status: string,
        plaintext: string,
        signeture: string
    }

    interface Encoded {
        status: string,
        cipher: string
    }

    export class Cipher {

        static Md5(data: string): string {
            const md5hash = cipher_crypto.createHash('md5');
            md5hash.update(data);
            return md5hash.digest('hex');
        }

        static FixedCrypt(name: string, password: string): string {
            let crypted: string = "";
            try {
                const key = new Buffer(Cipher.Md5(password), 'utf8');
                const iv = new Buffer(seed, 'utf8');
                let cipher: any = cipher_crypto.createCipheriv(cipher_mode, key, iv);
                crypted = cipher.update(name, 'utf8', 'hex');
                crypted += cipher.final('hex');

            } catch (ex) {
                console.log(ex.message);
            }
            return crypted;
        }

        static FixedDecrypt(name: string, password: string): string {
            let decrypted: string = "";
            try {
                const key = new Buffer(Cipher.Md5(password), 'utf8');
                const iv = new Buffer(seed, 'utf8');
                let decipher: any = cipher_crypto.createDecipheriv(cipher_mode, key, iv);
                decrypted = decipher.update(name, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
            } catch (ex) {
                console.log(ex.message);
            }
            return decrypted;
        }

        /*
                static FixedCrypt(name: string, password: string): string | undefined {
                    let cipher: any = cipher_crypto.createCipher('aes192', password);
                    try {
                        let crypted: string = cipher.update(name, 'utf8', 'hex');
                        crypted += cipher.final('hex');
                        return crypted;
                    } catch (ex) {
                        console.log(ex.message);
                    }
                }

                static FixedDecrypt(name: string, password: string): string | undefined {
                    let decipher: any = cipher_crypto.createDecipher('aes192', password);
                    try {
                        let decrypted: string = decipher.update(name, 'hex', 'utf8');
                        decrypted += decipher.final('utf8');
                        return decrypted;
                    } catch (ex) {
                        console.log(ex.message);
                    }
                }
        */


        static PublicKey(passphrase: string): string {
            let secretkey: any = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.publicKeyString(secretkey);
        }

        static PublicKeyEncrypt(publickey: string, plain: string): Encoded {
            return cipher_cryptico.encrypt(plain, publickey);
        }

        static PublicKeyDecrypt(passphrase: string, crypted: string): Decoded {
            let secretkey: any = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.decrypt(crypted, secretkey);
        }

        static GetIP(request: any): string {
            //::ffff:180.131.105.72
            if (request.headers['x-forwarded-for']) {
                return request.headers['x-forwarded-for'];
            }
            if (request.connection && request.connection.remoteAddress) {
                return request.connection.remoteAddress;
            }
            if (request.connection.socket && request.connection.socket.remoteAddress) {
                return request.connection.socket.remoteAddress;
            }
            if (request.socket && request.socket.remoteAddress) {
                return request.socket.remoteAddress;
            }
            return '0.0.0.0';
        };

        static Token(username: string, key: string, callback: (error: any, result: any) => void): void {
            LocalAccount.findOne({$and: [{provider: "local"}, {username: username}]}).then((account: any): void => {
                if (account) {
                    let token_object: any = {username: username, key: key, timestamp: Date.now()};
                    let encoded_token: any = Cipher.FixedCrypt(JSON.stringify(token_object), config.tokensecret);
                    callback(null, encoded_token);
                } else {
                    callback({code: 1, message: "account not found."}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        static Account(encoded_token: string, key: string, callback: (error: any, result: any) => void): void {
            try {
                let token_string: string = Cipher.FixedDecrypt(encoded_token, config.tokensecret);
                let token_object: any = JSON.parse(token_string);
                if (token_object.key == key) {
                    LocalAccount.findOne({$and: [{provider: "local"}, {username: token_object.username}]}).then((account: any): void => {
                        if (account) {
                            callback(null, account);
                        } else {
                            callback({code: 1, message: "account not found."}, null);
                        }
                    }).catch((error: any): void => {
                        callback(error, "");
                    });
                } else {
                    callback({code:1, message:"auth fail."}, null);
                }
            } catch (exept) {
                callback(exept, null);
            }
        }

    }
}
module.exports = CipherModule;
