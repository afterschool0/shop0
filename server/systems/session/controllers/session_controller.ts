/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as _ from 'lodash';
import * as ConfigModule from 'config';
import * as Wrapper from "../../../../server/systems/common/wrapper";
import * as LocalAccount from "../../../../models/systems/accounts/account";

const config: any = ConfigModule.get("systems");

const TWrapper: any = Wrapper;
const wrapper = new TWrapper();

export class Session {

    /**
     * @param request
     * @param response
     * @returns none
     */
    public get_session(request: any, response: any): void {
        let self: any = request.session.req.user;
        if (self) {

            let entry_point = "";
            if (config.entry_point) {
                entry_point = config.entry_point;
            }

            let exit_point = "";
            if (config.exit_point) {
                exit_point = config.exit_point;
            }

            let result: any = {
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
        } else {
            wrapper.SendSuccess(response, {});
        }
    }

    /**
     * @param request
     * @param response
     * @returns none
     */
    public put_session(request: any, response: any): void {
        let user: any = request.session.req.user;
        if (user) {
            if (!user.data) {
                user.data = {};
            }
            user.data = _.merge(user.data, request.body.data);
            request.session.save();
            wrapper.SendSuccess(response, user.data);
        } else {
            wrapper.SendError(response, {code: 2, message: "not found"});
        }
    }
}

module.exports = Session;