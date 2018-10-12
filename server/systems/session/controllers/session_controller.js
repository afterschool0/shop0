/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SessionModule;
(function (SessionModule) {
    var _ = require('lodash');
    var path = require('path');
    var PromisedModule = require(path.join(process.cwd(), "server/systems/common/wrapper2"));
    var Wrapper = new PromisedModule.Wrapper();
    var Session = /** @class */ (function () {
        function Session() {
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        Session.prototype.get = function (request, response) {
            var user = request.session.req.user;
            if (user) {
                var result = {
                    create: user.create,
                    modify: user.modify,
                    provider: user.provider,
                    type: user.type,
                    auth: user.auth,
                    userid: user.userid,
                    username: user.username,
                    enabled: user.enabled,
                    local: user.local,
                    data: user.data
                };
                Wrapper.SendSuccess(response, result);
            }
            else {
                Wrapper.SendError(response, 2, "not found", { code: 2, message: "not found" });
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Session.prototype.put = function (request, response) {
            var user = request.session.req.user;
            if (user) {
                if (!user.data) {
                    user.data = {};
                }
                user.data = _.merge(user.data, request.body.data);
                request.session.save();
                Wrapper.SendSuccess(response, user.data);
            }
            else {
                Wrapper.SendError(response, 2, "not found", { code: 2, message: "not found" });
            }
        };
        return Session;
    }());
    SessionModule.Session = Session;
})(SessionModule = exports.SessionModule || (exports.SessionModule = {}));
module.exports = SessionModule;
//# sourceMappingURL=session_controller.js.map