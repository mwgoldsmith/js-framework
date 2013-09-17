define([
        './core',
        './base64',
        './cookies',
        './json',
        './strings',
        './ajax',
        './core/BitFlags',
        './core/Enum',
        './core/Class',
        './core/ObjectArray'
    ], function(mdsol) {

    // Expose mdsol, even in AMD and CommonJS for browser emulators
    return (window.mdsol = mdsol);
});