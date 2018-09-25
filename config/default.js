module.exports = {
    "systems": {
        "status": "debug",
        "port": 3000,
        "domain": "localhost:3000",
        "protocol": "http",
        "cache1": "max-age=86400",
        "cache": "no-cache",
        "timeout": 100000,
        "ua": "shop0",
        "use_publickey": true,
        "dav": false,
        "db": {
            "address": "localhost",
            "user": "webshopmaster",
            "password": "Nipp0nbashi7",
            "name": "shop0"
        },
        "regist": {
            "user": true,
            "member": true,
            "expire": 60
        },
        "sessionname": "shop0",
        "sessionsecret": "Daisy, Daisy.",
        "tokensecret": "Yes We therefore I think we",
        "key2": "Man is a thinking reed",
        "systems": {
            "namespace": "system",
            "groupid": "000000000000000000000001",
            "userid": "000000000000000000000000"
        },
        "mount_path":"front",
        "root_modules": [
            {
                "type": "required",
                "path": "/applications/",
                "name": "front",
                "description": {
                    "display": "Front"
                }
            }
        ],
        "initusers": [
            {
                "type": "System",
                "auth": 1,
                "groupid": "000000000000000000000000",
                "userid": "000000000000000000000000",
                "username": "oda.mikio@gmail.com",
                "displayName": "system",
                "password": "mitana"
            }

        ],

        "facebook": {
            "enable": "true",
            "redirect": "/",
            "key": {
                "clientID": "1091756834285901",
                "clientSecret": "f26703b087f2c5c3e8c8c4e7fa335793",
                "callbackURL": "https://seventh-code.com/auth/facebook/callback"
            },
            "accessToken": "CAAX0exl8Gm0BANQZBHAViGEMngUZCnqyJfhoxTUBZBAD71UzjF6fx4M2yJ5MAe3Dtq8nfsN5qtqLlZAPdJ5g9SZBJQAvNIF8h0ajhaF3IuYOEkxGuxttwApPOCZAo9qIS6e2c7W40UuuVd6JZBBkFopND5ch8kEZA3SB1jqh5janNWffg8Lf2MOzqqcys1cAE2OaMV8CeWOgUcV9tZB8EsIUj"
        },
        "twitter": {
            "enable": "true",
            "redirect": "/",
            "key": {
                "consumerKey": "3rebUktAh65RuqWkCxlBUAOOq",
                "consumerSecret": "SCTtHHlvGEWUBM6rQiqT8JqxuezGT7kudF3D30XbF09JkIHOir",
                "callbackURL": "https://seventh-code.com/auth/twitter/callback"
            }
        },
        "instagram1": {
            "enable": "false",
            "redirect": "/",
            "key": {
                "clientID": "986729ad287241d08ff7616e8d3adc73",
                "clientSecret": "69e57e2fad5541599725be4c9e95b2b9",
                "callbackURL": "https://seventh-code.com/auth/instagram/callback"
            }
        },
        "line": {
            "enable": "true",
            "redirect": "/",
            "key": {
                "channelID": "1504885300",
                "channelSecret": "2ac60f3d920006fa5e985f5f133ec96d",
                "callbackURL": "https://seventh-code.com/auth/line/callback"
            }
        },
        "googleplus1": {
            "enable": "false",
            "redirect": "/",
            "key": {
                "clientId": "1029972682852-3eemd2k01fsvjcabsdkhotsd3ptg8ljh.apps.googleusercontent.com",
                "apiKey": "K202stOY6pHTW2Poe_q2SyS9",
                "callbackURL": "https://seventh-code.com/auth/googleplus/callback"
            }
        },

        "mailer": {
            "type": "mail",
            "account": "saito@cocoro.jpn.com",
            "setting": {
                host: "smtp20.gmoserver.jp",
                port: "587",
                auth: {
                    user: "info@seventh-code.com",
                    pass: "P#aZX44O"
                }
            }
        },
        "message": {
            "cancel": "Cancel",
            "invalid_mail_format": "invalid mail format",
            "login": "Login",
            "logindialogtitle": "Login",
            "logout": "Logout",
            "long": "too long",
            "mail_field": "Mail Address",
            "mail": "Mail",
            "memberconfirmdialogtitle": "Member Register Mail Sent",
            "memberconfirmtext": "Add Member",
            "memberdialogtitle": "Member Regist",
            "nickname_field": "Nickname",
            "nickname": "Nickname",
            "ok": "OK",
            "password_field": "Password",
            "password_missmatch": "password missmatch",
            "password": "Password",
            "passwordconfirmdialogtitle": "Update Password Mail Sent.",
            "passwordconfirmtext": "Update Password Mail Sent.",
            "passworddialogtitle": "Password Change",
            "regist": "Regist",
            "registconfirmdialogtitle": "User Register Mail Sent.",
            "registconfirmtext": "User Register Mail Sent.",
            "registdialogtitle": "User Regist",
            "required": "Required",
            "retypepassword": "Retype Password",
            "short": "Too Short",
            "wrongusername": "Wrong Username",
            "usernamealreadyregist": "username Already Exist",
            "usernamenotfound":"username Not Found"
        }
    }
};