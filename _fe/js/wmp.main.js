/*

    wm-profile
    VERSION 0.0.1
    AUTHOR Mozilla

    DEPENDENCIES:

    - All

    TODO:

    -

*/

WMP = window.WMP || {};

WMP.main = {
    init: function () {
        var self = this;

        $('body').append(WMP.templates.header({
            name: 'Gvn Suntop'
        }));

        $('body').append(WMP.templates.stats({
            thimbleMakes: 12,
            popcornMakes: 3
        }));
    }
};
