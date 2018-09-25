/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthApiRouter;
(function (AuthApiRouter) {
    var express = require('express');
    AuthApiRouter.router = express.Router();
    var passport = require("passport");
    var path = require('path');
    var AuthController = require(path.join(process.cwd(), "server/systems/auth/controllers/auth_controller"));
    var auth = new AuthController.Auth;
    var ExceptionController = require(path.join(process.cwd(), "server/systems/common/exception"));
    var exception = new ExceptionController.Exception();
    AuthApiRouter.router.post("/local/register", [exception.exception, exception.guard, auth.is_enabled_regist_user, auth.post_local_register]);
    AuthApiRouter.router.get("/register/:token", [auth.get_register_token]);
    AuthApiRouter.router.post("/local/member", [exception.exception, exception.guard, exception.authenticate, auth.is_enabled_regist_member, auth.post_member_register]);
    AuthApiRouter.router.get("/member/:token", [auth.get_member_token]);
    AuthApiRouter.router.post("/local/username", [exception.exception, exception.guard, exception.authenticate, auth.post_local_username]);
    AuthApiRouter.router.get("/username/:token", [auth.get_username_token]);
    AuthApiRouter.router.post("/local/password", [exception.exception, exception.guard, auth.post_local_password]);
    AuthApiRouter.router.get("/password/:token", [auth.get_password_token]);
    AuthApiRouter.router.post("/local/login", [exception.exception, exception.guard, auth.post_local_login]);
    AuthApiRouter.router.get("/logout", [exception.exception, exception.guard, exception.authenticate, auth.logout]);
    // facebook
    AuthApiRouter.router.get("/facebook", passport.authenticate("facebook", { scope: ["email"], session: true }));
    AuthApiRouter.router.get("/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/" }), auth.auth_facebook_callback);
    // twitter
    AuthApiRouter.router.get('/twitter', passport.authenticate('twitter'));
    AuthApiRouter.router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), auth.auth_twitter_callback);
    // instagram
    AuthApiRouter.router.get('/instagram', passport.authenticate("instagram"));
    AuthApiRouter.router.get('/instagram/callback', passport.authenticate("instagram", { failureRedirect: '/' }), auth.auth_instagram_callback);
    // line
    AuthApiRouter.router.get('/line', passport.authenticate('line'));
    AuthApiRouter.router.get('/line/callback', passport.authenticate('line', { failureRedirect: '/' }), auth.auth_line_callback);
    var CipherModule = require(path.join(process.cwd(), "server/systems/common/cipher"));
    var Cipher = CipherModule.Cipher;
    AuthApiRouter.router.get('/test', function (request, response) {
        // let key =  Cipher.GetIP(request); //IP制限の場合
        var key = "opensesame"; //secret文字列の場合
        //  token by user
        Cipher.Token("oda.mikio@gmail.com", key, function (error, token_by_user) {
            if (!error) {
                console.log(token_by_user);
                //
                //
                //
                //
                //
                // by_user token to by_user passphrase
                Cipher.Account(token_by_user, key, function (error, account) {
                    if (!error) {
                        if (account) {
                            // encode
                            var publickey_by_user = Cipher.PublicKey(account.passphrase);
                            var enc = Cipher.PublicKeyEncrypt(publickey_by_user, "hoge");
                            if (enc.status === "success") {
                                var encoded_string = enc.cipher;
                                //
                                //
                                //
                                //
                                //
                                // decode
                                var dec = Cipher.PublicKeyDecrypt(account.passphrase, encoded_string);
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
})(AuthApiRouter = exports.AuthApiRouter || (exports.AuthApiRouter = {}));
module.exports = AuthApiRouter.router;
//# sourceMappingURL=api.js.map