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
        './ui/DialogBox',
        './ui/DialogPage',
        './ui/DialogSubpage',
        './ui/Dropdown',
        './ui/DropdownMenu',
        './ui/DropdownSelect',
        './ui/MessageBox'
    ], function(mdsol) {

    // Expose mdsol, even in AMD and CommonJS for browser emulators
    return (window.mdsol = mdsol);
});