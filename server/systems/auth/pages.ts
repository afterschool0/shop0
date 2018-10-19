/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

import * as Express from 'express';
import * as ConfigModule from 'config';

import * as Exception from "../../../server/systems/common/exception";

export const router: IRouter = Express.Router();

const config: any = ConfigModule.get("systems");
const message: any = config.message;

const TException: any = Exception;
const exception = new TException();

router.get('/dialogs/registerdialog', [exception.page_catch, (request: any, response: any): void => {
    response.render('systems/auth/dialogs/registerdialog', {config: config, message: message});
}]);

router.get("/dialogs/registerconfirmdialog", [exception.page_catch, (request: any, response: any): void => {
    response.render("systems/auth/dialogs/registerconfirmdialog", {config: config, message: message});
}]);

router.get('/dialogs/memberdialog', [exception.page_guard, (request: any, response: any): void => {
    response.render('systems/auth/dialogs/memberdialog', {config: config, message: message});
}]);

router.get("/dialogs/memberconfirmdialog", [exception.page_guard, (request: any, response: any): void => {
    response.render("systems/auth/dialogs/memberconfirmdialog", {config: config, message: message});
}]);

router.get("/dialogs/logindialog", [exception.page_catch, (request: any, response: any): void => {
    response.render("systems/auth/dialogs/logindialog", {config: config, message: message});
}]);

router.get("/dialogs/passworddialog", [exception.page_catch, (request: any, response: any): void => {
    response.render("systems/auth/dialogs/passworddialog", {user: request.user, message: message});
}]);

router.get("/dialogs/passwordconfirmdialog", [exception.page_catch, (request: any, response: any): void => {
    response.render("systems/auth/dialogs/passwordconfirmdialog", {config: config, message: message});
}]);

router.get("/common/alert_dialog", [exception.page_catch, (request: any, response: any): void => {
    response.render("systems/common/alert_dialog", {config: config, message: message});
}]);

// mail test view.

router.get("/mail/regist_mail", [exception.page_catch, (request: any, response: any): void => {
    response.render("systems/auth/mail/regist_mail", {config: config, link: ""});
}]);

router.get("/mail/password_mail", [exception.page_catch, (request: any, response: any): void => {
    response.render("systems/auth/mail/password_mail", {config: config, link: ""});
}]);

module.exports = router;