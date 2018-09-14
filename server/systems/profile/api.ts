/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace ProfileApiRouter {

    const path: any = require('path');

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const ExceptionController: any = require(path.join(process.cwd() , "server/systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const ProfileModule: any = require(path.join(process.cwd() , "server/systems/profile/controllers/profile_controller"));
    const profile: any = new ProfileModule.Profile;

    router.get("/api", [exception.exception, exception.guard, exception.authenticate, profile.get_profile]);
    router.put("/api", [exception.exception, exception.guard, exception.authenticate, profile.put_profile]);

}

module.exports = ProfileApiRouter.router;

