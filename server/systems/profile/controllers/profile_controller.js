/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigModule = require("config");
var mongoose = require("mongoose");
var Wrapper = require("../../../../server/systems/common/wrapper");
var LocalAccount = require("../../../../models/systems/accounts/account");
mongoose.Promise = global.Promise;
var config = ConfigModule.get("systems");
var TWrapper = Wrapper;
var wrapper = new TWrapper();
var Profile = /** @class */ (function () {
    function Profile() {
    }
    /**
     * @param request
     * @returns userid
     */
    Profile.userid = function (request) {
        return request.user.userid;
    };
    /**
     * @param request
     * @param response
     * @returns none
     */
    Profile.prototype.get_profile = function (request, response) {
        var user = request.user;
        if (user) {
            wrapper.FindOne(LocalAccount, { username: user.username }, function (error, self) {
                if (!error) {
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
                            username: self.username,
                            groupid: self.groupid,
                            userid: self.userid,
                            local: self.local,
                            enabled: self.enabled,
                            role: LocalAccount.Role(self),
                            entry: entry_point,
                            exit: exit_point
                        };
                        wrapper.SendSuccess(response, result);
                    }
                    else {
                        wrapper.SendWarn(response, { code: 2, message: "profile not found" });
                    }
                }
                else {
                    wrapper.SendError(response, error);
                }
            });
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
    Profile.prototype.put_profile = function (request, response) {
        wrapper.FindOne(LocalAccount, { username: request.user.username }, function (error, self) {
            if (!error) {
                if (self) {
                    self.local = request.body.local;
                    self.open = true;
                    wrapper.Save(self, function (error, object) {
                        if (!error) {
                            wrapper.SendSuccess(response, object.local);
                        }
                        else {
                            wrapper.SendError(response, error);
                        }
                    });
                }
                else {
                    wrapper.SendWarn(response, { code: 2, message: "profile not found" });
                }
            }
            else {
                wrapper.SendError(response, error);
            }
        });
    };
    return Profile;
}());
exports.Profile = Profile;
module.exports = Profile;
//# sourceMappingURL=profile_controller.js.map