define([
        './core'//,
        //'./ajax',
        //'./ajax/handler',
        //'./ajax/method',
        //'./ajax/requestmethod',
        //'./ajax/upsertmethod',
       // './exports/amd'
    ], function(mdsol) {

    // Expose mdsol, even in AMD and CommonJS for browser emulators
    return (window.mdsol = mdsol);

});