/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promised;
(function (Promised) {
    var _ = require("lodash");
    var result = require("./result");
    var log4js = require('log4js');
    log4js.configure("./config/systems/logs.json");
    var logger = log4js.getLogger('request');
    var Wrapper = /** @class */ (function () {
        function Wrapper() {
        }
        Wrapper.prototype.BasicHeader = function (response, session) {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            response.header("Pragma", "no-cache");
            response.header("Cache-Control", "no-cache");
            response.contentType("application/json");
            return response;
        };
        // 例外キャッチ
        Wrapper.prototype.Exception = function (req, res, callback) {
            try {
                callback(req, res);
            }
            catch (e) {
                this.SendFatal(res, e.code, e.message, e);
            }
        };
        // CSRFチェック
        Wrapper.prototype.Guard = function (req, res, callback) {
            if (req.headers["x-requested-with"] === "XMLHttpRequest") {
                res = this.BasicHeader(res, "");
                callback(req, res);
            }
            else {
                this.SendError(res, 1, "", { code: 1, message: "CSRF?" });
            }
        };
        // userがなければ常に正常、あれば権限チェック
        Wrapper.prototype.Authenticate = function (req, res, callback) {
            if (req.user) {
                if (req.isAuthenticated()) {
                    callback(req, res);
                }
                else {
                    this.SendError(res, 1, "", { code: 1, message: "" });
                }
            }
            else { // normal case.
                callback(req, res);
            }
        };
        Wrapper.prototype.FindById = function (model, id, callback) {
            return model.findById(id).then(function (object) {
                callback(null, object);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.FindOne = function (model, query, callback) {
            return model.findOne(query).then(function (doc) {
                callback(null, doc);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.Find = function (model, query, fields, option, callback) {
            return model.find(query, fields, option).then(function (docs) {
                callback(null, docs);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.Count = function (model, query, callback) {
            return model.count(query).then(function (count) {
                callback(null, count);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.FindAndModify = function (model, query, sort, update, options, callback) {
            return model.findAndModify(query, sort, update, options).then(function (docs) {
                callback(null, docs);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.Save = function (instance, callback) {
            return instance.save().then(function (target) {
                callback(null, target);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.Update = function (model, query, update, callback) {
            return model.findOneAndUpdate(query, update, { upsert: false }).then(function (target) {
                callback(null, target);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.Upsert = function (model, query, update, callback) {
            return model.update(query, update, { upsert: true, multi: false }).then(function (target) {
                callback(null, target);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.Remove = function (instance, callback) {
            return instance.remove().then(function (target) {
                callback(null, target);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Wrapper.prototype.Delete = function (model, query, callback) {
            return model.findOneAndRemove(query).then(function (target) {
                callback(null, target);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        //  A.findOneAndDelete(conditions) // returns Query
        //  A.findOneAndRemove(conditions) // returns Query
        Wrapper.prototype.SendWarn = function (response, code, message, object) {
            logger.warn(message + " " + code);
            if (response) {
                response.jsonp(new result(code, message, object));
            }
        };
        Wrapper.prototype.SendError = function (response, code, message, object) {
            logger.error(message + " " + code);
            if (response) {
                response.jsonp(new result(code, message, object));
            }
        };
        Wrapper.prototype.SendForbidden = function (response) {
            logger.error("Forbidden");
            if (response) {
                response.status(403).render("error", { message: "Forbidden...", status: 403 });
            }
        };
        Wrapper.prototype.SendNotFound = function (response) {
            logger.error("notfound");
            if (response) {
                response.status(404).render("error", { message: "not found", status: 404 });
            }
        };
        Wrapper.prototype.SendFatal = function (response, code, message, object) {
            logger.fatal(message + " " + code);
            if (response) {
                response.status(500).render("error", { message: message, status: 500 });
            }
        };
        Wrapper.prototype.SendSuccess = function (response, object) {
            if (response) {
                response.jsonp(new result(0, "", object));
            }
        };
        Wrapper.prototype.SendRaw = function (response, object) {
            if (response) {
                response.jsonp(object);
            }
        };
        Wrapper.prototype.Decode = function (data) {
            var result = {};
            if (data) {
                var decode_data = decodeURIComponent(data);
                try {
                    result = JSON.parse(decode_data);
                }
                catch (e) {
                    console.log(e.message);
                }
            }
            return result;
        };
        ;
        Wrapper.prototype.Parse = function (data) {
            var result = {};
            if (data) {
                try {
                    result = JSON.parse(data);
                }
                catch (e) {
                    console.log(e.message);
                }
            }
            return result;
        };
        ;
        return Wrapper;
    }());
    Promised.Wrapper = Wrapper;
})(Promised = exports.Promised || (exports.Promised = {}));
module.exports = Promised;
//# sourceMappingURL=wrapper.js.map