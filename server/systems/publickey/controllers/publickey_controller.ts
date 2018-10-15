/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export module PublicKeyModule {

    const path: any = require('path');

    const _config: any = require('config');
    const Config: any = _config.get("systems");

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    const Wrapper: any = new PromisedModule.Wrapper();

    const CipherModule: any = require(path.join(process.cwd(), "server/systems/common/cipher"));
    const Cipher: any = CipherModule.Cipher;

    export class PublicKey {

        public get_fixed_public_key(request: any, response: Express.Response): void {
            if (Config.use_publickey) {
                let systempassphrase: string = request.session.id;
                Wrapper.SendSuccess(response, Cipher.PublicKey(systempassphrase));
            } else {
                Wrapper.SendError(response, 1, "get_fixed_public_key", null);
            }
        }

        public get_public_key(request: Express.Request, response: Express.Response): void {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.PublicKey(request.user.passphrase));
            } else {
                Wrapper.SendError(response, 1, "get_public_key", null);
            }
        }

        public get_access_token(request: any, response: Express.Response): void {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.FixedCrypt(request.session.id, request.user.passphrase));
            } else {
                Wrapper.SendError(response, 1, "get_access_token", null);
            }
        }

    }
}

module.exports = PublicKeyModule;
