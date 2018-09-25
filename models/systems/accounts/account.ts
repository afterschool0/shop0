/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AccountModule {

    const mongoose: any = require('mongoose');
    const Schema = mongoose.Schema;
    const passport: any = require('passport-local-mongoose');
    const timestamp: any = require('../plugins/timestamp/timestamp');

// Legacy of v1

    const Account = new Schema({
        provider: {type: String, default: "local"},
        //             type: {type: String, default: "Guest"},
        auth: {type: Number, default: 10001},
        groupid: {type: String, required: true, sparse: true},
        userid: {type: String, required: true, sparse: true},
        //              role: {type: String, default: ""},
        username: {type: String, required: true, index: {unique: true}},
        password: {type: String},
        passphrase: {type: String, default: ""},
        publickey: {type: String, default: ""},
        enabled: {type: Boolean, default: true},
        local: {}
    });

    Account.plugin(passport);
    Account.plugin(timestamp);

    let role = (user: any) => {
        let result: any = {guest: false, categoly: 0};
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

    Account.statics.Role = function (user): any {
        return role(user);
    };

    Account.method("Role", function (): any {
        return role(this);
    });

    module.exports = mongoose.model('Account', Account);
}