/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

namespace App {

    const fs: any = require("graceful-fs");
    const path: any = require("path");
    const express: any = require("express");

    let normal = () => {
        // initialize
        const morgan: any = require("morgan");
        morgan.format("original", "[:date] :method :url :status :response-time ms");

        const _ = require("lodash");

        const mongoose: any = require("mongoose");
        mongoose.Promise = global.Promise;

        const favicon: any = require("serve-favicon");

        const cookieParser: any = require("cookie-parser");
        const bodyParser: any = require("body-parser");

        // passport
        const passport: any = require("passport");
        const LocalStrategy: any = require("passport-local").Strategy;
        const FacebookStrategy: any = require("passport-facebook").Strategy;
        const TwitterStrategy: any = require("passport-twitter").Strategy;
        const InstagramStrategy: any = require("passport-instagram").Strategy;
        const LineStrategy: any = require("passport-line").Strategy;
        // const GooglePlusStrategy: any = require('passport-google-plus');
        // passport

        console.log(process.env.LC_CTYPE);
        console.log("Hundred.");

        const app: any = express();

        // helmet
        const helmet: any = require("helmet");
        app.use(helmet());
        app.use(helmet.hidePoweredBy({setTo: "JSF/1.2"}));  // impersonation

        const _config: any = require('config');
        const config: any = _config.get("systems");

        const CipherModule: any = require(path.join(process.cwd(), "server/systems/common/cipher"));
        const Cipher: any = CipherModule.Cipher;

        const EventModule: any = require(path.join(process.cwd(), "server/systems/common/event"));
        const event: any = new EventModule.Event();

        // passport
        const session: any = require("express-session");

        if (config.csrfsecret) {
            const csrf: any = require("csurf");
            app.use(session({secret: config.csrfsecret}));
            app.use(csrf({cookie: true}));
            app.use((req, res, next) => {
                res.locals.csrftoken = req.csrfToken();
                next();
            });
        }

        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        // view engine setup

        // result settings
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        app.use(cookieParser());
        // result settings

        //const logger = share.logger;

        const log4js: any = require('log4js');
        log4js.configure(path.join(process.cwd(), "config/systems/logs.json"));
        const logger: any = log4js.getLogger('request');

        if (config.status !== 'production') {
            app.use(morgan('original', {immediate: true}));
        } else {
            const rotatestream = require('logrotate-stream');
            app.use(morgan('combined', {
                stream: rotatestream({
                    file: __dirname + '/logs/access.log',
                    size: '100k',
                    keep: 3
                })
            }));
        }

        app.use(express.static(path.join(__dirname, 'public')));

        app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));

        let definition = {account_content: {}};
        //       fs.open(share.Models('systems/accounts/definition.json'), 'ax+', 384, (error, fd) => {
        //          if (!error) {
        //              fs.close(fd, (error) => {
        definition = JSON.parse(fs.readFileSync(path.join(__dirname, 'models/systems/accounts/definition.json'), 'utf-8'));
        //            });
        //      }
        //});

        const MongoStore = require('connect-mongo')(session);

        const options = {keepAlive: 1, connectTimeoutMS: 1000000, reconnectTries: 30, reconnectInterval: 2000, useNewUrlParser: true};

        // const options = {keepAlive: 300000, connectTimeoutMS: 1000000};

        let connect_url = "mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name;
        if (config.db.noauth) {
            connect_url = "mongodb://" + config.db.address + "/" + config.db.name;
        }

        mongoose.connect(connect_url, options)
            .catch(error => {
                console.log('catch Mongoose exeption. ');
                logger.fatal('catch Mongoose exeption. ', error.stack);
                process.exit(1);
            });

        mongoose.connection.once('open', () => {

            mongoose.connection.on('connected', () => {
                logger.fatal('connected');
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Mongoose default connection disconnected');
                logger.fatal('Mongoose default connection disconnected');
                process.exit(1);
            });

            mongoose.connection.on('reconnected', () => {
                logger.fatal('reconnected');
            });

            mongoose.connection.on('error', (error) => {
                console.log('Mongoose default connection error');
                logger.fatal('Mongoose default connection error: ' + error);
                process.exit(1);
            });

            app.use(session({
                name: config.sessionname,
                secret: config.sessionsecret,
                resave: false,
                rolling: true,
                saveUninitialized: true,
                cookie: {
                    maxAge: 365 * 24 * 60 * 60 * 1000
                },
                store: new MongoStore({
                    mongooseConnection: mongoose.connection,
                    ttl: 365 * 24 * 60 * 60,
                    clear_interval: 60 * 60
                })
            }));

            // passport
            app.use(passport.initialize());
            app.use(passport.session());
            // passport

            let load_module: any = (root: string, modules: any): void => {
                if (modules) {
                    modules.forEach((module) => {
                        let path = root + module.path;
                        let name = module.name;
                        app.use("/" + name, require(path + name + "/api"));
                        app.use("/" + name, require(path + name + "/pages"));
                    });
                }
            };

            console.log("V1");

            let modules = [
                {
                    "type": "required",
                    "path": "/systems/",
                    "name": "auth",
                    "description": {}
                },
                {
                    "type": "required",
                    "path": "/systems/",
                    "name": "accounts",
                    "description": {}
                },
                {
                    "type": "required",
                    "path": "/systems/",
                    "name": "publickey",
                    "description": {}
                },
                {
                    "type": "required",
                    "path": "/systems/",
                    "name": "session",
                    "description": {}
                },
                {
                    "type": "required",
                    "path": "/systems/",
                    "name": "profile",
                    "description": {
                        "display": "Profile"
                    }
                }
            ];

            load_module("./server", modules);

            console.log("VR");
            // root

            let load_root_module: any = (root: string, modules: any): void => {
                if (modules) {
                    modules.forEach((module) => {
                        let path = root + module.path;
                        let name = module.name;
                        app.use("/", require(path + name + "/api"));
                        app.use("/", require(path + name + "/pages"));
                    });
                }
            };

            load_root_module("./server", config.root_modules);

            // passport

            const Account: any = require(path.join(process.cwd(), "models/systems/accounts/account"));

            passport.use(new LocalStrategy(Account.authenticate()));

            passport.serializeUser((user, done): void => {
                switch (user.provider) {
                    case "facebook":
                    case "twitter":
                    case "instagram":
                    case "googleplus":
                    case "line":
                        let objectid: any = new mongoose.Types.ObjectId; // Create new id
                        user.username = user.id;
                        user.groupid = user.id;
                        user.userid = user.id;
                        user.enabled = true;
                        user.passphrase = objectid.toString();
                        user.publickey = Cipher.PublicKey(user.passphrase);
                        user.local = definition.account_content;
                        break;
                    case "local":
                        break;
                    default:
                }
                done(null, user);
            });

            passport.deserializeUser((obj, done): void => {
                done(null, obj);
            });

            if (config.facebook) {
                passport.use(new FacebookStrategy(config.facebook.key, (accessToken, refreshToken, profile, done): void => {
                        process.nextTick((): void => {
                            done(null, profile);
                        });
                    }
                ));
            }

            if (config.twitter) {
                passport.use(new TwitterStrategy(config.twitter.key, (accessToken, refreshToken, profile, done): void => {
                        process.nextTick((): void => {
                            done(null, profile);
                        });
                    }
                ));
            }

            if (config.instagram) {
                passport.use(new InstagramStrategy(config.instagram.key, (accessToken, refreshToken, profile, done): void => {
                        process.nextTick((): void => {
                            done(null, profile);
                        });
                    }
                ));
            }

            if (config.line) {
                passport.use(new LineStrategy(config.line.key, (accessToken, refreshToken, profile, done): void => {
                        process.nextTick((): void => {
                            done(null, profile);
                        });
                    }
                ));
            }

            if (config.googleplus) {
                //          passport.use(new GooglePlusStrategy(config.googleplus.key, (accessToken, refreshToken, profile, done): void => {
                //                  process.nextTick((): void => {
                //                      done(null, profile);
                //                  })
                //              }
                //          ));
            }
            // passport

            // const auth: any = core.auth;

            const AuthController: any = require(path.join(process.cwd(), "server/systems/auth/controllers/auth_controller"));
            const auth: any = new AuthController.Auth();


            auth.create_init_user(config.initusers);

            let server: any = Serve(config, app);
            let Socket: any = require('./server/systems/common/sio');
            let io = new Socket.IO(server);
            io.wait(config, event);

            // error handlers
            app.use((req, res, next): void => {
                let err: any = new Error('Not Found');
                err.status = 404;
                next(err);
            });

            if (app.get('env') === 'development') {
                app.use((err, req, res, next): void => {
                    res.status(err.status || 500);
                    res.render('error', {
                        message: err.message,
                        status: err.status
                    });
                });
            }

            app.use((err, req, res, next): void => {
                if (req.xhr) {
                    res.status(500).send(err);
                } else {
                    res.status(err.status || 500);
                    res.render('error', {
                        message: err.message,
                        error: {}
                    });
                }
            });
        });

        event.emitter.on('socket', (data): void => {

        });

        event.emitter.on('mail', (mail): void => {

        });

        process.on('SIGINT', (): void => { // for pm2 cluster.
            mongoose.connection.close(() => {
                logger.info('Stop by SIGINT.');
                process.exit(0);
            });
        });

        process.on('message', (msg): void => {  // for pm2 cluster on windows.
            if (msg == 'shutdown') {
                logger.info('Stop by shutdown.');
                setTimeout(function () {
                    process.exit(0);
                }, 1500);
            }
        });
    };

    let Serve = (config, app: any): any => {
        let debug = require('debug')('a:server');
        let http = require('http');

        let port = normalizePort(process.env.PORT || config.port);
        app.set('port', port);

        let server = http.createServer(app);

        function normalizePort(val) {
            let port = parseInt(val, 10);

            if (isNaN(port)) {
                // named pipe
                return val;
            }

            if (port >= 0) {
                // port number
                return port;
            }

            return false;
        }

        function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            let bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        function onListening() {
            let addr = server.address();
            let bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            debug('Listening on ' + bind);

            process.send = process.send || function () {
            };  // for pm2 cluster.
            process.send('ready');
        }

        server.listen(port, '::0');
        server.on('error', onError);
        server.on('listening', onListening);

        console.log("V2");

        return server;
    };

    normal();

}