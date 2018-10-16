/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AccountModule;
(function (AccountModule) {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var passport = require('passport-local-mongoose');
    var timestamp = require('../plugins/timestamp/timestamp');
    var Account = new Schema({
        provider: { type: String, default: "local" },
        auth: { type: Number, default: 10001 },
        groupid: { type: String, required: true, sparse: true },
        userid: { type: String, required: true, sparse: true },
        username: { type: String, required: true, index: { unique: true } },
        password: { type: String },
        passphrase: { type: String, default: "" },
        publickey: { type: String, default: "" },
        enabled: { type: Boolean, default: true },
        local: {}
    });
    Account.plugin(passport);
    Account.plugin(timestamp);
    var role = function (user) {
        var result = { guest: false, categoly: 0, raw: user.auth };
        if (user) {
            if (user.auth < 100) {
                result.system = true;
            }
            if (user.auth < 500) {
                result.user = true;
            }
            if (user.auth < 1000) {
                result.member = true;
            }
            if (user.auth < 10000) {
                result.temp = true;
            }
            result.guest = true;
            switch (user.provider) {
                case "local":
                    result.categoly = 0;
                    break;
                default:
                    result.categoly = 1;
            }
        }
        return result;
    };
    Account.statics.Role = function (user) {
        return role(user);
    };
    Account.method("Role", function () {
        return role(this);
    });
    module.exports = mongoose.model('Account', Account);
})(AccountModule || (AccountModule = {}));
//# sourceMappingURL=account.js.map