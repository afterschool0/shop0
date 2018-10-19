/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AuthControllersModule;
(function (AuthControllersModule) {
    var AuthControllers = angular.module('AuthControllers', ["ngResource", 'ngMessages']);
    AuthControllers.controller('LoginController', ["$scope", "$rootScope", "$window", "$uibModal", '$log', 'AuthService', 'ProfileService', 'SessionService', 'Socket',
        function ($scope, $rootScope, $window, $uibModal, $log, AuthService, ProfileService, SessionService, Socket) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                $scope.progress = value;
            });
            var error_handler = function (error) {
                progress(false);
                $scope.message = error.message;
                $log.error(error.message);
                alert(error.message);
            };
            var alert = function (message) {
                var modalInstance = $uibModal.open({
                    controller: 'AlertDialogController',
                    templateUrl: '/auth/common/alert_dialog',
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
            //$('#password').password({
            //    eyeClass: 'fa',
            //    eyeOpenClass: 'fa-eye',
            //    eyeCloseClass: 'fa-eye-slash'
            //});
            $scope.about = true;
            var confirmAccount = function () {
                var modalRegistConfirm = $uibModal.open({
                    controller: 'RegisterConfirmDialogController',
                    templateUrl: '/auth/dialogs/registerconfirmdialog',
                    backdrop: "static",
                    targetEvent: null
                });
                modalRegistConfirm.result.then(function () {
                }, function () {
                });
            };
            $scope.Regist = function () {
                var items = { nickname: $scope.items.displayName, group: "" };
                $scope.message = "";
                progress(true);
                AuthService.Regist($scope.items.username, $scope.items.password, items, function (error, account) {
                    if (!error) {
                        confirmAccount();
                    }
                    else {
                        $scope.message = error.message;
                    }
                    progress(false);
                });
            };
            $scope.showRegisterDialog = function () {
                var items = {};
                var modalRegist = $uibModal.open({
                    controller: 'RegisterDialogController',
                    templateUrl: '/auth/dialogs/registerdialog',
                    backdrop: "static",
                    resolve: {
                        items: function () {
                            return items;
                        }
                    }
                });
                modalRegist.result.then(function () {
                    confirmAccount();
                }, function () {
                });
            };
            var user = {};
            // ProfileService
            // SessionService
            SessionService.Get(function (error, profile) {
                if (!error) {
                    if (profile) {
                        user = profile;
                        $scope.role = user.role;
                        //Socket
                        var SocketEnter = function () {
                            var resp_target = { name: "response", id: "", method: "enter", from: profile.username };
                            var payload = { message: "Hello Again" };
                            Socket.emit("request", { response: resp_target, payload: payload });
                        };
                        var SocketLeave = function () {
                            var resp_target = { name: "response", id: "", method: "leave", from: profile.username };
                            var payload = { message: "Hello Again" };
                            Socket.emit("request", { response: resp_target, payload: payload });
                        };
                        var Broadcast = function () {
                            var resp_target = { name: "response", id: "", method: "broadcast", from: profile.username };
                            var payload = { message: "Hello Again" };
                            Socket.emit("request", { response: resp_target, payload: payload });
                        };
                        Socket.on("response", function (response) {
                            $scope.socket_message = response.response.from;
                        });
                        $scope.SocketEnter = SocketEnter;
                        $scope.SocketLeave = SocketLeave;
                        $scope.Broadcast = Broadcast;
                        //Socket
                        $scope.showLoginDialog = function () {
                            var modalInstance = $uibModal.open({
                                controller: 'LoginDialogController',
                                templateUrl: '/auth/dialogs/logindialog',
                                backdrop: "static",
                                targetEvent: null
                            });
                            modalInstance.result.then(function (member) {
                                // ProfileService
                                // SessionService
                                SessionService.Get(function (error, profile) {
                                    if (!error) {
                                        if (profile) {
                                            user = profile;
                                            $rootScope.$broadcast('Login');
                                        }
                                    }
                                    else {
                                        error_handler(error);
                                    }
                                });
                            }, function () {
                            });
                        };
                        $scope.showPasswordDialog = function () {
                            var modalInstance = $uibModal.open({
                                controller: 'PasswordDialogController',
                                templateUrl: '/auth/dialogs/passworddialog',
                                backdrop: false,
                                targetEvent: null
                            });
                            modalInstance.result.then(function () {
                                var modalRegistConfirm = $uibModal.open({
                                    controller: 'PasswordConfirmDialogController',
                                    templateUrl: '/auth/dialogs/passwordconfirmdialog',
                                    backdrop: "static",
                                    targetEvent: null
                                });
                                modalRegistConfirm.result.then(function () {
                                }, function () {
                                });
                            }, function () {
                            });
                        };
                        $scope.Logout = function () {
                            // ProfileService
                            // SessionService
                            SessionService.Get(function (error, profile) {
                                if (!error) {
                                    if (profile) {
                                        user = profile;
                                        AuthService.Logout(function (error, account) {
                                            $rootScope.$broadcast('Logout');
                                        }, function () {
                                        });
                                    }
                                }
                                else {
                                    error_handler(error);
                                }
                            });
                        };
                        $scope.$on('Login', function () {
                            $scope.userid = user.userid;
                            $scope.role = user.role;
                            $window.location.href = "//" + $window.location.host + "/" + user.entry;
                        });
                        $scope.$on('Logout', function () {
                            $scope.userid = "";
                            $scope.role = { guest: false, category: 0 };
                            $window.location.href = "//" + $window.location.host + "/" + user.exit;
                        });
                        $scope.go = function (ref) {
                            $window.location.href = ref;
                        };
                    }
                }
                else {
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
        function ($scope, $window, $uibModalInstance, AuthService) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                $scope.progress = value;
            });
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.go = function (ref) {
                $window.location.href = ref;
            };
            $scope.change = function () {
                $scope.message = "";
            };
            $scope.answer = function (items) {
                progress(true);
                AuthService.Login($scope.items.username, $scope.items.password, function (error, account) {
                    if (!error) {
                        $uibModalInstance.close(account);
                    }
                    else {
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
        function ($scope, $uibModalInstance, AuthService, items) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                $scope.progress = value;
            });
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.change = function () {
                $scope.message = "";
            };
            $scope.answer = function (scope) {
                $scope.message = "";
                progress(true);
                var items = { nickname: $scope.items.displayName, group: "" };
                AuthService.Regist($scope.items.username, $scope.items.password, items, function (error, account) {
                    if (!error) {
                        $uibModalInstance.close(account);
                    }
                    else {
                        $scope.message = error.message;
                    }
                    progress(false);
                });
            };
        }]);
    AuthControllers.controller('RegisterConfirmDialogController', ['$scope', '$uibModalInstance',
        function ($scope, $uibModalInstance) {
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function (answer) {
                $uibModalInstance.close($scope);
            };
        }]);
    /**
     * パスワード変更ダイアログ
     * @param target  Comment for parameter ´target´.
     * @returns       Comment for return value.
     */
    AuthControllers.controller('PasswordDialogController', ['$scope', '$uibModalInstance', 'AuthService',
        function ($scope, $uibModalInstance, AuthService) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.change = function () {
                $scope.message = "";
            };
            $scope.answer = function (answer) {
                AuthService.Password($scope.items.username, $scope.items.password, function (error, account) {
                    if (!error) {
                        $uibModalInstance.close(account);
                    }
                    else {
                        $scope.message = error.message;
                    }
                    progress(false);
                });
            };
        }]);
    AuthControllers.controller('PasswordConfirmDialogController', ['$scope', '$uibModalInstance',
        function ($scope, $uibModalInstance) {
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function (answer) {
                $uibModalInstance.close($scope);
            };
        }]);
})(AuthControllersModule || (AuthControllersModule = {}));
//# sourceMappingURL=auth_controllers.js.map