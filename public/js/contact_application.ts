"use strict";

let Application = angular.module("Application", [
    'ngMessages', "ngResource", 'ngAnimate', 'ngSanitize',
    'Services',
    "Controllers",
    'ui.bootstrap',
]);

Application.run(["$rootScope", ($rootScope: any) => {
    $rootScope.$on("$routeChangeSuccess",  (event, current, previous, rejection) => {
    });
}]);

Application.config(["$sceDelegateProvider", ($sceDelegateProvider: any) => {
    $sceDelegateProvider.resourceUrlWhitelist(["**"]);
}]);

Application.filter('encode_entity', [() => {
    return (s: any) => {
        let result: string = "";
        if (s) {
            result = s.replace(/&amp;/g, "&");
        }
        return result;
    };
}]);

Application.directive("includeTelNumber", () => {
    return {
        'restrict': 'A',
        'require': 'ngModel',
        'link': (scope, elm, attr, ctrl) => {
            let valid = false;

            let numberfilter = (S: any) => {
                var result = "";
                Array.prototype.forEach.call(S, (c) => {
                    let C = c.charCodeAt(0);
                    if (C <= 0x3A) {
                        if (C >= 0x30) {
                            result += String.fromCharCode(C);
                        }
                    } else {
                        if (C >= 0xFE10) {
                            if (C <= 0xFF19) {
                                let CC = C - 0xFEE0;
                                result += String.fromCharCode(CC);
                            }
                        }
                    }
                });
                return result;
            };

            let checkVlidatate = (value: any) => {
                let result = numberfilter(value);
                return (result.length > 0 && result.length < 30);
            };

            ctrl.$validators.includeTelNumber = (modelValue, viewValue) => {
                if (modelValue && viewValue) {
                    valid = checkVlidatate(viewValue);
                }
                return valid;
            };

            let destroy = scope.$on('$destroy', () => {
                watcher();
                destroy();
            });
        }
    };
});

Application.controller('AlertDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.message = items;

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

    }]);