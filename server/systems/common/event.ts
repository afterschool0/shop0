/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as Emitter from 'events';

export class Event {
    public emitter: any = null;

    constructor() {
        this.emitter = new Emitter();
    }
}

module.exports = Event;
