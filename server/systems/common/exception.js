/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Wrapper = require("../../../server/systems/common/wrapper");
var TWrapper = Wrapper;
var wrapper = new TWrapper();
var Exception = /** @class */ (function () {
    function Exception() {
    }
    Exception.prototype.exception = function (request, response, next) {
        wrapper.Exception(request, response, function (request, response) {
            next();
        });
    };
    Exception.prototype.guard = function (request, response, next) {
        wrapper.Guard(request, response, function (request, response) {
            next();
        });
    };
    Exception.prototype.authenticate = function (request, response, next) {
        wrapper.Authenticate(request, response, function (request, response) {
            next();
        });
    };
    Exception.prototype.page_catch = function (request, response, next) {
        try {
            next();
        }
        catch (e) {
            response.status(500).render('error', {
                status: 500,
                message: "Internal Server Error...",
                url: request.url
            });
        }
    };
    Exception.prototype.page_guard = function (request, response, next) {
        try {
            if (request.user) {
                if (request.isAuthenticated()) {
                    next();
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        }
        catch (e) {
            response.status(500).render('error', {
                status: 500,
                message: "Internal Server Error...",
                url: request.url
            });
        }
    };
    return Exception;
}());
exports.Exception = Exception;
module.exports = Exception;
//# sourceMappingURL=exception.js.map