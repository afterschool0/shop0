/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace AccountPageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

}

module.exports = AccountPageRouter.router;