/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 */

"use strict";

namespace FrontApplicationModule {

    let FrontApplication: any = angular.module('FrontApplication', [
        'ngMessages',
        'ui.bootstrap',
        "Services",
        "AuthServices",
        "AuthControllers",
        "PublicKeyServices",
        "FrontControllers"
    ]);

    FrontApplication.run(['$rootScope',
        function ($rootScope: any): void {
            $rootScope.$on("$routeChangeSuccess", (event: any, current: any, previous: any, rejection: any): void => {

            });
        }
    ]);

    FrontApplication.config(['$compileProvider', '$httpProvider',
        ($compileProvider: any, $httpProvider: any): void => {
            $compileProvider.debugInfoEnabled(false);
            $httpProvider.defaults.headers.common = {'x-requested-with': 'XMLHttpRequest'};
            $httpProvider.defaults.headers.common['If-Modified-Since'] = 'Thu, 01 Jun 1970 00:00:00 GMT'; //マイクロソフトのバグ対応！！！
        }]);

    FrontApplication.config(['$sceDelegateProvider', function ($sceDelegateProvider: any): void {
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
    }]);

    FrontApplication.controller('AlertDialogController', ['$scope', '$uibModalInstance', 'items',
        ($scope: any, $uibModalInstance: any, items: any): void => {

            $scope.message = items;

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

    }]);

}