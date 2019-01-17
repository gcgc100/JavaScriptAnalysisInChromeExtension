ko.bindingHandlers.jqSlider = {
    isUpdating: true,

    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {

        var options = allBindingsAccessor().jqOptions || {};
        options.max = ko.utils.unwrapObservable(valueAccessor().maxValue());
        options.min = ko.utils.unwrapObservable(valueAccessor().minValue());
        options.slide = function (event, ui) {
            var observable = valueAccessor().value;
            observable(ui.value);
        };
        $(element).slider(options);
    },

    //handle the model value changing
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        ko.bindingHandlers.jqSlider.isUpdating = true;
        var value = ko.utils.unwrapObservable(valueAccessor().value());
        var minValue = ko.utils.unwrapObservable(valueAccessor().minValue());
        var maxValue = ko.utils.unwrapObservable(valueAccessor().maxValue());
        var min = $(element).slider("option", "min");
        var max = $(element).slider("option", "max");
        if (min != minValue) {
            $(element).slider("option", "min", minValue);
        }
        if (max != maxValue) {
            $(element).slider("option", "max", maxValue);
        }
        $(element).slider("value", value);
        ko.bindingHandlers.jqSlider.isUpdating = false;
    }
};

ko.bindingHandlers.slideVisible = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var options = allBindingsAccessor().jqOptions || {};
    },

    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);

        var duration = allBindings.duration || 300;
        if (valueUnwrapped == true)
            $(element).slideDown(duration);
        else
            $(element).slideUp(duration);
    }
};

ko.bindingHandlers.slideAnimation = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var stopId = ko.utils.unwrapObservable(valueAccessor().stopElementId);
        var orientation = ko.utils.unwrapObservable(valueAccessor().orientation) || 'vertical';
        if (orientation === 'vertical') {
            $(element).hide();
        }

        $(document).click(function (e) {
            var visibility = ko.utils.unwrapObservable(valueAccessor().visibility) || false;
            if (visibility) {
                if (!e) var e = window.event;
                var tg = (window.event) ? e.srcElement : e.target;
                while (tg.id != stopId && tg.nodeName != 'BODY')
                    tg = tg.parentNode
                if (tg.id == stopId) return;
                valueAccessor().visibility(false);
            }
        });
    },

    update: function (element, valueAccessor, allBindingsAccessor) {
        var slideAnimationObject = valueAccessor();
        var visibility = ko.utils.unwrapObservable(slideAnimationObject.visibility) || false;
        var orientation = ko.utils.unwrapObservable(slideAnimationObject.orientation) || 'vertical';
        var duration = ko.utils.unwrapObservable(slideAnimationObject.duration) || 300;

        if (orientation === 'vertical') {
            if (visibility)
                $(element).slideDown(duration);
            else
                $(element).slideUp(duration);
        }
        else {
            if (orientation === 'horizontal') {
                var newWidth = ko.utils.unwrapObservable(slideAnimationObject.width) || '';
                if (visibility) {
                    $(element).animate({ width: newWidth }, duration, function () { $(this).css('overflow', 'visible'); });
                }
                else {
                    $(element).animate({ width: 0 }, duration, function () { $(this).css('overflow', 'hidden'); });
                }
            }
        }
    }
};

ko.bindingHandlers.dialog = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var options = ko.utils.unwrapObservable(valueAccessor()) || {};
        //do in a setTimeout, so the applyBindings doesn't bind twice from element being copied and moved to bottom
        setTimeout(function () {
            options.close = function () {
                allBindingsAccessor().dialogVisible(false);
            };
            $(element).dialog(options);

            var $el = $(element),
                dialog = $el.data("uiDialog") || $el.data("dialog") || $el.data("ui-dialog");

            $(element).dialog('option', 'open', function(){
                $('.ui-widget-overlay').removeClass().addClass('itw_ui_widget_overlay');
                dialog.uiDialog
                    .css({ position: 'fixed' })
                    .position({ my: 'center', at: 'center', of: window });
            });

            if(dialog) {
                dialog.uiDialogTitlebar.append('<div class="itw_dialog_logo"></div>');
                dialog.uiDialogTitlebar.append('<div class="itw_dialog_logoName"></div>');
                dialog.uiDialog.removeClass().addClass('itw_ui_dialog');
                dialog.uiDialogTitlebar.removeClass().addClass('itw_ui_dialog_titlebar').addClass('ui-helper-clearfix');    
                dialog.uiDialogTitlebar.find('.ui-dialog-title').removeClass().addClass('itw_ui_dialog_title');
                dialog.uiDialogTitlebar.find('.ui-dialog-titlebar-close').removeClass().addClass('itw_ui_dialog_titlebar_close').empty();
                dialog.uiDialog.find('.ui-dialog-content').removeClass('ui-dialog-content').removeClass('ui-widget-content').addClass('itw_ui_dialog_content');
                dialog.uiDialogButtonPane.removeClass().addClass('itw_ui_dialog_buttonpane').addClass('itw_ui_helper_clearfix');
                dialog.uiDialogButtonPane.find('.ui-dialog-buttonset').removeClass().addClass('itw_ui_dialog_buttonset');
                
                if(dialog.uiDialogButtonPane.find('button').length <= 0) {
                    dialog.uiDialog.find('.itw_ui_dialog_content').addClass('itw_no_button_pane');
                }
            }
        }, 0);
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).dialog("destroy");
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var shouldBeOpen = ko.utils.unwrapObservable(allBindingsAccessor().dialogVisible);
        var customText = ko.utils.unwrapObservable(allBindingsAccessor().dialog.customText);
        var title = ko.utils.unwrapObservable(allBindingsAccessor().dialog.customTitle);
        var closeTitle = ko.utils.unwrapObservable(allBindingsAccessor().dialog.customCloseTitle);
        var isButtonsInCenter = ko.utils.unwrapObservable(allBindingsAccessor().dialog.buttonInCenter);
        var onTextHoverCallback = ko.utils.unwrapObservable(allBindingsAccessor().dialog.onTextHoverCallback);
        if (customText) {
            $(element).html(customText);
        }
        if(isButtonsInCenter && $(element).parent().find('.ui-dialog-buttonset')){
            var el = $(element).parent().find('.ui-dialog-buttonset');
            el.css('float','none');
            el.css('text-align','center');
        }
        var $el = $(element),
            dialog = $el.data("uiDialog") || $el.data("dialog") || $el.data("ui-dialog");

        //don't call open/close before initilization
        if (dialog) {
            if(title) dialog.uiDialogTitlebar.find('.itw_ui_dialog_title').text(title);
            if(closeTitle) {
                $el.dialog('option', 'closeText', closeTitle);
                dialog.uiDialogTitlebar.find('.itw_ui_dialog_titlebar_close').empty();
            }
            if(onTextHoverCallback) {
                dialog.uiDialogTitlebar.find('span.itw_ui_dialog_title').off('mouseover').on('mouseover', onTextHoverCallback);
                dialog.uiDialog.find('.itw_ui_dialog_content').off('mouseover').on('mouseover', onTextHoverCallback);
            }
            $el.dialog(shouldBeOpen ? "open" : "close");
        }  
    }
};