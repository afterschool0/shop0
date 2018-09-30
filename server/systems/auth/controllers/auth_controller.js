/**!
 Copyright (c) 2018 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthModule;
(function (AuthModule) {
    var _ = require('lodash');
    var fs = require('graceful-fs');
    var path = require('path');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var passport = require('passport');
    var crypto = require('crypto');
    var pug = require('pug');
    var _config = require('config');
    var config = _config.get("systems");
    var message = config.message;
    var PromisedModule = require(path.join(process.cwd(), "server/systems/common/wrapper"));
    var Wrapper = new PromisedModule.Wrapper();
    var CipherModule = require(path.join(process.cwd(), "server/systems/common/cipher"));
    var Cipher = CipherModule.Cipher;
    var EventModule = require(path.join(process.cwd(), "server/systems/common/event"));
    var event = new EventModule.Event();
    var MailerModule = require(path.join(process.cwd(), "server/systems/common/mailer"));
    var _mailer = null;
    var bcc = "";
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
    var LocalAccount = require(path.join(process.cwd(), "models/systems/accounts/account"));
    var definition = { account_content: { mails: [], nickname: "", tokens: {} } };
    fs.open(path.join(process.cwd(), "models/systems/accounts/definition.json"), 'r', 384, function (error, fd) {
        if (!error) {
            fs.close(fd, function () {
                var addition = JSON.parse(fs.readFileSync(path.join(process.cwd(), "models/systems/accounts/definition.json"), 'utf-8'));
                definition = _.merge(definition, addition.account_content);
            });
        }
        else {
            console.log(error.message);
        }
    });
    var use_publickey = config.use_publickey;
    var Auth = /** @class */ (function () {
        function Auth() {
        }
        Auth.error_handler = function (e) {
        };
        Auth.prototype.create_init_user = function (initusers) {
            if (initusers) {
                var promises_1 = [];
                _.forEach(initusers, function (user) {
                    promises_1.push(new Promise(function (resolve, reject) {
                        if (user) {
                            var type_1 = user.type;
                            var auth_1 = user.auth;
                            var username_1 = user.username;
                            var groupid_1 = user.groupid;
                            var userid_1 = user.userid;
                            var passphrase_1 = Cipher.FixedCrypt(userid_1, config.key2);
                            var rootpassword_1 = user.password;
                            var content_1 = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...
                            Wrapper.FindOne(null, 1000, LocalAccount, { username: username_1 }, function (response, account) {
                                if (!account) {
                                    var _promise = new Promise(function (_resolve, _reject) {
                                        //let content: any = {"mails": [], "nickname": "", "group": ""};// definition.account_content;
                                        content_1.mails.push(username_1);
                                        content_1.nickname = user.displayName;
                                        LocalAccount.register(new LocalAccount({
                                            groupid: groupid_1,
                                            userid: userid_1,
                                            username: username_1,
                                            type: type_1,
                                            auth: auth_1,
                                            passphrase: passphrase_1,
                                            publickey: Cipher.PublicKey(passphrase_1),
                                            local: content_1
                                        }), rootpassword_1, function (error) {
                                            if (!error) {
                                                _resolve({});
                                            }
                                            else {
                                                _reject(error);
                                            }
                                        });
                                    });
                                    _promise.then(function (results) {
                                        resolve({});
                                    }).catch(function (error) {
                                        reject(error);
                                    });
                                }
                            });
                        }
                        else {
                            reject({});
                        }
                    }));
                });
                promises_1.reduce(function (prev, current, index, array) {
                    return prev.then(current);
                }, Promise.resolve()).then(function () {
                }).catch(function (error) {
                    Auth.error_handler(error);
                });
            }
        };
        Auth.auth_event = function (type, param) {
            switch (type) {
                case "register:local":
                    event.emitter.emit("register", { type: type, user: param });
                    break;
                default:
                    event.emitter.emit("auth", { type: type, token: param });
            }
        };
        ;
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.page_valid = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.enabled) {
                    next();
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.page_is_system = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().system) {
                    next();
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_system = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().system) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.page_is_user = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().user) {
                    next();
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_user = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().user) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_member = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().member) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_temp = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().temp) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_guest = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().guest) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_enabled_regist_user = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.Role().system) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                if (config.regist.user) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_enabled_regist_member = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (config.regist.member) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
        };
        Auth.publickey_decrypt = function (systempassphrase, encrypted, error) {
            var result = "";
            var username_decrypted = Cipher.PublicKeyDecrypt(systempassphrase, encrypted);
            if (username_decrypted.status === "success") {
                result = username_decrypted.plaintext;
            }
            else {
                error(username_decrypted.status);
            }
            return result;
        };
        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_register = function (request, response) {
            var username = request.body.username;
            var password = request.body.password;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Auth.publickey_decrypt(systempassphrase, username, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
                password = Auth.publickey_decrypt(systempassphrase, password, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
            }
            Wrapper.FindOne(response, 100, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (!account) {
                    try {
                        var metadata = {};
                        if (request.body.metadata) {
                            metadata = request.body.metadata;
                        }
                        var tokenValue = {
                            username: username,
                            password: password,
                            displayName: request.body.displayName,
                            metadata: metadata,
                            timestamp: Date.now()
                        };
                        var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        var link_1 = config.protocol + "://" + config.domain + "/auth/register/" + token;
                        fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/regist_mail.pug"), "utf8", function (err, data) {
                            if (!err) {
                                var doc = pug.render(data, { "link": link_1 });
                                _mailer.send(username, bcc, message.registconfirmtext, doc, function (error) {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, { code: 0, message: "" });
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                            else {
                                console.log(err.message);
                            }
                        });
                    }
                    catch (e) {
                        Wrapper.SendFatal(response, e.code, e.message, e);
                    }
                }
                else {
                    Wrapper.SendWarn(response, 1, message.usernamealreadyregist, {
                        code: 1,
                        message: message.usernamealreadyregist
                    });
                }
            });
        };
        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_register_token = function (request, response) {
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account_data) {
                        if (!error) {
                            if (!account_data) {
                                var groupid = config.systems.groupid;
                                var shasum = crypto.createHash('sha1');
                                shasum.update(token.username);
                                var userid = shasum.digest('hex');
                                var passphrase = Cipher.FixedCrypt(userid, config.key2);
                                var content = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...
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
                                }), token.password, function (error) {
                                    if (!error) {
                                        var user = request.body;
                                        user.username = token.username;
                                        user.password = token.password;
                                        passport.authenticate('local', function (error, user) {
                                            if (!error) {
                                                if (user) {
                                                    Auth.auth_event("register:local", user);
                                                    request.login(user, function (error) {
                                                        if (!error) {
                                                            Auth.auth_event("auth:local", request.params.token);
                                                            response.redirect("/");
                                                        }
                                                        else {
                                                            response.status(500).render('error', {
                                                                status: 500,
                                                                message: "get_register_token " + error.message
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    response.status(500).render('error', {
                                                        status: 500,
                                                        message: "authenticate"
                                                    });
                                                }
                                            }
                                            else {
                                                response.status(500).render('error', {
                                                    status: 500,
                                                    message: "get_register_token " + error.message
                                                });
                                            }
                                        })(request, response);
                                    }
                                    else {
                                        response.status(500).render('error', {
                                            status: 500,
                                            message: "get_register_token " + error.message
                                        });
                                    }
                                });
                            }
                            else {
                                response.redirect("/");
                            }
                        }
                        else {
                            response.status(500).render('error', { status: 500, message: "get_register_token " + error.message });
                        }
                    });
                }
                else {
                    response.status(200).render('error', { status: 200, message: "timeout" });
                }
            });
        };
        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_member_register = function (request, response) {
            var username = request.body.username;
            var password = request.body.password;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Auth.publickey_decrypt(systempassphrase, username, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
                password = Auth.publickey_decrypt(systempassphrase, password, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
            }
            Wrapper.FindOne(response, 100, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (!account) {
                    try {
                        var metadata = { userid: request.user.userid };
                        if (request.body.metadata) {
                            metadata = request.body.metadata;
                            metadata.groupid = request.user.groupid;
                            metadata.userid = request.user.userid;
                        }
                        var tokenValue = {
                            username: username,
                            password: password,
                            displayName: request.body.displayName,
                            metadata: metadata,
                            auth: 101,
                            timestamp: Date.now()
                        };
                        var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        var link_2 = config.protocol + "://" + config.domain + "/auth/member/" + token;
                        fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/regist_member_mail.pug"), "utf8", function (err, data) {
                            if (!err) {
                                var doc = pug.render(data, { "link": link_2 });
                                _mailer.send(username, bcc, message.memberconfirmtext, doc, function (error) {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, { code: 0, message: "" });
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                        });
                    }
                    catch (e) {
                        Wrapper.SendFatal(response, e.code, e.message, e);
                    }
                }
                else {
                    Wrapper.SendWarn(response, 1, message.usernamealreadyregist, {
                        code: 1,
                        message: message.usernamealreadyregist
                    });
                }
            });
        };
        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_member_token = function (request, response) {
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account_data) {
                        if (!error) {
                            if (!account_data) {
                                var content = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...
                                content.mails.push(token.username);
                                content.nickname = token.displayName;
                                var groupid = config.systems.groupid;
                                var userid = "";
                                if (token.metadata.userid) {
                                    userid = token.metadata.userid;
                                }
                                else {
                                    var shasum = crypto.createHash('sha1');
                                    shasum.update(token.username);
                                    userid = shasum.digest('hex');
                                }
                                var passphrase = Cipher.FixedCrypt(userid, config.key2);
                                LocalAccount.register(new LocalAccount({
                                    groupid: groupid,
                                    userid: userid,
                                    username: token.username,
                                    passphrase: passphrase,
                                    publickey: Cipher.PublicKey(passphrase),
                                    auth: token.auth,
                                    local: content
                                }), token.password, function (error) {
                                    if (!error) {
                                        var user = request.body;
                                        user.username = token.username;
                                        user.password = token.password;
                                        passport.authenticate('local', function (error, user) {
                                            if (!error) {
                                                if (user) {
                                                    request.login(user, function (error) {
                                                        if (!error) {
                                                            Auth.auth_event("auth:member", request.params.token);
                                                            response.redirect("/");
                                                        }
                                                        else {
                                                            response.status(500).render('error', {
                                                                status: 500,
                                                                message: "get_member_token " + error.message
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    response.status(500).render('error', {
                                                        status: 500,
                                                        message: "authenticate"
                                                    });
                                                }
                                            }
                                            else {
                                                response.status(500).render('error', {
                                                    status: 500,
                                                    message: "get_member_token " + error.message
                                                });
                                            }
                                        })(request, response);
                                    }
                                    else {
                                        response.status(500).render('error', {
                                            status: 500,
                                            message: "get_member_token " + error.message
                                        });
                                    }
                                });
                            }
                            else {
                                response.redirect("/");
                            }
                        }
                        else {
                            response.status(500).render('error', { status: 500, message: "get_register_token " + error.message });
                        }
                    });
                }
                else {
                    response.status(200).render('error', { status: 200, message: "timeout" });
                }
            });
        };
        /**
         * レジスタートークン発行
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_username = function (request, response) {
            var username = request.body.username;
            var password = request.body.password;
            var newusername = request.body.newusername;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Auth.publickey_decrypt(systempassphrase, username, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
                password = Auth.publickey_decrypt(systempassphrase, password, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
            }
            Wrapper.FindOne(response, 1, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (account) {
                    Wrapper.FindOne(response, 2, LocalAccount, { $and: [{ provider: "local" }, { username: newusername }] }, function (response, account) {
                        if (!account) {
                            try {
                                var tokenValue = {
                                    username: username,
                                    password: password,
                                    newusername: newusername,
                                    timestamp: Date.now()
                                };
                                var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                var link_3 = config.protocol + "://" + config.domain + "/auth/username/" + token;
                                //let beacon: string = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                                fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/username_mail.pug"), "utf8", function (err, data) {
                                    if (!err) {
                                        var doc = pug.render(data, { "link": link_3 });
                                        _mailer.send(username, bcc, message.usernameconfirmtext, doc, function (error) {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, { code: 0, message: "" });
                                            }
                                            else {
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                    else {
                                        console.log(err.message);
                                    }
                                });
                            }
                            catch (e) {
                                Wrapper.SendFatal(response, e.code, e.message, e);
                            }
                        }
                        else {
                            Wrapper.SendWarn(response, 2, message.usernamealreadyregist, {
                                code: 2,
                                message: message.usernamealreadyregist
                            });
                        }
                    });
                }
                else {
                    Wrapper.SendWarn(response, 3, message.usernamenotfound, {
                        code: 3,
                        message: message.usernamenotfound
                    });
                }
            });
        };
        /**
         * ユーザ名トークンでユーザ名変更（多分使用しない)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_username_token = function (request, response) {
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account) {
                        if (!error) {
                            if (account) {
                                account.username = token.newusername;
                                if (!error) {
                                    Wrapper.Save(response, 1, account, function () {
                                        response.redirect("/");
                                    });
                                }
                                else {
                                    response.status(500).render("error", { message: "get_username_token " + error.message, status: 500 }); // already
                                }
                            }
                            else {
                                response.status(200).render("error", { message: "already", status: 200 }); // already
                            }
                        }
                        else {
                            response.status(500).render("error", { message: "get_username_token " + error.message, status: 500 }); // timeout
                        }
                    });
                }
                else {
                    response.status(200).render("error", { message: "timeout", status: 200 }); // timeout
                }
            });
        };
        /**
         * パスワードトークン発行
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_password = function (request, response) {
            var username = request.body.username;
            var password = request.body.password;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Auth.publickey_decrypt(systempassphrase, username, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
                password = Auth.publickey_decrypt(systempassphrase, password, function (status) {
                    Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                });
            }
            Wrapper.FindOne(response, 1, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (account) {
                    try {
                        var tokenValue = {
                            username: username,
                            password: password,
                            timestamp: Date.now()
                        };
                        var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        var link_4 = config.protocol + "://" + config.domain + "/auth/password/" + token;
                        fs.readFile(path.join(process.cwd(), "views/systems/auth/mail/password_mail.pug"), "utf8", function (err, data) {
                            if (!err) {
                                var doc = pug.render(data, { "link": link_4 });
                                _mailer.send(username, bcc, message.passwordconfirmtext, doc, function (error) {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, { code: 0, message: "" });
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                        });
                    }
                    catch (e) {
                        Wrapper.SendFatal(response, e.code, e.message, e);
                    }
                }
                else {
                    Wrapper.SendWarn(response, 2, message.usernamenotfound, {
                        code: 2,
                        message: message.usernamenotfound
                    });
                }
            });
        };
        /**
         * パスワードトークンからパスワード変更
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_password_token = function (request, response) {
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account) {
                        if (!error) {
                            if (account) {
                                account.setPassword(token.password, function (error) {
                                    if (!error) {
                                        Wrapper.Save(response, 1, account, function () {
                                            response.redirect("/");
                                        });
                                    }
                                    else {
                                        response.status(500).render("error", { message: "get_password_token " + error.message, status: 500 }); // already
                                    }
                                });
                            }
                            else {
                                response.status(200).render("error", { message: "already", status: 200 }); // already
                            }
                        }
                        else {
                            response.status(500).render("error", { message: "get_password_token " + error.message, status: 500 }); // timeout
                        }
                    });
                }
                else {
                    response.status(200).render("error", { message: "timeout", status: 200 }); // timeout
                }
            });
        };
        /**
         * ログイン
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_login = function (request, response) {
            var systempassphrase = request.session.id;
            if (request.body.username) {
                if (request.body.password) {
                    if (use_publickey) {
                        request.body.username = Auth.publickey_decrypt(systempassphrase, request.body.username, function (status) {
                            Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                        });
                        request.body.password = Auth.publickey_decrypt(systempassphrase, request.body.password, function (status) {
                            Wrapper.SendError(response, 1, "security infringement", { code: 1, message: "security infringement" });
                        });
                    }
                    passport.authenticate("local", function (error, user) {
                        if (!error) {
                            if (user) {
                                Wrapper.Guard(request, response, function (request, response) {
                                    request.login(user, function (error) {
                                        if (!error) {
                                            Auth.auth_event("login:local", request.body.username);
                                            Wrapper.SendSuccess(response, {});
                                        }
                                        else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                });
                            }
                            else {
                                Wrapper.SendError(response, 2, message.usernamenotfound, {
                                    code: 2,
                                    message: message.usernamenotfound
                                });
                            }
                        }
                        else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    })(request, response);
                }
                else {
                    Wrapper.SendError(response, 4, "post_local_login password", { code: 4, message: "password" });
                }
            }
            else {
                Wrapper.SendError(response, 5, "post_local_login username", { code: 5, message: "username" });
            }
        };
        /**
         * ログイン（facebook)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_facebook_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var groupid = config.systems.groupid;
                    var userid = request.user.id; //facebook
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var new_account_1 = new LocalAccount();
                    new_account_1.provider = "facebook";
                    new_account_1.groupid = groupid;
                    new_account_1.userid = userid;
                    new_account_1.username = request.user.username;
                    new_account_1.passphrase = passphrase;
                    new_account_1.publickey = Cipher.PublicKey(passphrase);
                    new_account_1.local = { mails: [], nickname: request.user.displayName, tokens: {} };
                    new_account_1.registerDate = Date.now();
                    new_account_1.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:facebook", new_account_1);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:facebook", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログイン（twitter)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_twitter_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var groupid = config.systems.groupid;
                    var userid = request.user.id; //twitter
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var content = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...
                    var new_account_2 = new LocalAccount();
                    new_account_2.provider = "twitter";
                    new_account_2.groupid = groupid;
                    new_account_2.userid = userid;
                    new_account_2.username = request.user.username;
                    new_account_2.passphrase = passphrase;
                    new_account_2.publickey = Cipher.PublicKey(passphrase);
                    new_account_2.local = content;
                    new_account_2.registerDate = Date.now(); // Legacy of v1
                    new_account_2.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:twitter", new_account_2);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:twitter", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_instagram_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var groupid = config.systems.groupid;
                    var userid = request.user.id;
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var content = JSON.parse(JSON.stringify(definition.account_content)); // deep copy...
                    var new_account_3 = new LocalAccount();
                    new_account_3.provider = "instagram";
                    new_account_3.groupid = groupid;
                    new_account_3.userid = userid;
                    new_account_3.username = request.user.username;
                    new_account_3.passphrase = passphrase;
                    new_account_3.publickey = Cipher.PublicKey(passphrase);
                    new_account_3.local = content;
                    new_account_3.registerDate = Date.now(); // Legacy of v1
                    new_account_3.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:instagram", new_account_3);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:instagram", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_line_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var groupid = config.systems.groupid;
                    var userid = request.user.id;
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var new_account_4 = new LocalAccount();
                    new_account_4.provider = "line";
                    new_account_4.groupid = groupid;
                    new_account_4.userid = userid;
                    new_account_4.username = userid;
                    new_account_4.passphrase = passphrase;
                    new_account_4.publickey = Cipher.PublicKey(passphrase);
                    new_account_4.local = { mails: [], nickname: request.user.displayName, tokens: {} };
                    new_account_4.registerDate = Date.now(); // Legacy of v1
                    new_account_4.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:line", new_account_4);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:line", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログアウト
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.logout = function (request, response) {
            Auth.auth_event("logout:", request.user);
            request.logout();
            Wrapper.SendSuccess(response, { code: 0, message: "" });
        };
        /**
         * サーバ時間
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.get_server_date = function (request, response, next) {
            Wrapper.SendSuccess(response, new Date());
        };
        return Auth;
    }());
    AuthModule.Auth = Auth;
})(AuthModule = exports.AuthModule || (exports.AuthModule = {}));
module.exports = AuthModule;
//# sourceMappingURL=auth_controller.js.map