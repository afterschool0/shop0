/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProfileModule;
(function (ProfileModule) {
    var _ = require('lodash');
    var path = require('path');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var _config = require('config');
    var config = _config.get("systems");
    var PromisedModule = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    var Wrapper = new PromisedModule.Wrapper();
    var LocalAccount = require(path.join(process.cwd(), "models/systems/accounts/account"));
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
        Profile.prototype.put_profile = function (request, response) {
            Wrapper.FindOne(response, 1, LocalAccount, { username: request.user.username }, function (response, self) {
                if (self) {
                    self.local = request.body.local;
                    self.open = true;
                    Wrapper.Save(response, 1, self, function (response, object) {
                        Wrapper.SendSuccess(response, object.local);
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "profile not found", { code: 2, message: "profile not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Profile.prototype.get_profile = function (request, response) {
            var user = request.user;
            if (user) {
                Wrapper.FindOne(response, 1, LocalAccount, { username: user.username }, function (response, self) {
                    if (self) {
                        var entry_point = "";
                        if (config.entry_point) {
                            entry_point = config.entry_point;
                        }
                        var exit_point = "";
                        if (config.exit_point) {
                            exit_point = config.exit_point;
                        }
                        Wrapper.SendSuccess(response, {
                            provider: self.provider,
                            auth: self.auth,
                            username: self.username,
                            groupid: self.groupid,
                            userid: self.userid,
                            local: self.local,
                            role: self.Role(),
                            entry: entry_point,
                            exit: exit_point
                        });
                    }
                    else {
                        Wrapper.SendWarn(response, 2, "profile not found", { code: 2, message: "profile not found" });
                    }
                });
            }
            else {
                Wrapper.SendSuccess(response, {});
            }
        };
        return Profile;
    }());
    ProfileModule.Profile = Profile;
})(ProfileModule = exports.ProfileModule || (exports.ProfileModule = {}));
module.exports = ProfileModule;
//# sourceMappingURL=profile_controller.js.map