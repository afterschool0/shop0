/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {Express} from "express-serve-static-core";

export namespace Promised {

    const _: any = require("lodash");
    const result: any = require("./result");

    const log4js: any = require('log4js');
    log4js.configure("./config/systems/logs.json");
    const logger: any = log4js.getLogger('request');

    export class Wrapper {

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
                this.SendFatal(res, e.code, e.message, e);
            }
        }

        // CSRFチェック
        public Guard(req: any, res: Express.Response, callback: (req: any, res: any) => void): void {
            if (req.headers["x-requested-with"] === "XMLHttpRequest") {
                res = this.BasicHeader(res, "");
                callback(req, res);
            } else {
                this.SendError(res, 1, "", {code: 1, message: "CSRF?"});
            }
        }

        // userがなければ常に正常、あれば権限チェック
        public Authenticate(req: Express.Request, res: Express.Response, callback: (req: any, res: any) => void): void {
            if (req.user) {
                if (req.isAuthenticated()) {
                    callback(req, res);
                } else {
                    this.SendError(res, 1, "", {code: 1, message: ""});
                }
            } else { // normal case.
                callback(req, res);
            }
        }

        public FindById(res: Express.Response, code: number, model: any, id: any, callback: (res: any, object: any) => void): any {
            return model.findById(id).then((object: any): void => {
                callback(res, object);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public FindOne(res: Express.Response, code: number, model: any, query: any, callback: (res: any, object: any) => void): any {
            return model.findOne(query).then((doc: any): void => {
                callback(res, doc);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public Find(res: Express.Response, code: number, model: any, query: any, fields: any, option: any, callback: (res: any, object: any) => void): any {
            return model.find(query, fields, option).then((docs: any[]): void => {
                callback(res, docs);
            }).catch((error: any): void => {
                this.SendRaw(res, []);
            });
        }

        public Count(res: Express.Response, code: number, model: any, query: any, callback: (response: any, object: any) => void): any {
            return model.count(query).then((count) => {
                callback(res, count);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public FindAndModify(res: Express.Response, code: number, model: any, query: any, sort: any, update: any, options: any, callback: (res: any, object: any) => void): any {
            return model.findAndModify(query, sort, update, options).then((docs: any): void => {
                callback(res, docs);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public Save(res: Express.Response, code: number, instance: any, callback: (res: any, object: any) => void): any {
            return instance.save().then(() => {
                callback(res, instance);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public Update(res: Express.Response, code: number, model: any, query: any, update: any, callback: (res: any) => void): any {
            return model.findOneAndUpdate(query, update, {upsert: false}).then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public Upsert(res: Express.Response, code: number, model: any, query: any, update: any, callback: (res: any) => void): any {
            return model.update(query, update, {upsert: true, multi: false}).then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public Remove(res: Express.Response, code: number, instance: any, callback: (res: any) => void): any {
         //   deleteOne()
            return instance.remove().then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

        public Delete(res: Express.Response, code: number, model: any, query: any, callback: (res: any) => void): any {
         //   return model.remove(query).then(() => {
            return model.findOneAndRemove(query).then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, error.code, error.message, error);
            });
        }

      //  A.findOneAndDelete(conditions) // returns Query
      //  A.findOneAndRemove(conditions) // returns Query

        public If(res: Express.Response, code: number, condition: boolean, callback: (res: any) => void): void {
            if (condition) {
                callback(res);
            } else {
                this.SendWarn(res, code + 100, "", {code: code + 100, message: ""});
            }
        }

        public SendWarn(response: any, code: number, message: any, object: any): void {
            logger.warn(message + " " + code);
            if (response) {
                response.jsonp(new result(code, message, object));
            }
        }

        public SendError(response: any, code: number, message: any, object: any): void {
            logger.error(message + " " + code);
            if (response) {
                response.jsonp(new result(code, message, object));
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

        public SendFatal(response: any, code: number, message: any, object: any): void {
            logger.fatal(message + " " + code);
            if (response) {
                response.status(500).render("error", {message: message, status: 500});
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
}

module.exports = Promised;
