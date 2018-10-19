/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as Wrapper from "../../../server/systems/common/wrapper";

const TWrapper: any = Wrapper;
const wrapper = new TWrapper();

export class Exception {

    constructor() {

    }

    public exception(request: any, response: any, next: any): void {
        wrapper.Exception(request, response, (request: any, response: any) => {
            next();
        });
    }

    public guard(request: any, response: any, next: any): void {
        wrapper.Guard(request, response, (request: any, response: any) => {
            next();
        });
    }

    public authenticate(request: any, response: any, next: any): void {
        wrapper.Authenticate(request, response, (request: any, response: any): void => {
            next();
        });
    }

    public page_catch(request: any, response: any, next: any): void {
        try {
            next();
        } catch (e) {
            response.status(500).render('error', {
                status: 500,
                message: "Internal Server Error...",
                url: request.url
            });
        }
    }

    public page_guard(request: any, response: any, next: any): void {
        try {
            if (request.user) {
                if (request.isAuthenticated()) {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        } catch (e) {
            response.status(500).render('error', {
                status: 500,
                message: "Internal Server Error...",
                url: request.url
            });
        }
    }
}

module.exports = Exception;
