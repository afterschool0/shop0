/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Express = require("express");
var ConfigModule = require("config");
var Exception = require("../../../server/systems/common/exception");
exports.router = Express.Router();
var config = ConfigModule.get("systems");
var message = config.message;
var TException = Exception;
var exception = new TException();
exports.router.get('/dialogs/registerdialog', [exception.page_catch, function (request, response) {
        response.render('systems/auth/dialogs/registerdialog', { config: config, message: message });
    }]);
exports.router.get("/dialogs/registerconfirmdialog", [exception.page_catch, function (request, response) {
        response.render("systems/auth/dialogs/registerconfirmdialog", { config: config, message: message });
    }]);
exports.router.get('/dialogs/memberdialog', [exception.page_guard, function (request, response) {
        response.render('systems/auth/dialogs/memberdialog', { config: config, message: message });
    }]);
exports.router.get("/dialogs/memberconfirmdialog", [exception.page_guard, function (request, response) {
        response.render("systems/auth/dialogs/memberconfirmdialog", { config: config, message: message });
    }]);
exports.router.get("/dialogs/logindialog", [exception.page_catch, function (request, response) {
        response.render("systems/auth/dialogs/logindialog", { config: config, message: message });
    }]);
exports.router.get("/dialogs/passworddialog", [exception.page_catch, function (request, response) {
        response.render("systems/auth/dialogs/passworddialog", { user: request.user, message: message });
    }]);
exports.router.get("/dialogs/passwordconfirmdialog", [exception.page_catch, function (request, response) {
        response.render("systems/auth/dialogs/passwordconfirmdialog", { config: config, message: message });
    }]);
exports.router.get("/common/alert_dialog", [exception.page_catch, function (request, response) {
        response.render("systems/common/alert_dialog", { config: config, message: message });
    }]);
// mail test view.
exports.router.get("/mail/regist_mail", [exception.page_catch, function (request, response) {
        response.render("systems/auth/mail/regist_mail", { config: config, link: "" });
    }]);
exports.router.get("/mail/password_mail", [exception.page_catch, function (request, response) {
        response.render("systems/auth/mail/password_mail", { config: config, link: "" });
    }]);
module.exports = exports.router;
//# sourceMappingURL=pages.js.map