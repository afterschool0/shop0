/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Exception = require("../../../server/systems/common/exception");
var PublicKey = require("../../../server/systems/publickey/controllers/publickey_controller");
exports.router = express.Router();
var TException = Exception;
var exception = new TException();
var TPublickey = PublicKey;
var publickey = new TPublickey();
exports.router.get("/fixed", [publickey.get_fixed_public_key]);
exports.router.get("/dynamic", [exception.exception, exception.guard, exception.authenticate, publickey.get_public_key]);
exports.router.get("/token", [exception.exception, exception.guard, exception.authenticate, publickey.get_access_token]);
module.exports = exports.router;
//# sourceMappingURL=api.js.map