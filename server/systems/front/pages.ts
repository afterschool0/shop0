/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace PageRouter {

    const express = require('express');
    export const router: IRouter = express.Router();
    const path: any = require('path');
    const _ = require('lodash');


    const LocalAccount: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

    const ExceptionController: any = require( path.join(process.cwd(), "server/systems/common/exception"));
    const exception: any = new ExceptionController.Exception;

    const _config: any = require('config');
    const config: any = _config.get("systems");
    const message: any = config.message;

    let exit_point = "";
    if (config.exit_point) {
        exit_point = config.exit_point;
    }

    router.get("/" + exit_point, [ (request: any, response: any): void => {
        let local = {mails:[""],nickname:""};
        if (request.user) {
            local = request.user.local;
        }
        response.render("applications/front/index", {
            local:local,
            role: LocalAccount.Role(request.user),
            message: message,
            status: 200
        });
    }]);

    router.get("/common/alert_dialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/common/alert_dialog", {config: config, message: message});
    }]);

}

module.exports = PageRouter.router;