/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AuthControllersModule {

    let AuthControllers: angular.IModule = angular.module('AuthControllers', ["ngResource", 'ngMessages']);

    AuthControllers.controller('LoginController', ["$scope", "$rootScope", "$window", "$uibModal", '$log', 'AuthService', 'ProfileService','SessionService',
        ($scope: any, $rootScope: any, $window: any, $uibModal: any, $log: any, AuthService: any, ProfileService: any, SessionService: any): void => {

            let progress = (value: boolean): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
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

            //$('#password').password({
            //    eyeClass: 'fa',
            //    eyeOpenClass: 'fa-eye',
            //    eyeCloseClass: 'fa-eye-slash'
            //});

            $scope.about = true;

            let confirmAccount = () => {
                let modalRegistConfirm = $uibModal.open({
                    controller: 'RegisterConfirmDialogController',
                    templateUrl: '/auth/dialogs/registerconfirmdialog',
                    backdrop: "static",
                    targetEvent: null
                });

                modalRegistConfirm.result.then((): void => {
                }, (): void => {
                });
            };

            $scope.Regist = (): void => {
                let items = {nickname: $scope.items.displayName, group: ""};
                $scope.message = "";
                progress(true);
                AuthService.Regist($scope.items.username, $scope.items.password, items, (error, account) => {
                    if (!error) {
                        confirmAccount();
                    } else {
                        $scope.message = error.message;
                    }
                    progress(false);
                });
            };

            $scope.showRegisterDialog = (): void => {
                let items = {};
                let modalRegist = $uibModal.open({
                    controller: 'RegisterDialogController',
                    templateUrl: '/auth/dialogs/registerdialog',
                    backdrop: "static",
                    resolve: {
                        items: (): any => {
                            return items;
                        }
                    }
                });

                modalRegist.result.then((): void => {
                    confirmAccount();
                }, (): void => {
                });
            };

            let user: any = {};

            // ProfileService
            SessionService.Get((error, profile) => {
                if (!error) {
                    if (profile) {
                        user = profile;
                        $scope.role = user.role;

                        $scope.showLoginDialog = (): void => {
                            let modalInstance = $uibModal.open({
                                controller: 'LoginDialogController',
                                templateUrl: '/auth/dialogs/logindialog',
                                backdrop: "static",
                                targetEvent: null
                            });

                            modalInstance.result.then((member): void => { // Answer
                                // ProfileService
                                SessionService.Get((error:any, profile:any):void => {
                                    if (!error) {
                                        if (profile) {
                                            user = profile;
                                            $rootScope.$broadcast('Login');
                                        }
                                    } else {
                                        error_handler(error);
                                    }
                                });
                            }, (): void => { // Error
                            });
                        };

                        $scope.showPasswordDialog = (): void => {
                            let modalInstance = $uibModal.open({
                                controller: 'PasswordDialogController',
                                templateUrl: '/auth/dialogs/passworddialog',
                                backdrop: false,
                                targetEvent: null
                            });

                            modalInstance.result.then((): void => {
                                let modalRegistConfirm = $uibModal.open({
                                    controller: 'PasswordConfirmDialogController',
                                    templateUrl: '/auth/dialogs/passwordconfirmdialog',
                                    backdrop: "static",
                                    targetEvent: null
                                });

                                modalRegistConfirm.result.then((): void => {
                                }, (): void => {
                                });

                            }, (): void => {
                            });
                        };

                        $scope.Logout = (): void => {
                            // ProfileService
                            SessionService.Get((error:any, profile:any):void => {
                                if (!error) {
                                    if (profile) {
                                        user = profile;
                                        AuthService.Logout((error:any, account:any):void => {
                                            $rootScope.$broadcast('Logout');
                                        }, (): void => {
                                        });
                                    }
                                } else {
                                    error_handler(error);
                                }
                            });
                        };

                        $scope.$on('Login', (): void => {
                            $scope.userid = user.userid;
                            $scope.role = user.role;
                            $window.location.href = "//" + $window.location.host + "/" + user.entry;
                        });

                        $scope.$on('Logout', (): void => {
                            $scope.userid = "";
                            $scope.role = {guest: false, category: 0};
                            $window.location.href = "//" + $window.location.host + "/" + user.exit;
                        });

                        $scope.go = (ref: string): void => {
                            $window.location.href = ref;
                        };

                    }
                } else {
                    error_handler(error);
                }
            });
        }]);

    //! dialogs

    /**
     * ログインダイアログ
     * @param target  Comment for parameter ´target´.
     * @returns       Comment for return value.
     */
    AuthControllers.controller('LoginDialogController', ['$scope', '$window', '$uibModalInstance', 'AuthService',
        ($scope: any, $window: any, $uibModalInstance: any, AuthService: any): void => {

            let progress = (value: boolean): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
                $scope.progress = value;
            });

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.go = (ref: string): void => {
                $window.location.href = ref;
            };

            $scope.change = ():void => {
                $scope.message = "";
            };

            $scope.answer = (items: any): void => {
                progress(true);
                AuthService.Login($scope.items.username, $scope.items.password, (error: any, account: any): void => {
                    if (!error) {
                        $uibModalInstance.close(account);
                    } else {
                        $scope.message = error.message;
                    }
                    progress(false);
                });
            };
        }]);

    /**
     * レジスターダイアログ
     * @param target  Comment for parameter ´target´.
     * @returns       Comment for return value.
     */
    AuthControllers.controller('RegisterDialogController', ['$scope', '$uibModalInstance', 'AuthService', 'items',
        ($scope: any, $uibModalInstance: any, AuthService: any, items: any): void => {

            let progress = (value: boolean): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
                $scope.progress = value;
            });

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.change = () => {
                $scope.message = "";
            };

            $scope.answer = (scope: any): void => {
                $scope.message = "";
                progress(true);
                let items = {nickname: $scope.items.displayName, group: ""};
                AuthService.Regist($scope.items.username, $scope.items.password, items, (error: any, account: any): void => {
                    if (!error) {
                        $uibModalInstance.close(account);
                    } else {
                        $scope.message = error.message;
                    }
                    progress(false);
                });
            };
        }]);

    AuthControllers.controller('RegisterConfirmDialogController', ['$scope', '$uibModalInstance',
        ($scope: any, $uibModalInstance: any): void => {

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.answer = (answer): void => {
                $uibModalInstance.close($scope);
            };

        }]);

    /**
     * パスワード変更ダイアログ
     * @param target  Comment for parameter ´target´.
     * @returns       Comment for return value.
     */
    AuthControllers.controller('PasswordDialogController', ['$scope', '$uibModalInstance', 'AuthService',
        ($scope: any, $uibModalInstance: any, AuthService: any): void => {

            let progress = (value: boolean): void => {
                $scope.$emit('progress', value);
            };

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.change = () => {
                $scope.message = "";
            };

            $scope.answer = (answer: any): void => {
                AuthService.Password($scope.items.username, $scope.items.password, (error: any, account: any): void => {
                    if (!error) {
                        $uibModalInstance.close(account);
                    } else {
                        $scope.message = error.message;
                    }
                    progress(false);
                });
            };

        }]);

    AuthControllers.controller('PasswordConfirmDialogController', ['$scope', '$uibModalInstance',
        ($scope: any, $uibModalInstance: any): void => {

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.answer = (answer: any): void => {
                $uibModalInstance.close($scope);
            };

        }]);
}