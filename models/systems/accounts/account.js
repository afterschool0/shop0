/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var passport = require("passport-local-mongoose");
var timestamp = require('../plugins/timestamp/timestamp');
var Schema = mongoose.Schema;
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
    var result = { system: false, user: false, member: false, temp: false, guest: false, categoly: 0, raw: 100000 };
    if (user) {
        var auth = user.auth;
        var categoly = 0;
        switch (user.provider) {
            case "local":
                categoly = 0;
                break;
            default:
                categoly = 1;
        }
        result = {
            system: (auth < 100),
            user: (auth < 500),
            member: (auth < 1000),
            temp: (auth < 10000),
            guest: true,
            categoly: categoly,
            raw: auth
        };
    }
    return result;
};
Account.statics.Role = function (user) {
    return role(user);
};
module.exports = mongoose.model('Account', Account);
//# sourceMappingURL=account.js.map