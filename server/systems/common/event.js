/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Emitter = require("events");
var Event = /** @class */ (function () {
    function Event() {
        this.emitter = null;
        this.emitter = new Emitter();
    }
    return Event;
}());
exports.Event = Event;
module.exports = Event;
//# sourceMappingURL=event.js.map