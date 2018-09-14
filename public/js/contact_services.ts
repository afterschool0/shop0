"use strict";

var Services = angular.module('Services', []);

Services.factory('MailSend', ['$resource', ($resource) => {
    return $resource('/api/contact', {}, {send: {method: 'POST'}});
}]);

Services.service('MailerService', ["MailSend",
    function (MailSend) {
        this.Send = function (content, callback, error) {
            let mail = new MailSend();
            mail.content = content;
            mail.$save({}, function (result) {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };
    }]);

Services.service('ZipService', ["$http",
    function ($http) {
        this.Zip = function (zip_code, callback) {
            $http.jsonp('https://map.yahooapis.jp/search/zip/V1/zipCodeSearch?detail=full&output=json&query=' + zip_code + '&appid=dj0zaiZpPURPNXRydGRpZFZhaSZzPWNvbnN1bWVyc2VjcmV0Jng9ZGU-', { callback: 'JSONP_CALLBACK' }).then(function (response) {
                callback(null, response.data);
            }).catch(function (data) {
                callback(data, null);
            });
        };
    }]);

Services.filter('decode_entity', [function () {
    return function (s) {
        var result = s;
        if (s) {
            result = s.replace(/&amp;/g, "&");
        }
        return result;
    };
}]);
