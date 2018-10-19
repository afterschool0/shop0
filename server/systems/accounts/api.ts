/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

import * as express from 'express';

import * as Auth from "../../../server/systems/auth/controllers/auth_controller";
import * as Account from "../../../server/systems/accounts/controllers/account_controller";
import * as Exception from "../../../server/systems/common/exception";

export const router: IRouter = express.Router();

const TAuth: any = Auth;
const auth = new TAuth();

const accounts: any = new Account();

const TException: any = Exception;
const exception: any = new TException();

router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, accounts.account_query]);
router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, accounts.account_count]);

router.get("/api/:username", [exception.exception, exception.guard, exception.authenticate, auth.is_system, accounts.get_account]);
router.put("/api/:username", [exception.exception, exception.guard, exception.authenticate, auth.is_system, accounts.put_account]);
router.delete('/api/:username', [exception.exception, exception.guard, exception.authenticate, auth.is_system, accounts.delete_account]);

module.exports = router;
