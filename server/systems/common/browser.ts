/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

    export class Browser {

        public UserAgent;

        constructor(UserAgent) {
            this.UserAgent = UserAgent.toLowerCase();
        }

        public IsIE(): boolean {
            return (this.UserAgent.indexOf('msie') >= 0 || this.UserAgent.indexOf('trident') >= 0 || this.UserAgent.indexOf('edge/') >= 0);
        }

        public IsEdge(): boolean {
            return this.UserAgent.indexOf('edge/') >= 0;
        }

        public IsChrome(): boolean {
            let result: boolean = false;
            if (!this.IsIE()) {
                result = this.UserAgent.indexOf('chrome/') >= 0;
            }
            return result;
        }

        public IsFirefox(): boolean {
            let result: boolean = false;
            if (!this.IsIE()) {
                result = this.UserAgent.indexOf('firefox/') >= 0;
            }
            return result;
        }

        public IsSafari(): boolean {
            let result: boolean = false;
            if (!this.IsIE()) {
                if (!this.IsChrome()) {
                    result = this.UserAgent.indexOf('safari/') >= 0;
                }
            }
            return result;
        }

        public IsiPhone(): boolean {
            return this.UserAgent.indexOf('iphone') >= 0;
        }

        public IsiPod(): boolean {
            return this.UserAgent.indexOf('ipod') >= 0;
        }

        public IsiPad(): boolean {
            return this.UserAgent.indexOf('ipad') >= 0;
        }

        public IsiOS(): boolean {
            return (this.IsiPhone() || this.IsiPod() || this.IsiPad());
        }

        public IsAndroid(): boolean {
            return this.UserAgent.indexOf('android') >= 0;
        }

        public IsPC(): boolean {
            return (this.IsIE() || this.IsEdge() || this.IsChrome() || this.IsSafari() || this.IsFirefox());
        }

        public IsPhone(): boolean {
            return (this.IsiOS() || this.IsAndroid());
        }

        public IsTablet(): boolean {
            return (this.IsiPad() || (this.IsAndroid() && this.UserAgent.indexOf('mobile') < 0));
        }

        public Version(): number {
            let result: number = 0;
            if (this.IsIE()) {
                let verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            } else if (this.IsiOS()) {
                let verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            } else if (this.IsAndroid()) {
                let verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
                if (verArray) {
                    result = parseInt(verArray[2], 10);
                }
            }
            return result;
        }
    }

module.exports = Browser;