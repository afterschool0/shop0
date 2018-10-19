/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

import * as express from "express";
import * as configModule from 'config';

import * as Exception from "../../../server/systems/common/exception";
import * as Auth from "../../../server/systems/auth/controllers/auth_controller";
import * as LocalAccount from "../../../models/systems/accounts/account";

export const router: IRouter = express.Router();

const config: any = configModule.get("systems");

const TException: any = Exception;
const exception = new TException();

const TAuth: any = Auth;
const auth = new TAuth();

const message: any = config.message;

let exit_point = "";
if (config.exit_point) {
    exit_point = config.exit_point;
}

router.get("/" + exit_point, [(request: any, response: any): void => {
    let local = {mails: [""], nickname: ""};
    if (request.user) {
        local = request.user.local;
    }
    response.render("applications/front/index", {
        role: LocalAccount.Role(request.user),
        local: local,
        message: message
    });
}]);

router.get("/users", [exception.page_catch, exception.page_guard, auth.page_is_system, (request: any, response: any): void => {
    let local = {mails: [""], nickname: ""};
    if (request.user) {
        local = request.user.local;
    }
    response.render("applications/front/users", {
        role: LocalAccount.Role(request.user),
        local: local,
        message: message
    });
}]);

module.exports = router;