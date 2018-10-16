/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */
"use strict";
var App;
(function (App) {
    var fs = require("graceful-fs");
    var path = require("path");
    var express = require("express");
    var normal = function () {
        // initialize
        var morgan = require("morgan");
        morgan.format("original", "[:date] :method :url :status :response-time ms");
        var _ = require("lodash");
        var mongoose = require("mongoose");
        mongoose.Promise = global.Promise;
        var favicon = require("serve-favicon");
        var cookieParser = require("cookie-parser");
        var bodyParser = require("body-parser");
        // passport
        var passport = require("passport");
        var LocalStrategy = require("passport-local").Strategy;
        var FacebookStrategy = require("passport-facebook").Strategy;
        var TwitterStrategy = require("passport-twitter").Strategy;
        var InstagramStrategy = require("passport-instagram").Strategy;
        var LineStrategy = require("passport-line").Strategy;
        // const GooglePlusStrategy: any = require('passport-google-plus');
        // passport
        console.log("LC_CTYPE : " + process.env.LC_CTYPE);
        console.log("PWD      : " + process.env.PWD);
        console.log("HOME     : " + process.env.HOME);
        console.log("Hundred.");
        var app = express();
        // helmet
        var helmet = require("helmet");
        app.use(helmet());
        app.use(helmet.hidePoweredBy({ setTo: "JSF/1.2" })); // impersonation
        // const _config: any = require('config');
        // const config: any = _config.get("systems");
        var config = require('config').get("systems");
        var CipherModule = require(path.join(process.cwd(), "server/systems/common/cipher"));
        var Cipher = CipherModule.Cipher;
        var EventModule = require(path.join(process.cwd(), "server/systems/common/event"));
        var event = new EventModule.Event();
        // passport
        var session = require("express-session");
        if (config.csrfsecret) {
            var csrf = require("csurf");
            app.use(session({ secret: config.csrfsecret }));
            app.use(csrf({ cookie: true }));
            app.use(function (req, res, next) {
                res.locals.csrftoken = req.csrfToken();
                next();
            });
        }
        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        // view engine setup
        // result settings
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        app.use(cookieParser());
        // result settings
        //const logger = share.logger;
        var log4js = require('log4js');
        log4js.configure(path.join(process.cwd(), "config/systems/logs.json"));
        var logger = log4js.getLogger('request');
        if (config.status !== 'production') {
            app.use(morgan('original', { immediate: true }));
        }
        else {
            var rotatestream = require('logrotate-stream');
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
        var definition = { account_content: {} };
        //       fs.open(share.Models('systems/accounts/definition.json'), 'ax+', 384, (error, fd) => {
        //          if (!error) {
        //              fs.close(fd, (error) => {
        definition = JSON.parse(fs.readFileSync(path.join(__dirname, 'models/systems/accounts/definition.json'), 'utf-8'));
        //            });
        //      }
        //});
        var MongoStore = require('connect-mongo')(session);
        var options = { keepAlive: 1, connectTimeoutMS: 1000000, reconnectTries: 30, reconnectInterval: 2000, useNewUrlParser: true };
        // const options = {keepAlive: 300000, connectTimeoutMS: 1000000};
        var connect_url = "mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name;
        if (config.db.noauth) {
            connect_url = "mongodb://" + config.db.address + "/" + config.db.name;
        }
        mongoose.connect(connect_url, options)
            .catch(function (error) {
            console.log('catch Mongoose exeption. ');
            logger.fatal('catch Mongoose exeption. ', error.stack);
            process.exit(1);
        });
        // database
        mongoose.connection.once('open', function () {
            mongoose.connection.on('connected', function () {
                logger.fatal('connected');
            });
            mongoose.connection.on('disconnected', function () {
                console.log('Mongoose default connection disconnected');
                logger.fatal('Mongoose default connection disconnected');
                process.exit(1);
            });
            mongoose.connection.on('reconnected', function () {
                logger.fatal('reconnected');
            });
            mongoose.connection.on('error', function (error) {
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
            var load_root_module = function (root, modules) {
                if (modules) {
                    modules.forEach(function (module) {
                        var path = root + module.path;
                        var name = module.name;
                        app.use("/", require(path + name + "/api"));
                        app.use("/", require(path + name + "/pages"));
                    });
                }
            };
            var load_module = function (root, modules) {
                if (modules) {
                    modules.forEach(function (module) {
                        var path = root + module.path;
                        var name = module.name;
                        app.use("/" + name, require(path + name + "/api"));
                        app.use("/" + name, require(path + name + "/pages"));
                    });
                }
            };
            console.log("V1");
            var modules = [
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
            // root
            // backup
            var SchedulerModule = require(path.join(process.cwd(), "server/systems/common/scheduler"));
            var Scheduler = new SchedulerModule.Scheduler();
            var Commandar = require(path.join(process.cwd(), "server/systems/common/commandar"));
            var Command = new Commandar.Unix();
            if (config.db.backup) {
                Scheduler.Add({
                    timing: config.db.backup, name: "backup", job: function () {
                        Command.Backup(config.db);
                    }
                });
            }
            // backup
            // passport
            var Account = require(path.join(process.cwd(), "models/systems/accounts/account"));
            passport.use(new LocalStrategy(Account.authenticate()));
            passport.serializeUser(function (user, done) {
                switch (user.provider) {
                    case "facebook":
                    case "twitter":
                    case "instagram":
                    case "googleplus":
                    case "line":
                        var objectid = new mongoose.Types.ObjectId; // Create new id
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
            passport.deserializeUser(function (obj, done) {
                done(null, obj);
            });
            if (config.facebook) {
                passport.use(new FacebookStrategy(config.facebook.key, function (accessToken, refreshToken, profile, done) {
                    process.nextTick(function () {
                        done(null, profile);
                    });
                }));
            }
            if (config.twitter) {
                passport.use(new TwitterStrategy(config.twitter.key, function (accessToken, refreshToken, profile, done) {
                    process.nextTick(function () {
                        done(null, profile);
                    });
                }));
            }
            if (config.instagram) {
                passport.use(new InstagramStrategy(config.instagram.key, function (accessToken, refreshToken, profile, done) {
                    process.nextTick(function () {
                        done(null, profile);
                    });
                }));
            }
            if (config.line) {
                passport.use(new LineStrategy(config.line.key, function (accessToken, refreshToken, profile, done) {
                    process.nextTick(function () {
                        done(null, profile);
                    });
                }));
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
            var AuthController = require(path.join(process.cwd(), "server/systems/auth/controllers/auth_controller"));
            var auth = new AuthController.Auth();
            auth.create_init_user(config.initusers);
            var server = Serve(config, app);
            var Socket = require('./server/systems/common/sio');
            var io = new Socket.IO(server);
            io.wait(config, event);
            // error handlers
            app.use(function (req, res, next) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            });
            if (app.get('env') === 'development') {
                app.use(function (err, req, res, next) {
                    res.status(err.status || 500);
                    res.render('error', {
                        message: err.message,
                        status: err.status
                    });
                });
            }
            app.use(function (err, req, res, next) {
                if (req.xhr) {
                    res.status(500).send(err);
                }
                else {
                    res.status(err.status || 500);
                    res.render('error', {
                        message: err.message,
                        error: {}
                    });
                }
            });
        });
        // database
        event.emitter.on('socket', function (data) {
        });
        event.emitter.on('mail', function (mail) {
        });
        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                logger.info('Stop by SIGINT.');
                process.exit(0);
            });
        });
        process.on('message', function (msg) {
            if (msg == 'shutdown') {
                logger.info('Stop by shutdown.');
                setTimeout(function () {
                    process.exit(0);
                }, 1500);
            }
        });
    };
    var Serve = function (config, app) {
        var debug = require('debug')('a:server');
        function normalizePort(val) {
            var port = parseInt(val, 10);
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
            var bind = typeof port === 'string'
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
            var addr = server.address();
            var bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            debug('Listening on ' + bind);
            process.send = process.send || function () {
            }; // for pm2 cluster.
            process.send('ready');
        }
        var port = normalizePort(process.env.PORT || config.port);
        app.set('port', port);
        var server = null;
        if (config.ssl) {
            var ssl = config.ssl;
            var http = require('spdy');
            server = http.createServer({
                key: fs.readFileSync(ssl.key),
                cert: fs.readFileSync(ssl.cert),
            }, app);
        }
        else {
            var http = require('http');
            server = http.createServer(app);
        }
        server.on('error', onError);
        server.on('listening', onListening);
        server.listen(port, '::0');
        console.log("V2");
        return server;
    };
    normal();
})(App || (App = {}));
//# sourceMappingURL=app.js.map