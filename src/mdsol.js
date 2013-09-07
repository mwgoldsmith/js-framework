define([
        './core',
        './base64',
        './cookies',
        './json',
        './strings',
        './core/BitFlags',
        './core/Enum',
        './core/ObjectArray'//,
        //'./ajax/handler',
        //'./ajax/method',
        //'./ajax/requestmethod',
        //'./ajax/upsertmethod',
       // './exports/amd'
    ], function(mdsol) {

    // Expose mdsol, even in AMD and CommonJS for browser emulators
    return (window.mdsol = mdsol);
});