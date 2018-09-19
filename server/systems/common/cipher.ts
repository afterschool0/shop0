/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace CipherModule {

    const cipher_crypto: any = require('crypto');
    const cipher_cryptico: any = require('cryptico');

    const cipher_mode = 'aes-256-cbc';
    const seed = '0123456789abcdef';

    export class Cipher {

        static Md5(data: string): string {
            const md5hash = cipher_crypto.createHash('md5');
            md5hash.update(data);
            return md5hash.digest('hex');
        }

        static FixedCrypt(name: string, password: string): string | undefined {
            try {
                const key = new Buffer(Cipher.Md5(password), 'utf8');
                const iv = new Buffer(seed, 'utf8');
                let cipher: any = cipher_crypto.createCipheriv(cipher_mode, key, iv);
                let crypted: string = cipher.update(name, 'utf8', 'hex');
                crypted += cipher.final('hex');
                return crypted;
            } catch (ex) {
                console.log(ex.message);
            }
        }

        static FixedDecrypt(name: string, password: string): string | undefined {
            try {
                const key = new Buffer(Cipher.Md5(password), 'utf8');
                const iv = new Buffer(seed, 'utf8');
                let decipher: any = cipher_crypto.createDecipheriv(cipher_mode, key, iv);
                let decrypted: string = decipher.update(name, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            } catch (ex) {
                console.log(ex.message);
            }
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

        static PublicKeyDecrypt(passphrase: string, crypted: string): string {
            let secretkey: any = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.decrypt(crypted, secretkey);
        }
    }
}
module.exports = CipherModule;
