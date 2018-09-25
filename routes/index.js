var express = require('express');
var router = express.Router();
var _config = require('config');
var mailer = require('nodemailer');
var config = _config.get("systems");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var DocSchema = new Schema({
    user: {
        email: String,
        name: String,
        address: String,
        tel: String,
        products: [String],
        introducer: String,
        message: String,
    },
    system: {}
});
var timestamp = require('./timestamp');
DocSchema.plugin(timestamp);
//DocSchema.index({"email": 1}, {unique: true});
var Doc = mongoose.model('Doc', DocSchema);
var connect_url = "mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name;
if (config.db.noauth) {
    connect_url = "mongodb://" + config.db.address + "/" + config.db.name;
}
mongoose.connect(connect_url, { useNewUrlParser: true }).catch(function (error) { });
// index
var send_mail = function (content, callback) {
    var mailsetting = config.mailer.setting;
    var smtp_user = mailer.createTransport(mailsetting); //SMTPの接続
    var result_mail = {
        from: config.mailer.account,
        to: content.thanks,
        bcc: config.mailer.account,
        subject: "Thanks!",
        html: " \n                username  : " + content.username + "\n                street    : " + content.street + "\n                contacttel:  " + content.contacttel + "\n                introducer:  " + content.introducer + "\n                request   :  " + content.request + "\n        "
    };
    //var result_mail = {
    //    from: "saito@cocoro.jpn.com",
    //    to: body.email,
    //    bcc: "saito@cocoro.jpn.com",
    //    subject: "Thanks!",
    //    html: "Message"
    //};
    smtp_user.sendMail(result_mail, function (error) {
        callback(error);
        smtp_user.close();
    });
};
router.post('/api/contact', function (request, response, next) {
    var content = request.body.content;
    var products = [];
    if (content.products1) {
        products.push("cocoro");
    }
    if (content.products2) {
        products.push("cocoro2");
    }
    //conformity
    var postdata = new Doc({
        user: {
            email: content.thanks,
            name: content.username,
            address: content.street,
            tel: content.contacttel,
            products: products,
            introducer: content.introducer,
            message: content.request
        },
        system: {
            status: "new"
        }
    });
    postdata.save().then(function (saved_doc) {
        send_mail(content, function (error) {
            if (!error) {
                response.json({ code: 0, value: content });
            }
            else {
                response.json({ code: error.code, value: {} });
            }
        });
    }).catch(function (error) {
        response.json({ code: error, value: {} });
    });
});
router.get('/api/contact/:email', function (request, response, next) {
    var email = decodeURIComponent(request.params.email);
    Doc.find({ email: email }).then(function (doc) {
        response.json(doc);
    });
});
router.get('/api/query', function (request, response, next) {
    Doc.find({}).then(function (docs) {
        response.json(docs);
    });
});
router.put('/api/contact/:email', function (request, response, next) {
    var email = decodeURIComponent(request.params.email);
    var value = request.params.value;
    Doc.findOneAndUpdate({ email: email }, { $set: { value: value } }).then(function (updated_doc) {
        response.json(updated_doc);
    });
});
router.delete('/api/contact/:email', function (request, response, next) {
    var email = decodeURIComponent(request.params.email);
    Doc.findOneAndRemove({ email: email }).then(function () {
        response.json({});
    });
});
module.exports = router;
//# sourceMappingURL=index.js.map