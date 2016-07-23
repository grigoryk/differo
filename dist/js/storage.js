'use strict';

let storage = {
    get: function (key) {
        return new Promise((resolve, reject) => {
            if (!storage.hasLocalStorage()) {
                reject();
            }

            chrome.storage.local.get(key, (cached) => {
                if (chrome.runtime.lastError || !cached.hasOwnProperty(key)) {
                    reject();
                } else {
                    resolve(cached);
                }
            });
        });
    },

    set: (toCache) => {
        return new Promise((resolve, reject) => {
            if (!storage.hasLocalStorage()) {
                reject();
            }

            chrome.storage.local.set(toCache, function() {
                resolve();
            });
        });
    },

    hasLocalStorage: () => {
        return chrome && chrome.storage && chrome.storage.local;
    }
};
