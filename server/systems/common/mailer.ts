/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

interface MailSender {
    from: any;
    to: string;
    bcc: string;
    subject: string;
    html: string;
}

export interface MailModule {
    send(mail_address: string, bcc_address: string, title: string, message: string, callback: (error: any) => void): void;
}

export class Mailer implements MailModule {

    private mailer;
    private mailsetting;
    private smtpUser;
    private account;

    constructor(mailsetting: any, mailaccount: string) {
        this.mailer = require('nodemailer');
        this.account = mailaccount;
        this.mailsetting = mailsetting;
    }

    public send(mail_address: string, bcc_address: string, title: string, message: string, callback: (error: any) => void): void {

        this.smtpUser = this.mailer.createTransport(this.mailsetting); //SMTPの接続

        if (this.smtpUser) {
            let resultMail: MailSender = {
                from: this.account,
                to: mail_address,
                bcc: bcc_address,
                subject: title,
                html: message
            };

            try {
                this.smtpUser.sendMail(resultMail, (error: any): void => {
                    if (!error) {
                        callback(error);
                    } else {
                        callback(error);
                    }
                    this.smtpUser.close();
                });
            } catch (e) {
                callback(e);
            }
        } else {
            callback({});
        }
    }
}

export class Mailer2 implements MailModule {

    private smtpUser;
    private account;

    constructor(mailsetting: any, mailaccount: string) {
        let mailer: any = require('nodemailer');
        this.account = mailaccount;
        this.smtpUser = mailer.createTransport(mailsetting);
    }

    public send(mail_address: string, bcc_address: string, title: string, message: string, callback: (error: any) => void): void {

        if (this.smtpUser) {
            let resultMail: MailSender = {
                from: this.account,
                to: mail_address,
                bcc: bcc_address,
                subject: title,
                html: message
            };

            try {
                this.smtpUser.sendMail(resultMail, (error: any): void => {
                    if (!error) {
                        callback(error);
                    } else {
                        callback(error);
                    }
                    this.smtpUser.close();
                });
            } catch (e) {
                callback(e);
            }
        } else {
            callback({});
        }
    }
}

export class MailGun implements MailModule {

    private account;
    private api_key;
    private domain;
    private mailgun;

    constructor(mailsetting: any, mailaccount: string) {
        this.account = mailaccount;
        this.api_key = mailsetting.api_key;
        this.domain = mailsetting.domain;
        this.mailgun = require('mailgun-js')({apiKey: this.api_key, domain: this.domain});
    }

    public send(mail_address: string, bcc_address: string, title: string, message: string, callback: (error: any) => void): void {

        let data: MailSender = {
            from: this.account,
            to: mail_address,
            bcc: bcc_address,
            subject: title,
            html: message
        };

        this.mailgun.messages().send(data, (error: any, body: any): void => {
            if (!error) {
                callback(null);
            } else {
                callback(error);
            }
        });
    }
}

export class MailReceiver {

    private inbox;
    private conv;

    constructor() {
        let iconv = require('iconv');
        this.conv = new iconv.Iconv("UTF-8", "UTF-8");
        this.inbox = require('inbox');
    }

    public connect(receiver_setting: any, connect: (error: any) => {}, receive: (message: any, body: any) => {}): void {

        let imap;

        if (receiver_setting.type == "imap") {
            imap = this.inbox.createConnection(
                false, receiver_setting.address, {
                    secureConnection: true,
                    auth: receiver_setting.auth
                }
            );

            imap.on('connect', () => {
                imap.openMailbox('INBOX', (error: any) => {
                    connect(error);
                });
            });

            imap.on('new', (message: any) => {
                let stream = imap.createMessageStream(message.UID);
                let simpleParser = require("mailparser").simpleParser;
                simpleParser(stream).then((mail) => {
                    receive(message, mail);
                }).catch((error) => {
                    let a = error;
                });
            });

            imap.connect();
        }
    }
}


module.exports = Mailer;
//module.exports = Mailer2;
//module.exports = MailGun;
//module.exports = MailReceiver;