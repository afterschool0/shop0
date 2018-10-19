/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

import * as express from 'express';
import * as passport from "passport";

import * as Auth from "../../../server/systems/auth/controllers/auth_controller";
import * as Exception from "../../../server/systems/common/exception";

import * as Cipher from "../../../server/systems/common/cipher";

import * as IPV6 from "../../../server/systems/common/ipv6";

export const router: IRouter = express.Router();

const TAuth: any = Auth;
const auth = new TAuth();

const TException: any = Exception;
const exception = new TException();

router.post("/local/register", [exception.exception, exception.guard, auth.is_enabled_regist_user, auth.post_local_register]);
router.get("/register/:token", [auth.get_register_token]);

router.post("/local/password", [exception.exception, exception.guard, auth.post_local_password]);
router.get("/password/:token", [auth.get_password_token]);

router.post("/local/login", [exception.exception, exception.guard, auth.post_local_login]);
router.get("/logout", [exception.exception, exception.guard, exception.authenticate, auth.logout]);

// facebook
router.get("/facebook", passport.authenticate("facebook", {scope: ["email"], session: true}));
router.get("/facebook/callback", passport.authenticate("facebook", {failureRedirect: "/"}), auth.auth_facebook_callback);

// twitter
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/'}), auth.auth_twitter_callback);

// instagram
router.get('/instagram', passport.authenticate("instagram"));
router.get('/instagram/callback', passport.authenticate("instagram", {failureRedirect: '/'}), auth.auth_instagram_callback);

// line
router.get('/line', passport.authenticate('line'));
router.get('/line/callback', passport.authenticate('line', {failureRedirect: '/'}), auth.auth_line_callback);

//const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
//const Wrapper: any = new PromisedModule.Wrapper();

//const CipherModule: any = require(path.join(process.cwd(), "server/systems/common/cipher"));

const TCipher: any = Cipher;
const cipher = new TCipher();

const TIPV6:any = IPV6;
const ipv6 = TIPV6;

interface Decoded {
    status: string,
    plaintext: string,
    signeture: string
}

interface Encoded {
    status: string,
    cipher: string
}

router.get('/token/make', (request: any, response: any) => {

    let key = ipv6.GetIPV6(request); //IP制限の場合

    cipher.Token("oda.mikio@gmail.com", key, (error: any, token_by_user: string) => {
        if (!error) {
            response.send(token_by_user);
        } else {
            response.send(error.message);
        }
    })

});

router.get('/token/enc/:token/:plain', (request: any, response: any) => {

    let key = ipv6.GetIPV6(request); //IP制限の場合
    let token = request.params.token;
    let plain = request.params.plain;

    cipher.Account(token, key, (error: any, account: any) => {
        if (!error) {
            if (account) {
                let publickey_by_user: string = cipher.PublicKey(account.passphrase);
                let enc: Encoded = cipher.PublicKeyEncrypt(publickey_by_user, plain);
                if (enc.status === "success") {
                    response.send(encodeURIComponent(enc.cipher));
                }
            } else {
                response.send("NG");
            }
        } else {
            response.send(error.message);
        }
    });

});

router.get('/token/dec/:token/:cipher', (request: any, response: any) => {

    let key = ipv6.GetIPV6(request); //IP制限の場合
    let token = request.params.token;
    let cipher_string = decodeURIComponent(request.params.cipher);

    cipher.Account(token, key, (error: any, account: any) => {
        if (!error) {
            if (account) {
                let dec: Decoded = cipher.PublicKeyDecrypt(account.passphrase, cipher_string);
                if (dec.status === "success") {
                    response.send(dec.plaintext);
                }
            } else {
                response.send("NG");
            }
        } else {
            response.send(error.message);
        }
    });
});

router.get('/test', (request: any, response: any) => {

    //let key = "opensesame";         //secret文字列の場合
    let key = ipv6.GetIPV6(request); //IP制限の場合

    //  token by user
    cipher.Token("oda.mikio@gmail.com", key, (error: any, token_by_user: string) => {
        if (!error) {
            console.log(token_by_user); //create token.


            //
            //
            //
            //
            //


            // use token
            // by_user token to by_user passphrase
            cipher.Account(token_by_user, key, (error: any, account: any) => {
                if (!error) {
                    if (account) {
                        // encode
                        let publickey_by_user: string = cipher.PublicKey(account.passphrase);
                        let enc: Encoded = cipher.PublicKeyEncrypt(publickey_by_user, "hoge");
                        if (enc.status === "success") {
                            let encoded_string = enc.cipher;

                            //
                            //
                            //
                            //
                            //

                            // decode
                            let dec: Decoded = cipher.PublicKeyDecrypt(account.passphrase, encoded_string);
                            if (dec.status === "success") {
                                let decoded_string = dec.plaintext;

                                //
                                //
                                //
                                //
                                //

                                response.send(decoded_string);
                            }

                        }
                    }
                }
            });
        }
    })
});

module.exports = router;