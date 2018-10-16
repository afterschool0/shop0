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
    var config = require('config').get("systems");
    var PromisedModule = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    var Wrapper = new PromisedModule.Wrapper();
    var LocalAccount = require(path.join(process.cwd(), "models/systems/accounts/account"));
    var Session = /** @class */ (function () {
        function Session() {
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        Session.prototype.get_session = function (request, response) {
            var self = request.session.req.user;
            if (self) {
                var entry_point = "";
                if (config.entry_point) {
                    entry_point = config.entry_point;
                }
                var exit_point = "";
                if (config.exit_point) {
                    exit_point = config.exit_point;
                }
                var result = {
                    create: self.create,
                    modify: self.modify,
                    provider: self.provider,
                    //auth: self.auth,
                    username: self.username,
                    groupid: self.groupid,
                    userid: self.userid,
                    local: self.local,
                    enabled: self.enabled,
                    role: LocalAccount.Role(self.auth),
                    entry: entry_point,
                    exit: exit_point,
                    data: self.data
                };
                Wrapper.SendSuccess(response, result);
            }
            else {
                Wrapper.SendSuccess(response, {});
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Session.prototype.put_session = function (request, response) {
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