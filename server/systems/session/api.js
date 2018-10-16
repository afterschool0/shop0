/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SessionApiRouter;
(function (SessionApiRouter) {
    var path = require('path');
    var express = require('express');
    SessionApiRouter.router = express.Router();
    var ExceptionController = require(path.join(process.cwd(), "server/systems/common/exception"));
    var exception = new ExceptionController.Exception();
    var SessionModule = require(path.join(process.cwd(), "server/systems/session/controllers/session_controller"));
    var session = new SessionModule.Session;
    SessionApiRouter.router.get("/api", [exception.exception, exception.guard, exception.authenticate, session.get_session]);
    SessionApiRouter.router.put("/api", [exception.exception, exception.guard, exception.authenticate, session.put_session]);
})(SessionApiRouter = exports.SessionApiRouter || (exports.SessionApiRouter = {}));
module.exports = SessionApiRouter.router;
//# sourceMappingURL=api.js.map