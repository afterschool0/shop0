/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */

"use strict";

//require('sqreen');

import * as express from 'express';
import * as fs from "graceful-fs";
import * as morgan from "morgan";
import * as mongoose from "mongoose";
import * as passport from "passport";

import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";

import * as helmet from "helmet";
import * as session from "express-session";
import * as log4js from 'log4js';
import * as rotatestream from 'logrotate-stream';
import * as _config from'config';

import * as LocalStrategyModule from "passport-local";
import * as FacebookStrategyModule from "passport-facebook";
import * as TwitterStrategyModule from "passport-twitter";
import * as InstagramStrategyModule from "passport-instagram";
import * as LineStrategyModule from "passport-line";

import * as Scheduler from "./server/systems/common/scheduler";
import * as Unix from "./server/systems/common/commandar";
import * as Cipher from "./server/systems/common/cipher";
import * as Event from "./server/systems/common/event";
import * as IO from'./server/systems/common/sio';

import * as LocalAccount from "./models/systems/accounts/account";

import * as Auth from "./server/systems/auth/controllers/auth_controller";



let normal = () => {

    morgan.format("original", "[:date] :method :url :status :response-time ms");

    mongoose.Promise = global.Promise;

    console.log("LC_CTYPE : " + process.env.LC_CTYPE);
    console.log("PWD      : " + process.env.PWD);
    console.log("HOME     : " + process.env.HOME);
    console.log("Hundred.");

    const app: any = express();

    // helmet
    app.use(helmet());
    app.use(helmet.hidePoweredBy({setTo: "JSF/1.2"}));  // impersonation

    const config: any = _config.get("systems");
    //const config: any = require('config').get("systems");

    const TCipher: any = Cipher;
    const cipher: any = new TCipher();

    const TEvent: any = Event;
    const event: any = new TEvent();

    // view engine setup
    app.set('views', './views');
    app.set('view engine', 'pug');

    // result settings
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(cookieParser());

    // logs
    log4js.configure("./config/systems/logs.json");
    const logger: any = log4js.getLogger('request');

    if (config.status !== 'production') {
        app.use(morgan('original', {immediate: true}));
    } else {
        app.use(morgan('combined', {
            stream: rotatestream({
                file: __dirname + '/logs/access.log',
                size: '100k',
                keep: 3
            })
        }));
    }

    app.use(express.static('./public'));
    app.use('/scripts', express.static('./node_modules'));

    let definition = JSON.parse(fs.readFileSync('./models/systems/accounts/definition.json', 'utf-8'));

    // database
    const MongoStore = require('connect-mongo')(session);
    const options = {keepAlive: 1, connectTimeoutMS: 1000000, reconnectTries: 30, reconnectInterval: 2000, useNewUrlParser: true};
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

        let sessionMiddleware = session({
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
        });

        app.session = sessionMiddleware;
        app.use(sessionMiddleware);


        // passport
        app.use(passport.initialize());
        app.use(passport.session());
        // passport

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
        load_module("./server", config.plugin_modules);
        load_root_module("./server", config.root_modules);

        console.log("VR");

        // backup
        const TScheduler: any = Scheduler;
        const scheduler = new TScheduler();

        const TUnix: any = Unix;
        const command = new TUnix();

        if (config.db.backup) {
            scheduler.Add({
                timing: config.db.backup, name: "backup", job: () => {
                    command.Backup(config.db);
                }
            });
        }

        const LocalStrategy: any = LocalStrategyModule.Strategy;
        const FacebookStrategy: any = FacebookStrategyModule.Strategy;
        const TwitterStrategy: any = TwitterStrategyModule.Strategy;
        const InstagramStrategy: any = InstagramStrategyModule.Strategy;
        const LineStrategy: any = LineStrategyModule.Strategy;

        passport.use(new LocalStrategy(LocalAccount.authenticate()));

        passport.serializeUser((user: any, done): void => {
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
                    user.publickey = cipher.PublicKey(user.passphrase);
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

        // OAuth
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

        // passport

        const TAuth: any = Auth;
        const auth = new TAuth();

        auth.create_init_user(config.initusers);

        let server: any = Serve(config, app);

        let TIO:any = IO;
        let io = new TIO(server);

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
    // database

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

let Serve = (config: any, app: any): any => {
    //  let debug = require('debug')('a:server');

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
        //   debug('Listening on ' + bind);

        process.send = process.send || function () {
        };  // for pm2 cluster.
        process.send('ready');
    }


    let port = normalizePort(process.env.PORT || config.port);
    app.set('port', port);

    let server: any = null;

    if (config.ssl) {
        let ssl: { key: string, cert: string } = config.ssl;
        let http = require('spdy');
        server = http.createServer({
            key: fs.readFileSync(ssl.key),
            cert: fs.readFileSync(ssl.cert),
        }, app);
    } else {
        let http = require('http');
        server = http.createServer(app);
    }

    server.on('error', onError);
    server.on('listening', onListening);
    server.listen(port, '::0');

    console.log("V2");

    return server;
};

normal();
