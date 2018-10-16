/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AccountControllersModule {

    let AccountControllers: angular.IModule = angular.module('AccountControllers', []);

    AccountControllers.controller('AccountController', ['$scope', '$document', '$log', '$uibModal', 'AccountService',
        ($scope: any, $document: any, $log: any, $uibModal: any, AccountService: any): void => {

            let progress = (value: any): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event, value) => {
                $scope.progress = value;
            });

            let error_handler = (error:any): void => {
                progress(false);
                $scope.message = error.message;
                $log.error(error.message);
                alert(error.message);
            };

            let alert = (message: string): void => {
                let modalInstance: any = $uibModal.open({
                    controller: 'AlertDialogController',
                    templateUrl: '/auth/common/alert_dialog',
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

            let page: number = 0;

            let Draw = (): void => {

                let count: number = 0;
                let limit: number = 10;
                let skip: number = limit * page;
                let query = {};
                let option = {sort: {"create": -1}, skip: skip, limit: limit};

                $scope.Next = () => {
                    if ((limit * (page +1)) < count) {
                        page++;
                        Draw();
                    }
                };

                $scope.Prev = () => {
                    if (page > 0) {
                        page--;
                        Draw();
                    }
                };

                let Redraw = (): void => {
                    AccountService.Count(query, (error,result: any): void => {
                        if (!error) {
                            count = result.value;
                            AccountService.Query(query, option, (error,result: any[]): void => {
                                if (!error) {
                                    $scope.accounts = result;
                                }
                            });
                        }

                    });
                };

                let find = $scope.search;

                if (find) {
                    let contains = ".*" + find + ".*";
                    query = {"local.nickname": {$regex: contains}};
                } else {
                    query = {};
                }

                Redraw();

                /*
                AccountService.Query({}, {}, (error, result: any): void => {
                    if (!error) {
                        if (result) {
                            $scope.accounts = result;
                            //        $scope.$apply();
                        }
                    } else {
                        error_handler(error);
                    }
                });
                */
            };

            let Find = (name): void => {
                //if (name) {
                //     AccountService.query = {username: {$regex: name}};
                //}
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

            $scope.Draw = Draw;
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