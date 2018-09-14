/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace SessionApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const path: any = require('path');

    const ExceptionController: any = require(path.join(process.cwd() , "server/systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const SessionModule: any = require(path.join(process.cwd() , "server/systems/session/controllers/session_controller"));
    const session: any = new SessionModule.Session;

    router.get("/api", [exception.exception, exception.guard, exception.authenticate, session.get]);
    router.put("/api", [exception.exception, exception.guard, exception.authenticate, session.put]);

}

module.exports = SessionApiRouter.router;

