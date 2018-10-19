/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Exception = require("../../../server/systems/common/exception");
var Session = require("../../../server/systems/session/controllers/session_controller");
exports.router = express.Router();
var TException = Exception;
var exception = new TException();
var TSession = Session;
var session = new TSession();
exports.router.get("/api", [exception.exception, exception.guard, exception.authenticate, session.get_session]);
exports.router.put("/api", [exception.exception, exception.guard, exception.authenticate, session.put_session]);
module.exports = exports.router;
//# sourceMappingURL=api.js.map