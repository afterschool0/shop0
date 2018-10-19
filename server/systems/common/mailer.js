/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mailer = /** @class */ (function () {
    function Mailer(mailsetting, mailaccount) {
        this.mailer = require('nodemailer');
        this.account = mailaccount;
        this.mailsetting = mailsetting;
    }
    Mailer.prototype.send = function (mail_address, bcc_address, title, message, callback) {
        var _this = this;
        this.smtpUser = this.mailer.createTransport(this.mailsetting); //SMTPの接続
        if (this.smtpUser) {
            var resultMail = {
                from: this.account,
                to: mail_address,
                bcc: bcc_address,
                subject: title,
                html: message
            };
            try {
                this.smtpUser.sendMail(resultMail, function (error) {
                    if (!error) {
                        callback(error);
                    }
                    else {
                        callback(error);
                    }
                    _this.smtpUser.close();
                });
            }
            catch (e) {
                callback(e);
            }
        }
        else {
            callback({});
        }
    };
    return Mailer;
}());
exports.Mailer = Mailer;
var Mailer2 = /** @class */ (function () {
    function Mailer2(mailsetting, mailaccount) {
        var mailer = require('nodemailer');
        this.account = mailaccount;
        this.smtpUser = mailer.createTransport(mailsetting);
    }
    Mailer2.prototype.send = function (mail_address, bcc_address, title, message, callback) {
        var _this = this;
        if (this.smtpUser) {
            var resultMail = {
                from: this.account,
                to: mail_address,
                bcc: bcc_address,
                subject: title,
                html: message
            };
            try {
                this.smtpUser.sendMail(resultMail, function (error) {
                    if (!error) {
                        callback(error);
                    }
                    else {
                        callback(error);
                    }
                    _this.smtpUser.close();
                });
            }
            catch (e) {
                callback(e);
            }
        }
        else {
            callback({});
        }
    };
    return Mailer2;
}());
exports.Mailer2 = Mailer2;
var MailGun = /** @class */ (function () {
    function MailGun(mailsetting, mailaccount) {
        this.account = mailaccount;
        this.api_key = mailsetting.api_key;
        this.domain = mailsetting.domain;
        this.mailgun = require('mailgun-js')({ apiKey: this.api_key, domain: this.domain });
    }
    MailGun.prototype.send = function (mail_address, bcc_address, title, message, callback) {
        var data = {
            from: this.account,
            to: mail_address,
            bcc: bcc_address,
            subject: title,
            html: message
        };
        this.mailgun.messages().send(data, function (error, body) {
            if (!error) {
                callback(null);
            }
            else {
                callback(error);
            }
        });
    };
    return MailGun;
}());
exports.MailGun = MailGun;
var MailReceiver = /** @class */ (function () {
    function MailReceiver() {
        var iconv = require('iconv');
        this.conv = new iconv.Iconv("UTF-8", "UTF-8");
        this.inbox = require('inbox');
    }
    MailReceiver.prototype.connect = function (receiver_setting, connect, receive) {
        var imap;
        if (receiver_setting.type == "imap") {
            imap = this.inbox.createConnection(false, receiver_setting.address, {
                secureConnection: true,
                auth: receiver_setting.auth
            });
            imap.on('connect', function () {
                imap.openMailbox('INBOX', function (error) {
                    connect(error);
                });
            });
            imap.on('new', function (message) {
                var stream = imap.createMessageStream(message.UID);
                var simpleParser = require("mailparser").simpleParser;
                simpleParser(stream).then(function (mail) {
                    receive(message, mail);
                }).catch(function (error) {
                    var a = error;
                });
            });
            imap.connect();
        }
    };
    return MailReceiver;
}());
exports.MailReceiver = MailReceiver;
module.exports = Mailer;
//# sourceMappingURL=mailer.js.map