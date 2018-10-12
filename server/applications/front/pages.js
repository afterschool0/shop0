/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PageRouter;
(function (PageRouter) {
    var express = require('express');
    PageRouter.router = express.Router();
    var path = require('path');
    var _ = require('lodash');
    //const AuthController: any = require(path.join(process.cwd(), "server/systems/auth/controllers/auth_controller"));
    //  const auth: any = new AuthController.Auth();
    var LocalAccount = require(path.join(process.cwd(), "models/systems/accounts/account"));
    var ExceptionController = require(path.join(process.cwd(), "server/systems/common/exception"));
    var exception = new ExceptionController.Exception;
    var _config = require('config');
    var config = _config.get("systems");
    var message = config.message;
    var exit_point = "";
    if (config.exit_point) {
        exit_point = config.exit_point;
    }
    PageRouter.router.get("/" + exit_point, [function (request, response) {
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
})(PageRouter = exports.PageRouter || (exports.PageRouter = {}));
module.exports = PageRouter.router;
//# sourceMappingURL=pages.js.map