/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace PublicKeyApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const path: any = require('path');

    const ExceptionController: any = require(path.join(process.cwd(), "server/systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    /*! public key */
    const PublicKeyController: any = require(path.join(process.cwd(), "server/systems/publickey/controllers/publickey_controller"));
    const publickey: any = new PublicKeyController.PublicKey();

    router.get("/fixed", [publickey.get_fixed_public_key]);

    router.get("/dynamic", [exception.exception, exception.guard, exception.authenticate, publickey.get_public_key]);

    router.get("/token", [exception.exception, exception.guard, exception.authenticate, publickey.get_access_token]);
}

module.exports = PublicKeyApiRouter.router;