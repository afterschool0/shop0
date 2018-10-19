/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Exception = require("../../../server/systems/common/exception");
var Profile = require("../../../server/systems/profile/controllers/profile_controller");
var Cipher = require("../../../server/systems/common/cipher");
exports.router = express.Router();
var TException = Exception;
var exception = new TException();
var TProfile = Profile;
var profile = new TProfile();
exports.router.get("/api", [exception.exception, exception.guard, exception.authenticate, profile.get_profile]);
exports.router.put("/api", [exception.exception, exception.guard, exception.authenticate, profile.put_profile]);
var TCipher = Cipher;
var cipher = new TCipher();
exports.router.get("/api/test/:token", [exception.exception, function (request, response) {
        var token = request.params.token;
        // by_user token to by_user passphrase
        cipher.Account(token, "opensesame", function (error, account) {
            if (!error) {
                if (account) {
                    // encode
                }
            }
        });
    }]);
module.exports = exports.router;
//# sourceMappingURL=api.js.map