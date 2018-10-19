/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var configModule = require("config");
var Exception = require("../../../server/systems/common/exception");
var Auth = require("../../../server/systems/auth/controllers/auth_controller");
var LocalAccount = require("../../../models/systems/accounts/account");
exports.router = express.Router();
var config = configModule.get("systems");
var TException = Exception;
var exception = new TException();
var TAuth = Auth;
var auth = new TAuth();
var message = config.message;
var exit_point = "";
if (config.exit_point) {
    exit_point = config.exit_point;
}
exports.router.get("/" + exit_point, [function (request, response) {
        var local = { mails: [""], nickname: "" };
        if (request.user) {
            local = request.user.local;
        }
        response.render("applications/front/index", {
            role: LocalAccount.Role(request.user),
            local: local,
            message: message
        });
    }]);
exports.router.get("/users", [exception.page_catch, exception.page_guard, auth.page_is_system, function (request, response) {
        var local = { mails: [""], nickname: "" };
        if (request.user) {
            local = request.user.local;
        }
        response.render("applications/front/users", {
            role: LocalAccount.Role(request.user),
            local: local,
            message: message
        });
    }]);
module.exports = exports.router;
//# sourceMappingURL=pages.js.map