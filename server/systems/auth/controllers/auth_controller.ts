/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AuthModule {

    const _: any = require('lodash');
    const fs: any = require('graceful-fs');
    const path: any = require('path');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const passport: any = require('passport');

    const crypto: any = require('crypto');
    const pug = require('pug');

    const _config: any = require('config');
    const config: any = _config.get("systems");

    const log4js: any = require('log4js');
    log4js.configure("./config/systems/logs.json");
    const logger: any = log4js.getLogger('request');

    const message: any = config.message;

    const PromisedModule: any = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    const Wrapper: any = new PromisedModule.Wrapper();

    const CipherModule: any = require(path.join(process.cwd(), "server/systems/common/cipher"));
    const Cipher: any = CipherModule.Cipher;

    const EventModule: any = require(path.join(process.cwd(), "server/systems/common/event"));
    const event: any = new EventModule.Event();

    const MailerModule: any = require(path.join(process.cwd(), "server/systems/common/mailer"));

    let _mailer: any = null;
    let bcc: string | any[] = "";
    switch (config.mailer.type) {
        case "mail":
            _mailer = new MailerModule.Mailer(config.mailer.setting, config.mailer.account);
            bcc = "";
            break;
        case "gmail":
            _mailer = new MailerModule.Mailer2(config.mailer.setting, config.mailer.account);
            bcc = "";
            break;
        case "mailgun":
            _mailer = new MailerModule.MailGun(config.mailer.setting, config.mailer.account);
            bcc = [];
            break;
        default:
            _mailer = new MailerModule.Mailer2(config.mailer.setting, config.mailer.account);
            bcc = "";
            break;
    }

    const LocalAccount: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

    interface PasswordToken {
        username: string;
        password: string;
        displayName: string;
        metadata: {},
        timestamp: any;
    }

    interface UserToken {
        username: string;
        password: string;
        newusername: string;
        timestamp: any;
    }

    interface Decoded {
        status: string,
        plaintext: string,
        signeture: string
    }

    let definition: any = {account_content: {mails: [], nickname: "", tokens: {}}};

    fs.open(path.join(process.cwd(), "models/systems/accounts/definition.json"), 'r', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, () => {
                let addition: any = JSON.parse(fs.readFileSync(path.join(process.cwd(), "models/systems/accounts/definition.json"), 'utf-8'));
                definition = _.merge(definition, addition.account_content);
            });
        } else {
            console.log(error.message);
        }
    });

    const use_publickey: any = config.use_publickey;

    export class Auth {

        constructor() {

        }

        static error_handler(e) {
            logger.fatal(e.message);
        }

        public create_init_user(initusers: any[]): void {
            if (initusers) {
                let promises: any = [];
                _.forEach(initusers, (user) => {
                    promises.push(new Promise((resolve: any, reject: any): void => {
                        if (user) {
                            let type: string = user.type;
                            let auth: number = user.auth;
                            let username: string = user.username;
                            let groupid: string = user.groupid;
                            let userid: string = user.userid;
                            let passphrase: string = Cipher.FixedCrypt(userid, config.key2);
                            let rootpassword: string = user.password;
                            let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                            Wrapper.FindOne(null, 1000, LocalAccount, {username: username}, (response: any, account: any): void => {
                                if (!account) {
                                    let _promise = new Promise((_resolve: any, _reject: any): void => {
                                        //let content: any = {"mails": [], "nickname": "", "group": ""};// definition.account_content;
                                        content.mails.push(username);
                                        content.nickname = user.displayName;
                                        LocalAccount.register(new LocalAccount({
                                                groupid: groupid,
                                                userid: userid,
                                                username: username,
                                                type: type,
                                                auth: auth,
                                                passphrase: passphrase,
                                                publickey: Cipher.PublicKey(passphrase),
                                                local: content
                                            }),
                                            rootpassword,
                                            (error: any) => {
                                                if (!error) {
                                                    _resolve({});
                                                } else {
                                                    _reject(error);
                                                }
                                            });
                                    });
                                    _promise.then((results: any[]): void => {
                                        resolve({});
                                    }).catch((error: any): void => {
                                        reject(error);
                                    });
                                }
                            });
                        } else {
                            reject({});
                        }
                    }));
                });

                promises.reduce((prev, current, index, array): any => {
                    return prev.then(current);
                }, Promise.resolve()).then(() => {
                }).catch((error) => {
                    Auth.error_handler(error);
                });
            }
        }

        static auth_event(type: string, param: any): void {
            switch (type) {
                case "register:local":
                    event.emitter.emit("register", {type: type, user: param});
                    break;
                default:
                    event.emitter.emit("auth", {type: type, token: param});
            }
        };

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_valid(request: any, response: any, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.enabled) {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_is_system(request: any, response: any, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().system) {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_system(request: Express.Request, response: Express.Response, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().system) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_is_user(request: any, response: any, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().user) {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_user(request: Express.Request, response: Express.Response, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().user) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_member(request: Express.Request, response: Express.Response, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().member) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_temp(request: Express.Request, response: Express.Response, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().temp) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_guest(request: Express.Request, response: Express.Response, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().guest) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_enabled_regist_user(request: Express.Request, response: Express.Response, next: any): void {
            let user: any = request.user;
            if (user) {
                if (user.Role().system) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                if (config.regist.user) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_enabled_regist_member(request: Express.Request, response: Express.Response, next: any): void {
            let user: any = request.user;
            if (user) {
                if (config.regist.member) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            }
        }

        static publickey_decrypt(systempassphrase: string, encrypted: string, callback: (error: any, result: string) => void): void {
            let username_decrypted: Decoded = Cipher.PublicKeyDecrypt(systempassphrase, encrypted);
            if (username_decrypted.status === "success") {
                callback(null, username_decrypted.plaintext);
            } else {
                callback({code: 1, message: username_decrypted.status}, "");
            }
        }

        static username_and_password_decrypt(use_publickey: boolean, systempassphrase: string, username: string, password: string, callback: (error: any, username: string, password: string) => void) {
            if (use_publickey) {
                Auth.publickey_decrypt(systempassphrase, username, (error, decrypted_username): void => {
                    if (!error) {
                        Auth.publickey_decrypt(systempassphrase, password, (error, decrypted_password): void => {
                            if (!error) {
                                callback(null, decrypted_username, decrypted_password);
                            } else {
                                callback(error, "", "");
                            }
                        });
                    } else {
                        callback(error, "", "");
                    }
                });
            } else {
                callback(null, username, password);
            }
        }

        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        public post_local_register(request: any, response: Express.Response): void {

            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            /*

            auth < 100 system
            auth < 500 user
            auth < 1000 member
            auth < 10000 temp
            auth > 10001 guest

            */

            Auth.username_and_password_decrypt(use_publickey, systempassphrase, username, password, (error: any, username: string, password: string): void => {
                if (!error) {
                    Wrapper.FindOne(response, 100, LocalAccount, {$and: [{provider: "local"}, {username: username}]},
                        (response: any, account: any): void => {
                            if (!account) {
                                try {

                                    let metadata: any = {};
                                    if (request.body.metadata) {
                                        metadata = request.body.metadata;
                                    }

                                    let tokenValue: any = {
                                        auth: 1000,
                                        username: username,
                                        password: password,
                                        displayName: request.body.displayName,
                                        metadata: metadata,
                                        timestamp: Date.now()
                                    };

                                    let token: string = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                    let link: string = config.protocol + "://" + config.domain + "/auth/register/" + token;

                                    fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/regist_mail.pug"), "utf8", (err, data) => {
                                        if (!err) {
                                            var doc = pug.render(data, {"link": link});
                                            _mailer.send(username, bcc, message.registconfirmtext, doc, (error: any) => {
                                                if (!error) {
                                                    Wrapper.SendSuccess(response, {code: 0, message: ""});
                                                } else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        } else {
                                            console.log(err.message);
                                        }
                                    });

                                } catch (e) {
                                    Wrapper.SendFatal(response, e.code, e.message, e);
                                }
                            } else {
                                Wrapper.SendWarn(response, 1, message.usernamealreadyregist, {
                                    code: 1,
                                    message: message.usernamealreadyregist
                                });
                            }
                        });
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }

            });
        }

        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        public get_register_token(request: any, response: Express.Response): void {

            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account_data: any): void => {
                        if (!error) {
                            if (!account_data) {
                                let groupid = config.systems.groupid;
                                const shasum = crypto.createHash('sha1');
                                shasum.update(token.username);
                                let userid: string = shasum.digest('hex');
                                let passphrase: string = Cipher.FixedCrypt(userid, config.key2);
                                let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                                content.mails.push(token.username);
                                content.nickname = token.displayName;

                                if (token.metadata.userid) {
                                    userid = token.metadata.userid;
                                }

                                LocalAccount.register(new LocalAccount({
                                        groupid: groupid,
                                        userid: userid,
                                        username: token.username,
                                        passphrase: passphrase,
                                        publickey: Cipher.PublicKey(passphrase),
                                        auth: token.auth,
                                        local: content
                                    }),
                                    token.password,
                                    (error: any): void => {
                                        if (!error) {
                                            let user: { username: string; password: string } = request.body;
                                            user.username = token.username;
                                            user.password = token.password;
                                            passport.authenticate('local', (error: any, user: any): void => {
                                                if (!error) {
                                                    if (user) {
                                                        Auth.auth_event("register:local", user);
                                                        request.login(user, (error: any): void => {
                                                            if (!error) {
                                                                Auth.auth_event("auth:local", request.params.token);
                                                                response.redirect("/");
                                                            } else {
                                                                response.status(500).render('error', {
                                                                    status: 500,
                                                                    message: "get_register_token " + error.message
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        response.status(500).render('error', {
                                                            status: 500,
                                                            message: "authenticate"
                                                        });
                                                    }
                                                } else {
                                                    response.status(500).render('error', {
                                                        status: 500,
                                                        message: "get_register_token " + error.message
                                                    });
                                                }
                                            })(request, response);
                                        } else {
                                            response.status(500).render('error', {
                                                status: 500,
                                                message: "get_register_token " + error.message
                                            });
                                        }
                                    });
                            } else {
                                response.redirect("/");
                            }
                        } else {
                            response.status(500).render('error', {status: 500, message: "get_register_token " + error.message});
                        }
                    });
                } else {
                    response.status(200).render('error', {status: 200, message: "timeout"});
                }
            });
        }

        /**
         * パスワードトークン発行
         * @param request
         * @param response
         * @returns none
         */
        public post_local_password(request: any, response: Express.Response): void {
            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            Auth.username_and_password_decrypt(use_publickey, systempassphrase, username, password, (error: any, username: string, password: string): void => {
                if (!error) {
                    Wrapper.FindOne(response, 1, LocalAccount, {$and: [{provider: "local"}, {username: username}]}, (response: any, account: any): void => {
                        if (account) {
                            try {

                                let tokenValue: any = {
                                    username: username,
                                    password: password,
                                    timestamp: Date.now()
                                };

                                let token: any = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                let link: string = config.protocol + "://" + config.domain + "/auth/password/" + token;

                                fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/password_mail.pug"), "utf8", (err, data) => {
                                    if (!err) {
                                        var doc = pug.render(data, {"link": link});
                                        _mailer.send(username, bcc, message.passwordconfirmtext, doc, (error: any) => {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, {code: 0, message: ""});
                                            } else {
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                });

                            } catch (e) {
                                Wrapper.SendFatal(response, e.code, e.message, e);
                            }
                        } else {
                            Wrapper.SendWarn(response, 2, message.usernamenotfound, {
                                code: 2,
                                message: message.usernamenotfound
                            });
                        }
                    });
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }

        /**
         * パスワードトークンからパスワード変更
         * @param request
         * @param response
         * @returns none
         */
        public get_password_token(request: any, response: Express.Response): void {
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token: any = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account: any): void => {
                        if (!error) {
                            if (account) {
                                account.setPassword(token.password, (error: any): void => {
                                    if (!error) {
                                        Wrapper.Save(response, 1, account, (): void => {
                                            response.redirect("/");
                                        });
                                    } else {
                                        response.status(500).render("error", {message: "get_password_token " + error.message, status: 500}); // already
                                    }
                                });
                            } else {
                                response.status(200).render("error", {message: "already", status: 200}); // already
                            }
                        } else {
                            response.status(500).render("error", {message: "get_password_token " + error.message, status: 500}); // timeout
                        }
                    });
                } else {
                    response.status(200).render("error", {message: "timeout", status: 200}); // timeout
                }
            });
        }

        /**
         * ログイン
         * @param request
         * @param response
         * @returns none
         */
        public post_local_login(request: any, response: Express.Response): void {
            let systempassphrase: string = request.session.id;
            if (request.body.username) {
                if (request.body.password) {

                    Auth.username_and_password_decrypt(use_publickey, systempassphrase, request.body.username, request.body.password, (error: any, username: string, password: string): void => {
                        if (!error) {
                            request.body.username = username;
                            request.body.password = password;
                            passport.authenticate("local", (error: any, user: any): void => {
                                if (!error) {
                                    if (user) {
                                        Wrapper.Guard(request, response, (request: any, response: any): void => {
                                            request.login(user, (error: any): void => {
                                                if (!error) {
                                                    Auth.auth_event("login:local", request.body.username);
                                                    Wrapper.SendSuccess(response, {});
                                                } else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        });
                                    } else {
                                        Wrapper.SendError(response, 2, message.usernamenotfound, {
                                            code: 2,
                                            message: message.usernamenotfound
                                        });
                                    }
                                } else {
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            })(request, response);
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                } else {
                    Wrapper.SendError(response, 4, "post_local_login password", {code: 4, message: "password"});
                }
            } else {
                Wrapper.SendError(response, 5, "post_local_login username", {code: 5, message: "username"});
            }
        }

        /**
         * ログイン（facebook)
         * @param request
         * @param response
         * @returns none
         */
        public auth_facebook_callback(request: any, response: Express.Response): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;  //facebook
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "facebook";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = {mails: [], nickname: request.user.displayName, tokens: {}};

                    new_account.registerDate = Date.now();
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:facebook", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:facebook", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（twitter)
         * @param request
         * @param response
         * @returns none
         */
        public auth_twitter_callback(request: any, response: Express.Response): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;  //twitter
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);
                    let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                    let new_account: any = new LocalAccount();
                    new_account.provider = "twitter";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = content;
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:twitter", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:twitter", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        public auth_instagram_callback(request: any, response: Express.Response): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);
                    let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                    let new_account: any = new LocalAccount();
                    new_account.provider = "instagram";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = content;
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:instagram", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:instagram", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        public auth_line_callback(request: any, response: Express.Response): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "line";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = userid;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = {mails: [], nickname: request.user.displayName, tokens: {}};
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:line", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:line", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログアウト
         * @param request
         * @param response
         * @returns none
         */
        public logout(request: any, response: Express.Response): void {
            Auth.auth_event("logout:", request.user);
            request.logout();
            Wrapper.SendSuccess(response, {code: 0, message: ""});
        }

        /**
         * サーバ時間
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_server_date(request: any, response: Express.Response, next: any): void {
            Wrapper.SendSuccess(response, new Date());
        }
    }
}

module.exports = AuthModule;