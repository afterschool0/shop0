/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

import * as express from 'express';

import * as Exception from "../../../server/systems/common/exception";
import * as PublicKey from "../../../server/systems/publickey/controllers/publickey_controller";

export const router: IRouter = express.Router();

const TException: any = Exception;
const exception: any = new TException();

const TPublickey: any = PublicKey;
const publickey: any = new TPublickey();

router.get("/fixed", [publickey.get_fixed_public_key]);

router.get("/dynamic", [exception.exception, exception.guard, exception.authenticate, publickey.get_public_key]);

router.get("/token", [exception.exception, exception.guard, exception.authenticate, publickey.get_access_token]);

module.exports = router;