/**!
 Copyright (c) 2018 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace SessionServicesModule {

    let SessionServices: angular.IModule = angular.module('SessionServices', []);
    SessionServices.service("SessionService", [function (): void {

        this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {

            let options: any = {
                method: "GET",
                cache: "no-cache",
                headers: {
                    'Accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/json; charset=utf-8',
                    "x-requested-with": "XMLHttpRequest"
                }
            };

            fetch("/session/api", options).then((res) => res.json()).then(
                (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                }
            ).catch(() => {
                error(10000, "network error")
            });
        };

        this.Put = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

            let self: any = {};
            self.local = content;

            const method = "PUT";
            const body = JSON.stringify(self);
            const headers = {
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8',
                "x-requested-with": "XMLHttpRequest"
            };

            fetch("/session/api", {method, headers, body}).then((res) => res.json()).then(
                (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                }
            ).catch(() => {
                error(10000, "network error")
            });

        };

    }]);

}