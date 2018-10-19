/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as schedule from "node-schedule";

export class Scheduler {

    public Scheduled_jobs: any;

    constructor() {
        this.Scheduled_jobs = [];
    }

    public Add(item: any) {
        let job = schedule.scheduleJob(item.timing, item.job);
        this.Scheduled_jobs.push(job);
    }

}

module.exports = Scheduler;