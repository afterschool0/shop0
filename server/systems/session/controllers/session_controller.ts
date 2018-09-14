/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SessionModule {

    const _: any = require('lodash');

    const path: any = require('path');

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    const Wrapper: any = new PromisedModule.Wrapper();

    export class Session {

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get(request: any, response: any): void {
            let user: any = request.session.req.user;
            if (user) {
                let result: any = {
                    create: user.create,
                    modify: user.modify,
                    provider: user.provider,
                    type: user.type,
                    auth: user.auth,
                    userid: user.userid,
                    username: user.username,
                    enabled: user.enabled,
                    local: user.local,
                    data: user.data
                };
                Wrapper.SendSuccess(response, result);
            } else {
                Wrapper.SendError(response, 2, "not found", {code: 2, message: "not found"});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put(request: any, response: any): void {
            let user: any = request.session.req.user;
            if (user) {
                if (!user.data) {
                    user.data = {};
                }
                user.data = _.merge(user.data, request.body.data);
                request.session.save();
                Wrapper.SendSuccess(response, user.data);
            } else {
                Wrapper.SendError(response, 2, "not found", {code: 2, message: "not found"});
            }
        }
    }
}

module.exports = SessionModule;
