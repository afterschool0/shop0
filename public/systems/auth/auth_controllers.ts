/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AuthControllersModule {

    let AuthControllers: angular.IModule = angular.module('AuthControllers', ["ngResource",'ngMessages']);

    AuthControllers.controller('LoginController', ["$scope", "$rootScope", "$window", "$uibModal", '$log', 'AuthService', 'ProfileService',
        ($scope: any, $rootScope: any, $window: any, $uibModal: any, $log: any, AuthService: any, ProfileService: any): void => {

            let progress = (value: boolean): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
                alert(message);
            };

            let alert = (message): void => {
                let modalInstance: any = $uibModal.open({
                    controller: 'AlertDialogController',
                    templateUrl: '/common/alert_dialog',
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
                let items = {};
                $scope.message = "";
                progress(true);
                AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account) => {
                    confirmAccount();
                    progress(false);
                }, (error, message) => {
                    $scope.message = message;
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

            ProfileService.Get((profile) => {
                if (profile) {
                    user = profile;
                    $scope.role = user.role;
           //         $scope.$apply();
                }
            }, error_handler);

            $scope.showLoginDialog = (): void => {
                let modalInstance = $uibModal.open({
                    controller: 'LoginDialogController',
                    templateUrl: '/auth/dialogs/logindialog',
                    backdrop: "static",
                    targetEvent: null
                });

                modalInstance.result.then((member): void => { // Answer
                    ProfileService.Get((profile) => {
                        if (profile) {
                            user = profile;
                            $rootScope.$broadcast('Login');
                        }
                    }, error_handler);
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
                ProfileService.Get((profile) => {
                    if (profile) {
                        user = profile;
                        AuthService.Logout((account) => {
                            $rootScope.$broadcast('Logout');
                        }, (): void => {
                        });
                    }
                }, error_handler);
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

            $scope.change = () => {
                $scope.message = "";
            };


            $scope.answer = (items: any): void => {
                progress(true);
                AuthService.Login($scope.items.username, $scope.items.password, (account: any): void => {
                    $uibModalInstance.close(account);
                    progress(false);
                }, (error: any, message: string): void => {
                    $scope.message = message;
                    progress(false);
   //                 $scope.$apply();
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
                AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account: any): void => {
                    $uibModalInstance.close(account);
                    progress(false);
                }, (error: any, message: string): void => {
                    $scope.message = message;
                    progress(false);
                    $scope.$apply();
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
                AuthService.Password($scope.items.username, $scope.items.password, (account: any): void => {
                    $uibModalInstance.close(account);
                    progress(false);
                }, (error: any, message: string): void => {
                    $scope.message = message;
                    progress(false);
                    $scope.$apply();
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