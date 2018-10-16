/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PublicKeyModule;
(function (PublicKeyModule) {
    var path = require('path');
    var config = require('config').get("systems");
    var PromisedModule = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    var Wrapper = new PromisedModule.Wrapper();
    var CipherModule = require(path.join(process.cwd(), "server/systems/common/cipher"));
    var Cipher = CipherModule.Cipher;
    var PublicKey = /** @class */ (function () {
        function PublicKey() {
        }
        PublicKey.prototype.get_fixed_public_key = function (request, response) {
            if (config.use_publickey) {
                var systempassphrase = request.session.id;
                Wrapper.SendSuccess(response, Cipher.PublicKey(systempassphrase));
            }
            else {
                Wrapper.SendError(response, 1, "get_fixed_public_key", null);
            }
        };
        PublicKey.prototype.get_public_key = function (request, response) {
            if (config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.PublicKey(request.user.passphrase));
            }
            else {
                Wrapper.SendError(response, 1, "get_public_key", null);
            }
        };
        PublicKey.prototype.get_access_token = function (request, response) {
            if (config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.FixedCrypt(request.session.id, request.user.passphrase));
            }
            else {
                Wrapper.SendError(response, 1, "get_access_token", null);
            }
        };
        return PublicKey;
    }());
    PublicKeyModule.PublicKey = PublicKey;
})(PublicKeyModule = exports.PublicKeyModule || (exports.PublicKeyModule = {}));
module.exports = PublicKeyModule;
//# sourceMappingURL=publickey_controller.js.map