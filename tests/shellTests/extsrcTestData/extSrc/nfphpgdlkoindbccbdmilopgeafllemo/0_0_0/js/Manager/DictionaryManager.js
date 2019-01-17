(function ($) {
    $.fn.dc_dropdown = function (options) {
        var defaults = {
            onChange: function (event, object) { }
        };

        var update = function (ddl) {
            var selectedId = ddl.find('div.selected').data('id');

            ddl.find('li').each(function () {
                var item = $(this);

                if (item.data('id') == selectedId)
                    item.addClass("current");
                else
                    item.removeClass("current");
                
                item.show();
            });
        };

        if (typeof options == "object") {
            var settings = $.extend({}, defaults, options);

            var collapse = function (ddl) {
                ddl.find('ul').hide();
                $(window).off('click.' + ddl.attr('id'));
                $(window).off('touchstart.' + ddl.attr('id'));
            };

            this.each(function () {
                var ddl = $(this);
                var ul = ddl.find('ul').hide();

                ddl.find('li').each(function () {
                    var item = $(this);

                    item.on('click touchstart', function(e) {
                        collapse(ddl);
                        var itemId = item.data('id');
                        ddl.find('div.selected').html(item.html()).data('id', itemId).data('lang', item.data('lang'));
                        if (ddl.find('div.selected').children(".newDictionary").length > 0) {
                            ddl.find('div.selected').children(".newDictionary").remove();
                        }
                        update(ddl);
                        settings.onChange.call(this, itemId);
                        return false;
                    });
                });

                update(ddl);

                ddl.find('div.selected').on('click', function () {
                    if (ul.is(":visible")) {
                        collapse(ddl);
                    }
                    else {
                        ul.show();

                        $(window).on('click.' + ddl.attr('id'), function (e) {
                            collapse(ddl);
                        });
                        $(window).on('touchstart.' + ddl.attr('id'), function (e) {
                            collapse(ddl);
                        });
                        
                    }

                    return false;
                });

                ddl.show();
            });

            return this;
        }
        else {
            if (options == 'getvalue') {
                return this.first().find('div.selected').data('id');
            }
            else if (options == 'getlang') {
                return this.first().find('div.selected').data('lang');
            }
            else if(options == 'setvalue') {
                var id = Array.prototype.slice.call( arguments, 1 );

                var ddl = this.first();
                var item =  ddl.find('li').filter(function( index ) {
                    return $(this).data('id') == id;
                });

                if(item && item.length > 0) {
                    var itemId = item.data('id');
                    ddl.find('div.selected').html(item.html()).data('id', itemId).data('lang', item.data('lang'));
                    update(ddl);
                }                
            }
        }
    };
}(jQuery));

var dictionaryPlayer = new Player();

function WebReader() {
    this.showInflections = true;
    
    this.webReaderRead = function (Text, TYPE) {
        var language = TYPE === 1 ? $('div#itw_ddlDictionary').dc_dropdown('getlang').lang1 : TYPE === 2?  $('div#itw_ddlDictionary').dc_dropdown('getlang').lang2:TYPE;
        Text = Text.replace("’", "'");
        ClientManager.getInstance().dictionarySpeach.speak(language, Text, function (result) {
            if (!!result) {               
                dictionaryPlayer.play( { ogg_url: result } );
            }
        });
        
    };
    this.webReaderStop = function () {
        dictionaryPlayer.stop();
    };
    this.webReaderChange = function (TYPE) {
        switch (TYPE) {
            case 1: this.showInflections = !this.showInflections;
                break;
            default:
        }
    };
};

var webReader = new WebReader();