(function(window, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Expose a mdsol-making factory as module.exports in loaders that implement the Node
        // module pattern (including browserify).
        // This accentuates the need for a real window in the environment
        // e.g. var mdsol = require('mdsol')(window);
        module.exports = function(w) {
            w = w || window;
            if (!w.document) {
                throw new Error('mdsol requires a window with a document');
            }
            return factory(w);
        };
    } else {
        // Execute the factory to produce mdsol
        var mdsol = factory(window);

        // Register as a named AMD module, since mdsol can be concatenated with other
        // files that may use define, but not via a proper concatenation script that
        // understands anonymous AMD modules. A named AMD is safest and most robust
        // way to register. Lowercase mdsol is used because AMD module names are
        // derived from file names, and mdsol is normally delivered in a lowercase
        // file name. Do this after creating the global so that if an AMD module wants
        // to call noConflict to hide this version of mdsol, it will work.
        if (typeof define === 'function' && define.amd) {
            define('mdsol', [], function() {
                return mdsol;
            });
        }
    }

    // Pass this, window may not be defined yet
}(this, function(window) {
