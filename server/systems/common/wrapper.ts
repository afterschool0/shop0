/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {Express} from "express-serve-static-core";
import * as log4js from 'log4js';

const result: any = require("./result");

log4js.configure("./config/systems/logs.json");
const logger: any = log4js.getLogger('request');

export interface ErrorObject {
    code: number;
    message: string;
}

export class Wrapper {

    constructor() {

    }

    public BasicHeader(response: any, session: any): any {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        response.header("Pragma", "no-cache");
        response.header("Cache-Control", "no-cache");
        response.contentType("application/json");
        return response;
    }

    // 例外キャッチ
    public Exception(req: Express.Request, res: Express.Response, callback: (req: any, res: any) => void): void {
        try {
            callback(req, res);
        } catch (e) {
            this.SendFatal(res, e);
        }
    }

    // CSRFチェック
    public Guard(req: any, res: Express.Response, callback: (req: any, res: any) => void): void {
        if (req.headers["x-requested-with"] === "XMLHttpRequest") {
            res = this.BasicHeader(res, "");
            callback(req, res);
        } else {
            this.SendError(res, {code: 1, message: "CSRF?"});
        }
    }

    // userがなければ常に正常、あれば権限チェック
    public Authenticate(req: Express.Request, res: Express.Response, callback: (req: any, res: any) => void): void {
        if (req.user) {
            if (req.isAuthenticated()) {
                callback(req, res);
            } else {
                this.SendError(res, {code: 1, message: ""});
            }
        } else { // normal case.
            callback(req, res);
        }
    }

    public FindById(model: any, id: any, callback: (error: any, object: any) => void): any {
        return model.findById(id).then((object: any): void => {
            callback(null, object);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public FindOne(model: any, query: any, callback: (error: any, object: any) => void): any {
        return model.findOne(query).then((doc: any): void => {
            callback(null, doc);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public Find(model: any, query: any, fields: any, option: any, callback: (error: any, object: any) => void): any {
        return model.find(query, fields, option).then((docs: any[]): void => {
            callback(null, docs);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public Count(model: any, query: any, callback: (error: any, object: any) => void): any {
        return model.countDocuments(query).then((count) => {
            callback(null, count);
        }).catch((error) => {
            callback(error, null);
        });
    }

    public FindAndModify(model: any, query: any, sort: any, update: any, options: any, callback: (error: any, object: any) => void): any {
        return model.findAndModify(query, sort, update, options).then((docs: any): void => {
            callback(null, docs);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public Save(instance: any, callback: (error: any, object: any) => void): any {
        return instance.save().then((target) => {
            callback(null, target);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public Update(model: any, query: any, update: any, callback: (error: any, object: any) => void): any {
        return model.findOneAndUpdate(query, update, {upsert: false}).then((target) => {
            callback(null, target);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public Upsert(model: any, query: any, update: any, callback: (error: any, object: any) => void): any {
        return model.update(query, update, {upsert: true, multi: false}).then((target) => {
            callback(null, target);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public Remove(instance: any, callback: (error: any, object: any) => void): any {
        return instance.remove().then((target) => {
            callback(null, target);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    public Delete(model: any, query: any, callback: (error: any, object: any) => void): any {
        return model.findOneAndRemove(query).then((target) => {
            callback(null, target);
        }).catch((error: any): void => {
            callback(error, null);
        });
    }

    //  A.findOneAndDelete(conditions) // returns Query
    //  A.findOneAndRemove(conditions) // returns Query

    public SendWarn(response: any, error: ErrorObject): void {
        logger.warn(error.message + " " + error.code);
        if (response) {
            response.jsonp(new result(error.code, error.message, error));
        }
    }

    public SendError(response: any, error: ErrorObject): void {
        logger.error(error.message + " " + error.code);
        if (response) {
            response.jsonp(new result(error.code, error.message, error));
        }
    }

    public SendFatal(response: any, error: ErrorObject): void {
        logger.fatal(error.message + " " + error.code);
        if (response) {
            response.status(500).render("error", {message: error.message, status: 500});
        }
    }

    public SendSuccess(response: any, object: any): void {
        if (response) {
            response.jsonp(new result(0, "", object));
        }
    }

    public SendRaw(response: any, object: any): void {
        if (response) {
            response.jsonp(object);
        }
    }

    public SendForbidden(response: any): void {
        logger.error("Forbidden");
        if (response) {
            response.status(403).render("error", {message: "Forbidden...", status: 403});
        }
    }

    public SendNotFound(response: any): void {
        logger.error("notfound");
        if (response) {
            response.status(404).render("error", {message: "not found", status: 404});
        }
    }

    public Decode(data: string): any {
        let result = {};
        if (data) {
            let decode_data: string = decodeURIComponent(data);
            try {
                result = JSON.parse(decode_data);
            } catch (e) {
                console.log(e.message);
            }
        }
        return result;
    };

    public Parse(data: string): any {
        let result = {};
        if (data) {
            try {
                result = JSON.parse(data);
            } catch (e) {
                console.log(e.message);
            }
        }
        return result;
    };

}

module.exports = Wrapper;