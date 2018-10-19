/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var passport = require("passport");
var Auth = require("../../../server/systems/auth/controllers/auth_controller");
var Exception = require("../../../server/systems/common/exception");
var Cipher = require("../../../server/systems/common/cipher");
var IPV6 = require("../../../server/systems/common/ipv6");
exports.router = express.Router();
var TAuth = Auth;
var auth = new TAuth();
var TException = Exception;
var exception = new TException();
exports.router.post("/local/register", [exception.exception, exception.guard, auth.is_enabled_regist_user, auth.post_local_register]);
exports.router.get("/register/:token", [auth.get_register_token]);
exports.router.post("/local/password", [exception.exception, exception.guard, auth.post_local_password]);
exports.router.get("/password/:token", [auth.get_password_token]);
exports.router.post("/local/login", [exception.exception, exception.guard, auth.post_local_login]);
exports.router.get("/logout", [exception.exception, exception.guard, exception.authenticate, auth.logout]);
// facebook
exports.router.get("/facebook", passport.authenticate("facebook", { scope: ["email"], session: true }));
exports.router.get("/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/" }), auth.auth_facebook_callback);
// twitter
exports.router.get('/twitter', passport.authenticate('twitter'));
exports.router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), auth.auth_twitter_callback);
// instagram
exports.router.get('/instagram', passport.authenticate("instagram"));
exports.router.get('/instagram/callback', passport.authenticate("instagram", { failureRedirect: '/' }), auth.auth_instagram_callback);
// line
exports.router.get('/line', passport.authenticate('line'));
exports.router.get('/line/callback', passport.authenticate('line', { failureRedirect: '/' }), auth.auth_line_callback);
//const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
//const Wrapper: any = new PromisedModule.Wrapper();
//const CipherModule: any = require(path.join(process.cwd(), "server/systems/common/cipher"));
var TCipher = Cipher;
var cipher = new TCipher();
var TIPV6 = IPV6;
var ipv6 = TIPV6;
exports.router.get('/token/make', function (request, response) {
    var key = ipv6.GetIPV6(request); //IP制限の場合
    cipher.Token("oda.mikio@gmail.com", key, function (error, token_by_user) {
        if (!error) {
            response.send(token_by_user);
        }
        else {
            response.send(error.message);
        }
    });
});
exports.router.get('/token/enc/:token/:plain', function (request, response) {
    var key = ipv6.GetIPV6(request); //IP制限の場合
    var token = request.params.token;
    var plain = request.params.plain;
    cipher.Account(token, key, function (error, account) {
        if (!error) {
            if (account) {
                var publickey_by_user = cipher.PublicKey(account.passphrase);
                var enc = cipher.PublicKeyEncrypt(publickey_by_user, plain);
                if (enc.status === "success") {
                    response.send(encodeURIComponent(enc.cipher));
                }
            }
            else {
                response.send("NG");
            }
        }
        else {
            response.send(error.message);
        }
    });
});
exports.router.get('/token/dec/:token/:cipher', function (request, response) {
    var key = ipv6.GetIPV6(request); //IP制限の場合
    var token = request.params.token;
    var cipher_string = decodeURIComponent(request.params.cipher);
    cipher.Account(token, key, function (error, account) {
        if (!error) {
            if (account) {
                var dec = cipher.PublicKeyDecrypt(account.passphrase, cipher_string);
                if (dec.status === "success") {
                    response.send(dec.plaintext);
                }
            }
            else {
                response.send("NG");
            }
        }
        else {
            response.send(error.message);
        }
    });
});
exports.router.get('/test', function (request, response) {
    //let key = "opensesame";         //secret文字列の場合
    var key = ipv6.GetIPV6(request); //IP制限の場合
    //  token by user
    cipher.Token("oda.mikio@gmail.com", key, function (error, token_by_user) {
        if (!error) {
            console.log(token_by_user); //create token.
            //
            //
            //
            //
            //
            // use token
            // by_user token to by_user passphrase
            cipher.Account(token_by_user, key, function (error, account) {
                if (!error) {
                    if (account) {
                        // encode
                        var publickey_by_user = cipher.PublicKey(account.passphrase);
                        var enc = cipher.PublicKeyEncrypt(publickey_by_user, "hoge");
                        if (enc.status === "success") {
                            var encoded_string = enc.cipher;
                            //
                            //
                            //
                            //
                            //
                            // decode
                            var dec = cipher.PublicKeyDecrypt(account.passphrase, encoded_string);
                            if (dec.status === "success") {
                                var decoded_string = dec.plaintext;
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
    });
});
module.exports = exports.router;
//# sourceMappingURL=api.js.map