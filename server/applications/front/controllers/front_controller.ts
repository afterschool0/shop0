/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FrontModule {

    const _: any = require('lodash');

    const path: any = require('path');

    const MongoClient: any = require('mongodb').MongoClient;

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    const Wrapper: any = new PromisedModule.Wrapper();

}

module.exports = FrontModule;

