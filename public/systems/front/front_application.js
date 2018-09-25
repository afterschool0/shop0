/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 */
"use strict";
var FrontApplicationModule;
(function (FrontApplicationModule) {
    var FrontApplication = angular.module('FrontApplication', [
        'ngMessages',
        'ui.bootstrap',
        "Services",
        "AuthServices",
        "AuthControllers",
        "PublicKeyServices"
    ]);
    FrontApplication.run(['$rootScope',
        function ($rootScope) {
            $rootScope.$on("$routeChangeSuccess", function (event, current, previous, rejection) {
            });
        }
    ]);
    FrontApplication.config(['$compileProvider', '$httpProvider',
        function ($compileProvider, $httpProvider) {
            $compileProvider.debugInfoEnabled(false);
            $httpProvider.defaults.headers.common = { 'x-requested-with': 'XMLHttpRequest' };
            $httpProvider.defaults.headers.common['If-Modified-Since'] = 'Thu, 01 Jun 1970 00:00:00 GMT'; //マイクロソフトのバグ対応！！！
        }]);
    FrontApplication.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist(['**']);
        }]);
    FrontApplication.controller('AlertDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.message = items;
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
        }]);
})(FrontApplicationModule || (FrontApplicationModule = {}));
//# sourceMappingURL=front_application.js.map