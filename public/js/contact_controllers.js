"use strict";
var Controllers = angular.module('Controllers', []);
Controllers.controller("ContactController", ["$scope", "$log", "$uibModal", 'MailerService',
    function ($scope, $log, $uibModal, MailerService) {
        $scope.form = {};
        var progress = function (value) {
            $scope.progress = value;
        };
        var error_handler = function (code, message) {
            progress(false);
            $scope.error = message;
            $log.error(message);
        };
        var alert = function (message) {
            var modalInstance = $uibModal.open({
                controller: "AlertDialogController",
                templateUrl: "/dialogs/alert_dialog.html",
                resolve: {
                    items: function () {
                        return message;
                    }
                }
            });
            modalInstance.result.then(function (answer) {
            }, function () {
            });
        };
        progress(false);
        $scope.Send = function () {
            $scope.error = "";
            progress(true);
            var form = $scope.form;
            MailerService.Send(form, function (result) {
                $scope.error = result.message;
                progress(false);
                alert("ok");
            }, error_handler);
        };
    }]);
//# sourceMappingURL=contact_controllers.js.map