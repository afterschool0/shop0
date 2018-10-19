/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var ConfigModule = require("config");
var Wrapper = require("../../../../server/systems/common/wrapper");
var LocalAccount = require("../../../../models/systems/accounts/account");
var config = ConfigModule.get("systems");
var TWrapper = Wrapper;
var wrapper = new TWrapper();
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
                role: LocalAccount.Role(self),
                entry: entry_point,
                exit: exit_point,
                data: self.data
            };
            wrapper.SendSuccess(response, result);
        }
        else {
            wrapper.SendSuccess(response, {});
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
            wrapper.SendSuccess(response, user.data);
        }
        else {
            wrapper.SendError(response, { code: 2, message: "not found" });
        }
    };
    return Session;
}());
exports.Session = Session;
module.exports = Session;
//# sourceMappingURL=session_controller.js.map