/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//require('sqreen');
var express = require("express");
var fs = require("graceful-fs");
var morgan = require("morgan");
var mongoose = require("mongoose");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var session = require("express-session");
var log4js = require("log4js");
var rotatestream = require("logrotate-stream");
var _config = require("config");
var LocalStrategyModule = require("passport-local");
var FacebookStrategyModule = require("passport-facebook");
var TwitterStrategyModule = require("passport-twitter");
var InstagramStrategyModule = require("passport-instagram");
var LineStrategyModule = require("passport-line");
var Scheduler = require("./server/systems/common/scheduler");
var Unix = require("./server/systems/common/commandar");
var Cipher = require("./server/systems/common/cipher");
var Event = require("./server/systems/common/event");
var IO = require("./server/systems/common/sio");
var LocalAccount = require("./models/systems/accounts/account");
var Auth = require("./server/systems/auth/controllers/auth_controller");
var normal = function () {
    morgan.format("original", "[:date] :method :url :status :response-time ms");
    mongoose.Promise = global.Promise;
    console.log("LC_CTYPE : " + process.env.LC_CTYPE);
    console.log("PWD      : " + process.env.PWD);
    console.log("HOME     : " + process.env.HOME);
    console.log("Hundred.");
    var app = express();
    // helmet
    app.use(helmet());
    app.use(helmet.hidePoweredBy({ setTo: "JSF/1.2" })); // impersonation
    var config = _config.get("systems");
    //const config: any = require('config').get("systems");
    var TCipher = Cipher;
    var cipher = new TCipher();
    var TEvent = Event;
    var event = new TEvent();
    // view engine setup
    app.set('views', './views');
    app.set('view engine', 'pug');
    // result settings
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(cookieParser());
    // logs
    log4js.configure("./config/systems/logs.json");
    var logger = log4js.getLogger('request');
    if (config.status !== 'production') {
        app.use(morgan('original', { immediate: true }));
    }
    else {
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
    var definition = JSON.parse(fs.readFileSync('./models/systems/accounts/definition.json', 'utf-8'));
    // database
    var MongoStore = require('connect-mongo')(session);
    var options = { keepAlive: 1, connectTimeoutMS: 1000000, reconnectTries: 30, reconnectInterval: 2000, useNewUrlParser: true };
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
        var sessionMiddleware = session({
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
        // backup
        var TScheduler = Scheduler;
        var scheduler = new TScheduler();
        var TUnix = Unix;
        var command = new TUnix();
        if (config.db.backup) {
            scheduler.Add({
                timing: config.db.backup, name: "backup", job: function () {
                    command.Backup(config.db);
                }
            });
        }
        var LocalStrategy = LocalStrategyModule.Strategy;
        var FacebookStrategy = FacebookStrategyModule.Strategy;
        var TwitterStrategy = TwitterStrategyModule.Strategy;
        var InstagramStrategy = InstagramStrategyModule.Strategy;
        var LineStrategy = LineStrategyModule.Strategy;
        passport.use(new LocalStrategy(LocalAccount.authenticate()));
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
                    user.publickey = cipher.PublicKey(user.passphrase);
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
        // OAuth
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
        // passport
        var TAuth = Auth;
        var auth = new TAuth();
        auth.create_init_user(config.initusers);
        var server = Serve(config, app);
        var TIO = IO;
        var io = new TIO(server);
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
    //  let debug = require('debug')('a:server');
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
        //   debug('Listening on ' + bind);
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
//# sourceMappingURL=app.js.map