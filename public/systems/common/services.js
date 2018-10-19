/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Services = angular.module('Services', []);
Services.service("BrowserService", [function () {
        var _this = this;
        this.UserAgent = "";
        this.IsIE = function () {
            return (_this.UserAgent.indexOf('msie') >= 0 || _this.UserAgent.indexOf('trident') >= 0 || _this.UserAgent.indexOf('edge/') >= 0);
        };
        this.IsEdge = function () {
            return _this.UserAgent.indexOf('edge/') >= 0;
        };
        this.IsChrome = function () {
            var result = false;
            if (!_this.IsIE()) {
                result = _this.UserAgent.indexOf('chrome/') >= 0;
            }
            return result;
        };
        this.IsSafari = function () {
            var result = false;
            if (!_this.IsIE()) {
                if (!_this.IsChrome()) {
                    result = _this.UserAgent.indexOf('safari/') >= 0;
                }
            }
            return result;
        };
        this.IsiPhone = function () {
            return _this.UserAgent.indexOf('iphone') >= 0;
        };
        this.IsiPod = function () {
            return _this.UserAgent.indexOf('ipod') >= 0;
        };
        this.IsiPad = function () {
            return _this.UserAgent.indexOf('ipad') >= 0;
        };
        this.IsiOS = function () {
            return (_this.IsiPhone() || _this.IsiPod() || _this.IsiPad());
        };
        this.IsAndroid = function () {
            return _this.UserAgent.indexOf('android') >= 0;
        };
        this.IsPhone = function () {
            return (_this.IsiOS() || _this.IsAndroid());
        };
        this.IsTablet = function () {
            return (_this.IsiPad() || (_this.IsAndroid() && _this.UserAgent.indexOf('mobile') < 0));
        };
        this.Version = function () {
            var result = 0;
            if (_this.IsIE()) {
                var verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(_this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            else if (_this.IsiOS()) {
                var verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(_this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            else if (_this.IsAndroid()) {
                var verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(_this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            return result;
        };
        this.UserAgent = window.navigator.userAgent.toLowerCase();
    }]);
Services.directive("compareTo", function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue === scope.otherModelValue;
            };
            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
});
//# sourceMappingURL=services.js.map