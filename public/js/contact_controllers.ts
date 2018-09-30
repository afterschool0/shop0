"use strict";


let Controllers = angular.module('Controllers', []);

Controllers.controller("ContactController", ["$scope", "$log", "$uibModal", 'MailerService',
    function ($scope, $log, $uibModal, MailerService) {

        $scope.form = {};

        let progress = (value) => {
            $scope.progress = value;
        };

        let error_handler = (code, message) => {
            progress(false);
            $scope.error = message;
            $log.error(message);
        };

        let alert = (message): void => {
            let modalInstance: any = $uibModal.open({
                controller: "AlertDialogController",
                templateUrl: "/dialogs/alert_dialog.html",
                resolve: {
                    items: (): any => {
                        return message;
                    }
                }
            });
            modalInstance.result.then((answer: any): void => {
            }, (): void => {
            });
        };

        progress(false);

        $scope.Send = () => {
            $scope.error = "";
            progress(true);
            let form: any = $scope.form;
            MailerService.Send(form, (result: any): void => {
                $scope.error = result.message;
                progress(false);
                alert("ok");
            }, error_handler);
        };

    }]);
