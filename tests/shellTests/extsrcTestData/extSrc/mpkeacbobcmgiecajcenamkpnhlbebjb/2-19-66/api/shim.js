define([
    './alarms',
    './apps',
    './bookmarks',
    './browser',
    './conflicting',
    './most-visited',
    './permissions',
    './pstorage',
    './recently-closed',
    './runtime',
    './social',
    './storage',
    './tabs',
    './windows'
], function(
    alarms,
    apps,
    bookmarks,
    browser,
    conflicting,
    mostVisited,
    permissions,
    pstorage,
    recentlyClosed,
    runtime,
    social,
    storage,
    tabs,
    windows
) {

    return {
        target         : 'google-chrome-extension',

        alarms         : alarms,
        apps           : apps,
        bookmarks      : bookmarks,
        browser        : browser,
        conflicting    : conflicting,
        mostVisited    : mostVisited,
        permissions    : permissions,
        pstorage       : pstorage,
        recentlyClosed : recentlyClosed,
        runtime        : runtime,
        social         : social,
        storage        : storage,
        tabs           : tabs,
        windows        : windows
    };

});
