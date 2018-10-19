/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as MongoDB from 'mongodb';
import * as mongoose from 'mongoose';

const MongoClient: any = MongoDB.MongoClient;

mongoose.Promise = global.Promise;

export class Front {

}

module.exports = Front;

