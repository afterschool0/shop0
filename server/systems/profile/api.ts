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

    const ExceptionController: any = require(path.join(process.cwd(), "server/systems/common/exception"));
    const exception: any = new ExceptionController.Exception();

    const ProfileModule: any = require(path.join(process.cwd(), "server/systems/profile/controllers/profile_controller"));
    const profile: any = new ProfileModule.Profile;

    router.get("/api", [exception.exception, exception.guard, exception.authenticate, profile.get_profile]);
    router.put("/api", [exception.exception, exception.guard, exception.authenticate, profile.put_profile]);

    // api base
    const CipherModule: any = require(path.join(process.cwd(), "server/systems/common/cipher"));
    const Cipher: any = CipherModule.Cipher;

    router.get("/api/test/:token", [exception.exception, (request: any, response: any) => {
        let token = request.params.token;
        // by_user token to by_user passphrase
        Cipher.Account(token, "opensesame", (error: any, account: any) => {
            if (!error) {
                if (account) {
                    // encode
                }
            }
        });
    }]);

}

module.exports = ProfileApiRouter.router;

