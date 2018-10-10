/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace AccountApiRouter {

    const path: any = require('path');

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const AuthController: any = require(path.join(process.cwd(), "server/systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const AccountModule: any = require(path.join(process.cwd(), "server/systems/accounts/controllers/account_controller"));
    const accounts: any = new AccountModule.Accounts;

    const ExceptionController: any = require(path.join(process.cwd(), "server/systems/common/exception"));
    const exception: any = new ExceptionController.Exception();

    router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, accounts.account_query]);
    router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, accounts.account_count]);

    router.get("/api/:username", [exception.exception, exception.guard, exception.authenticate, auth.is_system, accounts.get_account]);
    router.put("/api/:username", [exception.exception, exception.guard, exception.authenticate, auth.is_system, accounts.put_account]);
    router.delete('/api/:username', [exception.exception, exception.guard, exception.authenticate, auth.is_system, accounts.delete_account]);

}

module.exports = AccountApiRouter.router;
