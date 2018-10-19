/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let Services = angular.module('Services', []);

Services.service("BrowserService", [function () {

    this.UserAgent = "";

    this.IsIE = (): boolean => {
        return (this.UserAgent.indexOf('msie') >= 0 || this.UserAgent.indexOf('trident') >= 0 || this.UserAgent.indexOf('edge/') >= 0);
    };

    this.IsEdge = (): boolean => {
        return this.UserAgent.indexOf('edge/') >= 0;
    };

    this.IsChrome = (): boolean => {
        let result: boolean = false;
        if (!this.IsIE()) {
            result = this.UserAgent.indexOf('chrome/') >= 0;
        }
        return result;
    };

    this.IsSafari = (): boolean => {
        let result: boolean = false;
        if (!this.IsIE()) {
            if (!this.IsChrome()) {
                result = this.UserAgent.indexOf('safari/') >= 0;
            }
        }
        return result;
    };

    this.IsiPhone = (): boolean => {
        return this.UserAgent.indexOf('iphone') >= 0;
    };

    this.IsiPod = (): boolean => {
        return this.UserAgent.indexOf('ipod') >= 0;
    };

    this.IsiPad = (): boolean => {
        return this.UserAgent.indexOf('ipad') >= 0;
    };

    this.IsiOS = (): boolean => {
        return (this.IsiPhone() || this.IsiPod() || this.IsiPad());
    };

    this.IsAndroid = (): boolean => {
        return this.UserAgent.indexOf('android') >= 0;
    };

    this.IsPhone = (): boolean => {
        return (this.IsiOS() || this.IsAndroid());
    };

    this.IsTablet = (): boolean => {
        return (this.IsiPad() || (this.IsAndroid() && this.UserAgent.indexOf('mobile') < 0));
    };

    this.Version = (): number => {
        let result: number = 0;
        if (this.IsIE()) {
            let verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        } else if (this.IsiOS()) {
            let verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        } else if (this.IsAndroid()) {
            let verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        }
        return result;
    };

    this.UserAgent = window.navigator.userAgent.toLowerCase();

}]);

Services.directive("compareTo", (): any => {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: (scope: any, element: any, attributes: any, ngModel: any): void => {

            ngModel.$validators.compareTo = (modelValue: any): any => {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", (): void => {
                ngModel.$validate();
            });
        }
    };
});