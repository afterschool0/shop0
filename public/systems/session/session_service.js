/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var SessionServicesModule;
(function (SessionServicesModule) {
    var SessionServices = angular.module('SessionServices', []);
    SessionServices.factory('Session', ['$resource',
        function ($resource) {
            return $resource('/session/api', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' },
            });
        }]);
    SessionServices.service("SessionService", ['Session', function (Session) {
            this.Get = function (callback, error) {
                Session.get({}, function (result) {
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
                });
            };
            this.Put = function (content, callback, error) {
                var self = new Session();
                self.data = content;
                self.$put({}, function (result) {
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
                });
            };
        }]);
})(SessionServicesModule || (SessionServicesModule = {}));
//# sourceMappingURL=session_service.js.map