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

    const AuthController: any = require(path.join(process.cwd(), "server/systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth();

    const _config: any = require('config');
    const config: any = _config.get("systems");
    const message: any = config.message;

    router.get("/front", [ (request: any, response: any): void => {
        let local = {mails:[""],nickname:""};
        if (request.user) {
            local = request.user.local;
        }
        response.render("applications/front/index", {
            local:local,
            role: auth.role(request.user),
            message: message,
            status: 200
        });
    }]);

}

module.exports = PageRouter.router;