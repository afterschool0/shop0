/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FrontModule;
(function (FrontModule) {
    var _ = require('lodash');
    var path = require('path');
    var MongoClient = require('mongodb').MongoClient;
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var PromisedModule = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    var Wrapper = new PromisedModule.Wrapper();
})(FrontModule = exports.FrontModule || (exports.FrontModule = {}));
module.exports = FrontModule;
//# sourceMappingURL=front_controller.js.map