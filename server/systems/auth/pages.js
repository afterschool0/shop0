/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthPageRouter;
(function (AuthPageRouter) {
    var express = require('express');
    AuthPageRouter.router = express.Router();
    var _config = require('config');
    var config = _config.get("systems");
    var message = config.message;
    var path = require('path');
    var ExceptionController = require(path.join(process.cwd(), "server/systems/common/exception"));
    var exception = new ExceptionController.Exception;
    AuthPageRouter.router.get('/dialogs/registerdialog', [exception.page_catch, function (request, response) {
            response.render('systems/auth/dialogs/registerdialog', { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/registerconfirmdialog", [exception.page_catch, function (request, response) {
            response.render("systems/auth/dialogs/registerconfirmdialog", { config: config, message: message });
        }]);
    AuthPageRouter.router.get('/dialogs/memberdialog', [exception.page_guard, function (request, response) {
            response.render('systems/auth/dialogs/memberdialog', { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/memberconfirmdialog", [exception.page_guard, function (request, response) {
            response.render("systems/auth/dialogs/memberconfirmdialog", { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/logindialog", [exception.page_catch, function (request, response) {
            response.render("systems/auth/dialogs/logindialog", { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/passworddialog", [exception.page_catch, function (request, response) {
            response.render("systems/auth/dialogs/passworddialog", { user: request.user, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/passwordconfirmdialog", [exception.page_catch, function (request, response) {
            response.render("systems/auth/dialogs/passwordconfirmdialog", { config: config, message: message });
        }]);
    // mail test view.
    AuthPageRouter.router.get("/mail/regist_mail", [exception.page_catch, function (request, response) {
            response.render("systems/auth/mail/regist_mail", { config: config, link: "" });
        }]);
    AuthPageRouter.router.get("/mail/password_mail", [exception.page_catch, function (request, response) {
            response.render("systems/auth/mail/password_mail", { config: config, link: "" });
        }]);
    AuthPageRouter.router.get("/mail/regist_member_mail", [exception.page_catch, function (request, response) {
            response.render("systems/auth/mail/regist_member_mail", { config: config, link: "" });
        }]);
    AuthPageRouter.router.get("/mail/username_mail", [exception.page_catch, function (request, response) {
            response.render("systems/auth/mail/username_mail", { config: config, link: "" });
        }]);
})(AuthPageRouter = exports.AuthPageRouter || (exports.AuthPageRouter = {}));
module.exports = AuthPageRouter.router;
//# sourceMappingURL=pages.js.map