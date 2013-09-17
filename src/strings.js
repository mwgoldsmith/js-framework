define([
    './core',
    './var/trim'
], function (mdsol, trim) {
    extend(mdsol, {
        alphaNumeric: function (value) {
            // Removes non alpha-numeric values from the specified string.
            return typeof value === 'string' ? value.replace(/\W/gi, '') : value;
        },

        trim: trim && !trim.call('\uFEFF\xA0') ?
            function (text) {
                return text === null ? '' : trim.call(text);
            } :
            function(text) {
                return text === null ? '' : (text + '')
                    .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            }
    });
});