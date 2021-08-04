define(['lib/js/event-handler', 'json!manifest.json'], function(EH, manifest) {

    var REQUIRED_PERMISSIONS = {
        permissions: [ 'bookmarks', 'tabs' ],
        origins: []
    };

    var queryUrl = manifest.externally_connectable ? manifest.externally_connectable.matches : null;


    var makeNode = function(tree) {
        var isDir = tree.children && typeof tree.children === 'object';

        return {
            is_root:   false,
            is_dir:    isDir,

            id:        tree.id,
            index:     tree.index,
            title:     tree.title,
            parent_id: tree.parentId,
            children:  [],
            url:       isDir ? null : tree.url,
            icon:      isDir ? null : 'https://www.google.com/s2/favicons?domain=' + tree.url
        };
    };


    var parseTree = function(tree, isRoot) {
        var isDir = tree.children && typeof tree.children === 'object';



        var result = makeNode(tree);
        result.is_root = isRoot || false;

        if(isDir) {
            for(var i = 0; i < tree.children.length; ++i){
                if(tree.children[i].url && tree.children[i].url.match(/^chrome:/i))
                    continue;
                result.children.push(parseTree(tree.children[i]));
            }
        }

        return result;
    };



    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if(request.module !== 'bookmarks') {
            return;
        }

        if(request.action === 'permissions') {
            chrome.permissions.contains(REQUIRED_PERMISSIONS, function(result){
                if(!result) {
                    responses = {
                        error: false,
                        response: false
                    };
                    sendResponse(responses);
                }else {
                    responses = {
                        error: false,
                        response: true
                    };
                    sendResponse(responses);
                }

            });
            return true;
        }

        if(request.action === 'getall') {
            bookmarks.getAll(sendResponse);
            return true;
        }

        if(request.action === 'checkUi') {
            sendResponse(true);
            return true;
        }
        if(request.action === 'openPage') {
            chrome.tabs.create({url : 'chrome://bookmarks'}, function(tab) { });
            return true;
        }

        if(request.action === 'request') {
           chrome.permissions.request(REQUIRED_PERMISSIONS, function(granted) {
                if(!granted) {
                    responses = {
                        error: false,
                        response: false
                    };
                    sendResponse(responses);
                } else {
                    responses = {
                        error: false,
                        response: true
                    };
                    sendResponse(responses);
                }

            });
            return true;
        }

    });

    var bookmarks = {


        getAll: function(callback) {
            chrome.bookmarks.getTree(function(trees) {
                if(chrome.runtime.lastError) {
                    EH.safe(callback)(chrome.runtime.lastError.message);
                    return;
                }
                var roots = [];

                for(var i = 0; i < trees[0].children.length; i++)
                    roots.push(parseTree(trees[0].children[i], true));

                EH.safe(callback)(roots);
            });

        },

        onChange: EH()

    };




    var Update = function() {
        if(!queryUrl)
            return;

        chrome.tabs.query({url: queryUrl}, function(tabs) {

            if(tabs.length === 0)
                return;

            for(var i = 0; i < tabs.length; i++)
                chrome.tabs.sendMessage(tabs[i].id, {
                    module: 'bookmarks-handler',
                    update: true
                }, function() {});
        });

    };

    var updateEvents = function() {
        chrome.permissions.contains(REQUIRED_PERMISSIONS, function(result) {
            if (!result) {
                return;
            }
            if(!chrome.bookmarks.onCreated.hasListener(Update))
                chrome.bookmarks.onCreated.addListener(Update);

            if(!chrome.bookmarks.onRemoved.hasListener(Update))
                chrome.bookmarks.onRemoved.addListener(Update);

            if(!chrome.bookmarks.onChanged.hasListener(Update))
                chrome.bookmarks.onChanged.addListener(Update);

            if(!chrome.bookmarks.onMoved.hasListener(Update))
                chrome.bookmarks.onMoved.addListener(Update);

            if(!chrome.bookmarks.onChildrenReordered.hasListener(Update))
                chrome.bookmarks.onChildrenReordered.addListener(Update);
        });

    };


    updateEvents();

    return bookmarks;

});
