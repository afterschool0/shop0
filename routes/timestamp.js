/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
module.exports = exports = function lastModifiedPlugin(schema, options) {
    schema.add({ create: Date });
    schema.add({ modify: Date });
    schema.pre('init', function (next) {
        next();
    });
    schema.post('init', function (doc) {
    });
    schema.pre('validate', function (next) {
        next();
    });
    schema.post('validate', function (doc) {
    });
    schema.pre('save', function (next) {
        if (!this.create) {
            this.create = new Date;
        }
        this.modify = new Date;
        next();
    });
    schema.post('save', function (doc) {
    });
    //triggered at "findOneAndRemove" only.
    schema.pre('remove', function (next) {
        next();
    });
    schema.post('remove', function (doc) {
    });
    schema.pre('update', function () {
        this.update({}, { $set: { modify: new Date() } });
    });
    if (options) {
        if (options.index) {
            schema.path('create').index(options.index);
            schema.path('modify').index(options.index);
        }
    }
};
//# sourceMappingURL=timestamp.js.map