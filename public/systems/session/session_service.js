/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var SessionServicesModule;
(function (SessionServicesModule) {
    var SessionServices = angular.module('SessionServices', []);
    SessionServices.service("SessionService", [function () {
            this.Get = function (callback, error) {
                var options = {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Accept': 'application/json; charset=utf-8',
                        'Content-Type': 'application/json; charset=utf-8',
                        "x-requested-with": "XMLHttpRequest"
                    }
                };
                fetch("/session/api", options).then(function (res) { return res.json(); }).then(function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                }).catch(function () {
                    error(10000, "network error");
                });
            };
            this.Put = function (content, callback, error) {
                var self = {};
                self.local = content;
                var method = "PUT";
                var body = JSON.stringify(self);
                var headers = {
                    'Accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/json; charset=utf-8',
                    "x-requested-with": "XMLHttpRequest"
                };
                fetch("/session/api", { method: method, headers: headers, body: body }).then(function (res) { return res.json(); }).then(function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                }).catch(function () {
                    error(10000, "network error");
                });
            };
        }]);
})(SessionServicesModule || (SessionServicesModule = {}));
//# sourceMappingURL=session_service.js.map