/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'graceful-fs';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as crypto from 'crypto';
import * as pug from 'pug';
import * as log4js from 'log4js';

import * as ConfigModule from 'config';
import * as Wrapper from "../../../../server/systems/common/wrapper";
import * as Cipher from "../../../../server/systems/common/cipher";
import * as Event from "../../../../server/systems/common/event";
import * as Mailer from "../../../../server/systems/common/mailer";
import * as Mailer2 from "../../../../server/systems/common/mailer";
import * as MailGun from "../../../../server/systems/common/mailer";

//const LocalAccount: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

import * as LocalAccount from "../../../../models/systems/accounts/account";

mongoose.Promise = global.Promise;

const config: any = ConfigModule.get("systems");

log4js.configure("./config/systems/logs.json");
const logger: any = log4js.getLogger('request');

const message: any = config.message;

const TWrapper: any = Wrapper;
const wrapper = new TWrapper();

const TCipher: any = Cipher;
const cipher = new TCipher();

const TEvent: any = Event;
const event: any = new TEvent();

let _mailer: any = null;
let bcc: string | any[] = "";
let TMailer: any = Mailer;
let TMailer2: any = Mailer2;
let TMailGun: any = MailGun;

switch (config.mailer.type) {
    case "mail":
        _mailer = new TMailer(config.mailer.setting, config.mailer.account);
        bcc = "";
        break;
    case "gmail":
        _mailer = new TMailer2(config.mailer.setting, config.mailer.account);
        bcc = "";
        break;
    case "mailgun":
        _mailer = new TMailGun(config.mailer.setting, config.mailer.account);
        bcc = [];
        break;
    default:
        _mailer = new TMailer2(config.mailer.setting, config.mailer.account);
        bcc = "";
        break;
}

