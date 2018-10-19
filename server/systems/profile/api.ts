/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

import * as express from 'express';
import * as Exception from "../../../server/systems/common/exception";
import * as Profile from "../../../server/systems/profile/controllers/profile_controller";
import * as Cipher from "../../../server/systems/common/cipher";

export const router: IRouter = express.Router();

const TException: any = Exception;
const exception: any = new TException();

const TProfile: any = Profile;
const profile: any = new TProfile();

router.get("/api", [exception.exception, exception.guard, exception.authenticate, profile.get_profile]);
router.put("/api", [exception.exception, exception.guard, exception.authenticate, profile.put_profile]);

const TCipher: any = Cipher;
const cipher = new TCipher();

router.get("/api/test/:token", [exception.exception, (request: any, response: any) => {
    let token = request.params.token;
    // by_user token to by_user passphrase
    cipher.Account(token, "opensesame", (error: any, account: any) => {
        if (!error) {
            if (account) {
                // encode
            }
        }
    });
}]);

module.exports = router;