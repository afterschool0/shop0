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
    //const _config: any = require('config');
    var config = require('config').get("systems");
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
        Profile.prototype.get_profile = function (request, response) {
            var user = request.user;
            if (user) {
                Wrapper.FindOne(LocalAccount, { username: user.username }, function (error, self) {
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
                                //auth: self.auth,
                                username: self.username,
                                groupid: self.groupid,
                                userid: self.userid,
                                local: self.local,
                                enabled: self.enabled,
                                role: self.Role(),
                                entry: entry_point,
                                exit: exit_point
                            };
                            Wrapper.SendSuccess(response, result);
                        }
                        else {
                            Wrapper.SendWarn(response, 2, "profile not found", { code: 2, message: "profile not found" });
                        }
                    }
                    else {
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
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
        Profile.prototype.put_profile = function (request, response) {
            Wrapper.FindOne(LocalAccount, { username: request.user.username }, function (error, self) {
                if (!error) {
                    if (self) {
                        self.local = request.body.local;
                        self.open = true;
                        Wrapper.Save(self, function (error, object) {
                            if (!error) {
                                Wrapper.SendSuccess(response, object.local);
                            }
                            else {
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        Wrapper.SendWarn(response, 2, "profile not found", { code: 2, message: "profile not found" });
                    }
                }
                else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        };
        return Profile;
    }());
    ProfileModule.Profile = Profile;
})(ProfileModule = exports.ProfileModule || (exports.ProfileModule = {}));
module.exports = ProfileModule;
//# sourceMappingURL=profile_controller.js.map