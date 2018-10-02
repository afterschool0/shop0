/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AccountControllersModule {

    let AccountControllers: angular.IModule = angular.module('AccountControllers', ["ngResource"]);

    AccountControllers.controller('AccountController', ['$scope', '$document', '$log', '$uibModal', 'AccountService',
        ($scope: any, $document: any, $log: any, $uibModal: any, AccountService: any): void => {

            let progress = (value: any): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event, value) => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
                alert(message);
            };

            let alert = (message: string): void => {
                let modalInstance: any = $uibModal.open({
                    controller: 'AlertDialogController',
                    templateUrl: '/common/dialogs/alert_dialog',
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

            let Draw = (): void => {
                AccountService.Query({},{},(result: any): void => {
                    if (result) {
                        $scope.accounts = result;
                    }
                }, error_handler);
            };

            let Find = (name): void => {
                if (name) {
               //     AccountService.query = {username: {$regex: name}};
                }
                Draw();
            };

            let Open = (acount: any): void => {
                let modalRegist: any = $uibModal.open({
                    controller: 'AccountOpenDialogController',
                    templateUrl: '/accounts/dialogs/open_dialog',
                    resolve: {
                        items: acount
                    }
                });

                modalRegist.result.then((group: any): void => {
                    $scope.layout = group;
                    $scope.name = group.name;
                    $scope.opened = true;
                }, (): void => {
                });

            };

            $scope.Find = Find;
            $scope.Open = Open;

            Find(null);

        }]);

    AccountControllers.controller('AccountOpenDialogController', ['$scope', '$uibModalInstance', 'items',
        ($scope: any, $uibModalInstance: any, items: any): void => {

            $scope.items = items;

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

        }]);
}