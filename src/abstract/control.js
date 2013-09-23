define([
    '../core',
    '../core/Class',
    './options'
], function (mdsol) {
    mdsol.Class.namespace('mdsol.abstract', {
        control: (function() {
            function enable() {
                this.options('enabled', true);
            }

            function disable() {
                this.options('enabled', false);
            }

            function show() {
                this.options('visible', true);
            }

            function hide() {
                this.options('visible', false);
            }

            return mdsol.Class.implement('options', {
                enable: enable,

                disable: disable,

                show: show,

                hide: hide
            });
        }())
    });
});
