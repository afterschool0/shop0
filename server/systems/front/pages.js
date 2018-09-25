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
    var AuthController = require(path.join(process.cwd(), "server/systems/auth/controllers/auth_controller"));
    var auth = new AuthController.Auth();
    var ExceptionController = require(path.join(process.cwd(), "server/systems/common/exception"));
    var exception = new ExceptionController.Exception;
    var _config = require('config');
    var config = _config.get("systems");
    var message = config.message;
    var mount_path = "";
    if (config.mount_path) {
        mount_path = config.mount_path;
    }
    PageRouter.router.get("/" + mount_path, [function (request, response) {
            var local = { mails: [""], nickname: "" };
            if (request.user) {
                local = request.user.local;
            }
            response.render("systems/front/index", {
                local: local,
                role: auth.role(request.user),
                message: message,
                status: 200
            });
        }]);
    PageRouter.router.get("/common/alert_dialog", [exception.page_catch, function (request, response) {
            response.render("systems/common/alert_dialog", { config: config, message: message });
        }]);
})(PageRouter = exports.PageRouter || (exports.PageRouter = {}));
module.exports = PageRouter.router;
//# sourceMappingURL=pages.js.map