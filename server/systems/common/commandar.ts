/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as child_process from 'child_process';

const execSync: any = child_process.execSync;

export class Unix {

    private backupdir: string;

    constructor() {
        this.backupdir = process.cwd() + "/backup";
    }

    public Backup(config): string {
        let backup = "mongodump --authenticationDatabase " + config.name + " -u " + config.user + " -p " + config.password + " -d " + config.name + " -o " + '"' + this.backupdir + '"';
        console.log(backup);
        return "" + execSync(backup);
    }

    public Restore(config): string {
        let restore = "mongorestore --authenticationDatabase " + config.name + " -u " + config.user + " -p " + config.password + " -d " + config.name + " " + '"' + this.backupdir + "/" + config.name + '"';
        console.log(restore);
        return "" + execSync(restore);
    }


}

module.exports = Unix;
