/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PublicKeyApiRouter;
(function (PublicKeyApiRouter) {
    var express = require('express');
    PublicKeyApiRouter.router = express.Router();
    var path = require('path');
    var ExceptionController = require(path.join(process.cwd(), "server/systems/common/exception"));
    var exception = new ExceptionController.Exception();
    /*! public key */
    var PublicKeyController = require(path.join(process.cwd(), "server/systems/publickey/controllers/publickey_controller"));
    var publickey = new PublicKeyController.PublicKey();
    PublicKeyApiRouter.router.get("/fixed", [publickey.get_fixed_public_key]);
    PublicKeyApiRouter.router.get("/dynamic", [exception.exception, exception.guard, exception.authenticate, publickey.get_public_key]);
    PublicKeyApiRouter.router.get("/token", [exception.exception, exception.guard, exception.authenticate, publickey.get_access_token]);
})(PublicKeyApiRouter = exports.PublicKeyApiRouter || (exports.PublicKeyApiRouter = {}));
module.exports = PublicKeyApiRouter.router;
//# sourceMappingURL=api.js.map