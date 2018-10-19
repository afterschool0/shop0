/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as V6Module from 'ipv6';

const v6 = V6Module.v6;

export class IPV6 {

    static ToIPV6(address: string): string {
        let result = address;
        let v6_address = new v6.Address(result);
        if (!v6_address.isValid()) {
            if (v6_address.is4()) {
                result = "::ffff:" + result;
            } else {
                result = "::ffff:0.0.0.0";
            }
        }
        return result;
    }

    static GetIPV6(request: any): string {
        let result: string = "::ffff:0.0.0.0";
        if (request.headers['x-forwarded-for']) {
            result = IPV6.ToIPV6(request.headers['x-forwarded-for']);
        } else if (request.connection) {
            if (request.connection.remoteAddress) {
                result = IPV6.ToIPV6(request.connection.remoteAddress);
            } else if (request.connection.socket) {
                if (request.connection.socket.remoteAddress) {
                    result = IPV6.ToIPV6(request.connection.socket.remoteAddress);
                }
            }
        } else if (request.socket) {
            if (request.socket.remoteAddress) {
                result = IPV6.ToIPV6(request.socket.remoteAddress);
            }
        }
        return result;
    };
}

module.exports = IPV6;
