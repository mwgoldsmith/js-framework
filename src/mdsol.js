// @DONE (2013-09-16 21:12)
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
    './core/ObjectArray',
    './ui/DialogBox',
    './ui/DialogPage',
    './ui/DialogSubpage',
    './ui/Dropdown',
    './ui/DropdownMenu',
    './ui/DropdownSelect',
    './ui/MessageBox',
    
    // Application-specific modules:
    './ajax/RequestMethod',
    './ajax/UpsertMethod',
    './schema/Field',
    './schema/Link',
    './schema/Table',
    './schema/TitleBar',
    './data/Clients',
    './data/Fields',
    './data/Products',
    './data/Sites',
    './data/Tables',
    './session',
    './toolbar'
], function (mdsol) {

    // Expose mdsol library
    return (window.mdsol = mdsol);
});