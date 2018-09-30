/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProfileApiRouter;
(function (ProfileApiRouter) {
    var path = require('path');
    var express = require('express');
    ProfileApiRouter.router = express.Router();
    var ExceptionController = require(path.join(process.cwd(), "server/systems/common/exception"));
    var exception = new ExceptionController.Exception();
    var ProfileModule = require(path.join(process.cwd(), "server/systems/profile/controllers/profile_controller"));
    var profile = new ProfileModule.Profile;
    ProfileApiRouter.router.get("/api", [exception.exception, exception.guard, exception.authenticate, profile.get_profile]);
    ProfileApiRouter.router.put("/api", [exception.exception, exception.guard, exception.authenticate, profile.put_profile]);
    // api base
    var CipherModule = require(path.join(process.cwd(), "server/systems/common/cipher"));
    var Cipher = CipherModule.Cipher;
    ProfileApiRouter.router.get("/api/test/:token", [exception.exception, function (request, response) {
            var token = request.params.token;
            // by_user token to by_user passphrase
            Cipher.Account(token, "opensesame", function (error, account) {
                if (!error) {
                    if (account) {
                        // encode
                    }
                }
            });
        }]);
})(ProfileApiRouter = exports.ProfileApiRouter || (exports.ProfileApiRouter = {}));
module.exports = ProfileApiRouter.router;
//# sourceMappingURL=api.js.map