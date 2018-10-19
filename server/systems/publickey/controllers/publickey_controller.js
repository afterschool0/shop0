/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigModule = require("config");
var Wrapper = require("../../../../server/systems/common/wrapper");
var Cipher = require("../../../../server/systems/common/cipher");
var config = ConfigModule.get("systems");
var TWrapper = Wrapper;
var wrapper = new TWrapper();
var TCipher = Cipher;
var cipher = new TCipher();
var PublicKey = /** @class */ (function () {
    function PublicKey() {
    }
    PublicKey.prototype.get_fixed_public_key = function (request, response) {
        if (config.use_publickey) {
            var systempassphrase = request.session.id;
            wrapper.SendSuccess(response, cipher.PublicKey(systempassphrase));
        }
        else {
            wrapper.SendError(response, null);
        }
    };
    PublicKey.prototype.get_public_key = function (request, response) {
        if (config.use_publickey) {
            wrapper.SendSuccess(response, cipher.PublicKey(request.user.passphrase));
        }
        else {
            wrapper.SendError(response, null);
        }
    };
    PublicKey.prototype.get_access_token = function (request, response) {
        if (config.use_publickey) {
            wrapper.SendSuccess(response, cipher.FixedCrypt(request.session.id, request.user.passphrase));
        }
        else {
            wrapper.SendError(response, null);
        }
    };
    return PublicKey;
}());
exports.PublicKey = PublicKey;
module.exports = PublicKey;
//# sourceMappingURL=publickey_controller.js.map