interface PasswordToken {
    username: string;
    password: string;
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
            _.forEach(initusers, (user: any): void => {
                promises.push(new Promise((resolve: any, reject: any): void => {
                    if (user) {
                        //let type: string = user.type;
                        let auth: number = user.auth;
                        let username: string = user.username;
                        let groupid: string = user.groupid;
                        let userid: string = user.userid;
                        let passphrase: string = cipher.FixedCrypt(userid, config.key2);
                        let rootpassword: string = user.password;
                        let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                        if (user.metadata) {
                            content = Object.assign(content, user.metadata);
                        }

                        content.mails.push(user.username);

                        wrapper.FindOne(LocalAccount, {username: username}, (error: any, account: any): void => {
                            if (!error) {
                                if (!account) {
                                    let _promise = new Promise((_resolve: any, _reject: any): void => {
                                        LocalAccount.register(new LocalAccount({
                                                groupid: groupid,
                                                userid: userid,
                                                username: username,
                                                auth: auth,
                                                passphrase: passphrase,
                                                publickey: cipher.PublicKey(passphrase),
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
                            } else {
                                reject(error);
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
            if (LocalAccount.Role(user).system) {
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
            if (LocalAccount.Role(user).system) {
                next();
            } else {
                wrapper.SendError(response, {code: 403, message: "Forbidden."});
            }
        } else {
            wrapper.SendError(response, {code: 403, message: "Forbidden."});
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
            if (LocalAccount.Role(user).user) {
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
            if (LocalAccount.Role(user).user) {
                next();
            } else {
                wrapper.SendError(response, {code: 403, message: "Forbidden."});
            }
        } else {
            wrapper.SendError(response, {code: 403, message: "Forbidden."});
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
            if (LocalAccount.Role(user).member) {
                next();
            } else {
                wrapper.SendError(response, {code: 403, message: "Forbidden."});
            }
        } else {
            wrapper.SendError(response, {code: 403, message: "Forbidden."});
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
            if (LocalAccount.Role(user).temp) {
                next();
            } else {
                wrapper.SendError(response, {code: 403, message: "Forbidden."});
            }
        } else {
            wrapper.SendError(response, {code: 403, message: "Forbidden."});
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
            if (LocalAccount.Role(user).guest) {
                next();
            } else {
                wrapper.SendError(response, {code: 403, message: "Forbidden."});
            }
        } else {
            wrapper.SendError(response, {code: 403, message: "Forbidden."});
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
            if (LocalAccount.Role(user).system) {
                next();
            } else {
                wrapper.SendError(response, {code: 403, message: "Forbidden."});
            }
        } else {
            if (config.regist.user) {
                next();
            } else {
                wrapper.SendError(response, {code: 403, message: "Forbidden."});
            }
        }
    }

    static publickey_decrypt(systempassphrase: string, encrypted: string, callback: (error: any, result: string) => void): void {
        let username_decrypted: Decoded = cipher.PublicKeyDecrypt(systempassphrase, encrypted);
        if (username_decrypted.status === "success") {
            callback(null, decodeURIComponent(username_decrypted.plaintext));
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
                            callback({code: 2, message: "no cookie?"}, "", "");
                        }
                    });
                } else {
                    callback({code: 1, message: "no cookie?"}, "", "");
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
        let body = request.body;
        if (body) {
            let username: string = body.username;
            let password: string = body.password;
            let metadata: any = body.metadata;
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
                    wrapper.FindOne(LocalAccount, {username: username},
                        (error: any, account: any): void => {
                            if (!error) {
                                if (!account) {
                                    try {

                                        let tokenValue: any = {
                                            auth: 1000,
                                            username: username,
                                            password: password,
                                            //      groupid: groupid,
                                            metadata: metadata,
                                            timestamp: Date.now()
                                        };

                                        let token: string = cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                        let link: string = config.protocol + "://" + config.domain + "/auth/register/" + token;

                                        fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/regist_mail.pug"), "utf8", (err, data) => {
                                            if (!err) {
                                                var doc = pug.render(data, {"link": link});
                                                _mailer.send(username, bcc, message.registconfirmtext, doc, (error: any) => {
                                                    if (!error) {
                                                        wrapper.SendSuccess(response, {code: 0, message: ""});
                                                    } else {
                                                        wrapper.SendError(response, error);
                                                    }
                                                });
                                            } else {
                                                console.log(err.message);
                                            }
                                        });
                                    } catch (e) {
                                        wrapper.SendFatal(response, e);
                                    }
                                } else {
                                    wrapper.SendWarn(response, {code: 1, message: message.usernamealreadyregist});
                                }
                            } else {
                                wrapper.SendError(response, error);
                            }
                        });
                } else {
                    wrapper.SendError(response, error);
                }
            });
        } else {
            wrapper.SendFatal(response, {code: 1, message: "no body..."});
        }
    }

    /**
     * レジスタートークンでユーザ登録
     * @param request
     * @param response
     * @returns none
     */
    public get_register_token(request: any, response: Express.Response): void {

        wrapper.Exception(request, response, (request: any, response: any): void => {
            let token = wrapper.Parse(cipher.FixedDecrypt(request.params.token, config.tokensecret));
            let tokenDateTime: any = token.timestamp;
            let nowDate: any = Date.now();
            if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                wrapper.FindOne(LocalAccount, {username: token.username}, (error: any, account: any): void => {
                    if (!error) {
                        if (!account) {
                            let groupid = config.systems.groupid;
                            const shasum = crypto.createHash('sha1'); //
                            shasum.update(token.username);                      // create userid from username.
                            let userid: string = shasum.digest('hex'); //
                            let passphrase: string = cipher.FixedCrypt(userid, config.key2);
                            let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                            if (token.metadata) {
                                content = Object.assign(content, token.metadata);
                            }

                            content.mails.push(token.username);

                            LocalAccount.register(new LocalAccount({
                                    groupid: groupid,
                                    userid: userid,
                                    username: token.username,
                                    passphrase: passphrase,
                                    publickey: cipher.PublicKey(passphrase),
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
                                                            response.status(500).render('error', {status: 500, message: "get_register_token " + error.message});
                                                        }
                                                    });
                                                } else {
                                                    response.status(500).render('error', {status: 500, message: "authenticate"});
                                                }
                                            } else {
                                                response.status(500).render('error', {status: 500, message: "get_register_token " + error.message});
                                            }
                                        })(request, response);
                                    } else {
                                        response.status(500).render('error', {status: 500, message: "get_register_token " + error.message});
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
        let groupid: string = request.body.groupid;
        let systempassphrase: string = request.session.id;
        Auth.username_and_password_decrypt(use_publickey, systempassphrase, username, password, (error: any, username: string, password: string): void => {
            if (!error) {
                wrapper.FindOne(LocalAccount, {username: username}, (error: any, account: any): void => {
                    if (!error) {
                        if (account) {
                            try {

                                let tokenValue: any = {
                                    username: username,
                                    password: password,
                                    groupid: groupid,
                                    timestamp: Date.now()
                                };

                                let token: any = cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                let link: string = config.protocol + "://" + config.domain + "/auth/password/" + token;

                                fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/password_mail.pug"), "utf8", (err, data) => {
                                    if (!err) {
                                        var doc = pug.render(data, {"link": link});
                                        _mailer.send(username, bcc, message.passwordconfirmtext, doc, (error: any) => {
                                            if (!error) {
                                                wrapper.SendSuccess(response, {code: 0, message: ""});
                                            } else {
                                                wrapper.SendError(response, error);
                                            }
                                        });
                                    }
                                });

                            } catch (e) {
                                wrapper.SendFatal(response, e);
                            }
                        } else {
                            wrapper.SendWarn(response, {code: 2, message: message.usernamenotfound});
                        }
                    } else {
                        wrapper.SendError(response, error);
                    }
                });
            } else {
                wrapper.SendError(response, error);
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
        wrapper.Exception(request, response, (request: any, response: any): void => {
            let token: any = wrapper.Parse(cipher.FixedDecrypt(request.params.token, config.tokensecret));
            let tokenDateTime: any = token.timestamp;
            let nowDate: any = Date.now();
            if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                wrapper.FindOne(LocalAccount, {username: token.username}, (error: any, account: any): void => {
                    if (!error) {
                        if (account) {
                            account.setPassword(token.password, (error: any): void => {
                                if (!error) {
                                    wrapper.Save(account, (error, obj): void => {
                                        if (!error) {
                                            response.redirect("/");
                                        } else {
                                            response.status(500).render("error", {message: "db error", status: 500}); // timeout
                                        }
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
     *
     * authenticateはsessionのパスワードをそのまま使用する
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
                                    wrapper.Guard(request, response, (request: any, response: any): void => {
                                        request.login(user, (error: any): void => {
                                            if (!error) {
                                                Auth.auth_event("login:local", request.body.username);
                                                wrapper.SendSuccess(response, {});
                                            } else {
                                                wrapper.SendError(response, error);
                                            }
                                        });
                                    });
                                } else {
                                    wrapper.SendError(response, {code: 2, message: message.usernamenotfound});
                                }
                            } else {
                                wrapper.SendError(response, error);
                            }
                        })(request, response);
                    } else {
                        wrapper.SendError(response, error);
                    }
                });
            } else {
                wrapper.SendError(response, {code: 4, message: "password"});
            }
        } else {
            wrapper.SendError(response, {code: 5, message: "username"});
        }
    }

    /**
     * ログイン（facebook)
     * @param request
     * @param response
     * @returns none
     */
    public auth_facebook_callback(request: any, response: Express.Response): void {
        wrapper.FindOne(LocalAccount, {username: request.user.username}, (error: any, account: any): void => {
            if (!error) {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;  //facebook
                    let passphrase: string = cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "facebook";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = cipher.PublicKey(passphrase);
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
            } else {
                wrapper.SendError(response, error);
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
        wrapper.FindOne(LocalAccount, {username: request.user.username}, (error: any, account: any): void => {
            if (!error) {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;  //twitter
                    let passphrase: string = cipher.FixedCrypt(userid, config.key2);
                    let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                    let new_account: any = new LocalAccount();
                    new_account.provider = "twitter";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = cipher.PublicKey(passphrase);
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
            } else {
                wrapper.SendError(response, error);
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
        wrapper.FindOne(LocalAccount, {username: request.user.username}, (error: any, account: any): void => {
            if (!error) {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;
                    let passphrase: string = cipher.FixedCrypt(userid, config.key2);
                    let content: any = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...

                    let new_account: any = new LocalAccount();
                    new_account.provider = "instagram";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = cipher.PublicKey(passphrase);
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
            } else {
                wrapper.SendError(response, error);
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
        wrapper.FindOne(LocalAccount, {username: request.user.username}, (error: any, account: any): void => {
            if (!error) {
                if (!account) {
                    let groupid = config.systems.groupid;
                    let userid: string = request.user.id;
                    let passphrase: string = cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "line";
                    new_account.groupid = groupid;
                    new_account.userid = userid;
                    new_account.username = userid;
                    new_account.passphrase = passphrase;
                    new_account.publickey = cipher.PublicKey(passphrase);
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
            } else {
                wrapper.SendError(response, error);
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
        wrapper.SendSuccess(response, {code: 0, message: ""});
    }

    /**
     * サーバ時間
     * @param request
     * @param response
     * @param next
     * @returns none
     */
    public get_server_date(request: any, response: Express.Response, next: any): void {
        wrapper.SendSuccess(response, new Date());
    }
}

module.exports = Auth;