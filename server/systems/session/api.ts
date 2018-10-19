/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

import * as express from 'express';
import * as Exception from "../../../server/systems/common/exception";
import * as Session from "../../../server/systems/session/controllers/session_controller";

export const router: IRouter = express.Router();

const TException: any = Exception;
const exception = new TException();

const TSession: any = Session;
const session: any = new TSession();

router.get("/api", [exception.exception, exception.guard, exception.authenticate, session.get_session]);
router.put("/api", [exception.exception, exception.guard, exception.authenticate, session.put_session]);

module.exports = router;