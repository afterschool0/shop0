/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as ConfigModule from 'config';

import * as Wrapper from "../../../../server/systems/common/wrapper";
import * as Cipher from "../../../../server/systems/common/cipher";

const config: any = ConfigModule.get("systems");

const TWrapper: any = Wrapper;
const wrapper = new TWrapper();

const TCipher: any = Cipher;
const cipher = new TCipher();

export class PublicKey {

    constructor() {

    }

    public get_fixed_public_key(request: any, response: Express.Response): void {
        if (config.use_publickey) {
            let systempassphrase: string = request.session.id;
            wrapper.SendSuccess(response, cipher.PublicKey(systempassphrase));
        } else {
            wrapper.SendError(response, null);
        }
    }

    public get_public_key(request: Express.Request, response: Express.Response): void {
        if (config.use_publickey) {
            wrapper.SendSuccess(response, cipher.PublicKey(request.user.passphrase));
        } else {
            wrapper.SendError(response, null);
        }
    }

    public get_access_token(request: any, response: Express.Response): void {
        if (config.use_publickey) {
            wrapper.SendSuccess(response, cipher.FixedCrypt(request.session.id, request.user.passphrase));
        } else {
            wrapper.SendError(response, null);
        }
    }

}

module.exports = PublicKey;