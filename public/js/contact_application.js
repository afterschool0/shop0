"use strict";
var Application = angular.module("Application", [
    'ngMessages', "ngResource", 'ngAnimate', 'ngSanitize',
    'Services',
    "Controllers",
    'ui.bootstrap',
]);
Application.run(["$rootScope", function ($rootScope) {
        $rootScope.$on("$routeChangeSuccess", function (event, current, previous, rejection) {
        });
    }]);
Application.config(["$sceDelegateProvider", function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(["**"]);
    }]);
Application.filter('encode_entity', [function () {
        return function (s) {
            var result = "";
            if (s) {
                result = s.replace(/&amp;/g, "&");
            }
            return result;
            //
        };
    }]);
Application.directive("includeTelNumber", function () {
    return {
        'restrict': 'A',
        'require': 'ngModel',
        'link': function (scope, elm, attr, ctrl) {
            var valid = false;
            var numberfilter = function (S) {
                var result = "";
                Array.prototype.forEach.call(S, function (c) {
                    var C = c.charCodeAt(0);
                    if (C <= 0x3A) {
                        if (C >= 0x30) {
                            result += String.fromCharCode(C);
                        }
                    }
                    else {
                        if (C >= 0xFE10) {
                            if (C <= 0xFF19) {
                                var CC = C - 0xFEE0;
                                result += String.fromCharCode(CC);
                            }
                        }
                    }
                });
                return result;
            };
            var checkVlidatate = function (value) {
                var result = numberfilter(value);
                return (result.length > 0 && result.length < 30);
            };
            ctrl.$validators.includeTelNumber = function (modelValue, viewValue) {
                if (modelValue && viewValue) {
                    valid = checkVlidatate(viewValue);
                }
                return valid;
            };
            var destroy = scope.$on('$destroy', function () {
                watcher();
                destroy();
            });
        }
    };
});
Application.controller('AlertDialogController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        $scope.message = items;
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }]);
//# sourceMappingURL=contact_application.js.map