define(['lib/js/event-handler'], function(EH) {

    var social = {

        rate: {

            getPublicUrl: function(callback) {
                EH.safe(callback)('https://chrome.google.com/webstore/detail/' + chrome.runtime.id + '/reviews');
            }

        }

    };



    return social;

});
