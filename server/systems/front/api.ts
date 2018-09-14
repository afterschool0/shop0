/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace ApiRouter {

    const express: any = require("express");
    export const router: IRouter = express.Router();

}

module.exports = ApiRouter.router;