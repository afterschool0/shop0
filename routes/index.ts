let express = require('express');
let router = express.Router();

const _config: any = require('config');
const mailer:any = require('nodemailer');

const config: any = _config.get("systems");

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DocSchema = new Schema({
    user: {
        email: String,
        name: String,
        address: String,
        tel: String,
        products: [String],
        introducer: String,
        message: String,
    },
    system:{}
});

const timestamp: any = require('./timestamp');

DocSchema.plugin(timestamp);

//DocSchema.index({"email": 1}, {unique: true});

const Doc = mongoose.model('Doc', DocSchema);


let connect_url = "mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name;
if (config.db.noauth) {
    connect_url = "mongodb://" + config.db.address + "/" + config.db.name;
}

mongoose.connect(connect_url, {useNewUrlParser:true}).catch(error => {});

// index

const send_mail = (content, callback) => {

    var mailsetting: any = config.mailer.setting;

    var smtp_user: any = mailer.createTransport(mailsetting); //SMTPの接続

    var result_mail: any = {
        from: config. mailer.account,
        to: content.thanks,
        bcc: config. mailer.account,
        subject: "Thanks!",
        html: ` 
                username  : ${content.username}
                street    : ${content.street}
                contacttel:  ${content.contacttel}
                introducer:  ${content.introducer}
                request   :  ${content.request}
        `
    };

    //var result_mail = {
    //    from: "saito@cocoro.jpn.com",
    //    to: body.email,
    //    bcc: "saito@cocoro.jpn.com",
    //    subject: "Thanks!",
    //    html: "Message"
    //};

    smtp_user.sendMail(result_mail, (error) => {
        callback(error);
        smtp_user.close();
    });

};

router.post('/api/contact', function (request, response, next) {

    let content = request.body.content;

    let products: string[] = [];

    if (content.products1) {
        products.push("cocoro");
    }

    if (content.products2) {
        products.push("cocoro2");
    }

    //conformity
    let postdata = new Doc({
        user: {
            email: content.thanks,
            name: content.username,
            address: content.street,
            tel: content.contacttel,
            products: products,
            introducer: content.introducer,
            message: content.request
        },
        system:{
            status:"new"
        }
    });

    postdata.save().then((saved_doc) => {
        send_mail(content, (error) => {
            if (!error) {
                response.json({code: 0, value: content});
            } else {
                response.json({code: error.code, value: {}});
            }
        });
    }).catch(error => {
        response.json({code: error, value: {}});
    })

});


router.get('/api/contact/:email', function (request, response, next) {

    var email = decodeURIComponent(request.params.email);

    Doc.find({email: email}).then(function (doc) {
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

    Doc.findOneAndUpdate({email: email}, {$set: {value: value}}).then(function (updated_doc) {
        response.json(updated_doc);
    })

});

router.delete('/api/contact/:email', function (request, response, next) {

    var email = decodeURIComponent(request.params.email);

    Doc.findOneAndRemove({email: email}).then(function () {
        response.json({});
    })

});

module.exports = router;