/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as mongoose from 'mongoose';
import * as passport from 'passport-local-mongoose';

const timestamp: any = require('../plugins/timestamp/timestamp');

const Schema = mongoose.Schema;

const Account = new Schema({
    provider: {type: String, default: "local"},
    auth: {type: Number, default: 10001},
    groupid: {type: String, required: true, sparse: true},
    userid: {type: String, required: true, sparse: true},
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String},
    passphrase: {type: String, default: ""},
    publickey: {type: String, default: ""},
    enabled: {type: Boolean, default: true},
    local: {}
});

Account.plugin(passport);
Account.plugin(timestamp);

interface AuthIntf {
    system: boolean,
    user: boolean,
    member: boolean,
    temp: boolean,
    guest: boolean,
    categoly: number,
    raw: number
}

let role = (user: { auth: number, provider: string }): AuthIntf => {
    let result: AuthIntf = {system: false, user: false, member: false, temp: false, guest: false, categoly: 0, raw: 100000};
    if (user) {
        let auth = user.auth;
        let categoly:number = 0;
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

Account.statics.Role = function (user:{ auth: number, provider: string }): AuthIntf {
    return role(user);
};

module.exports = mongoose.model('Account', Account);
