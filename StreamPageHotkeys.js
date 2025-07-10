// ==UserScript==
// @name         Stream Page Hotkeys
// @namespace    http://tampermonkey.net/
// @version      2024-04-15
// @description  try to take over the world!
// @author       You
// @match        https://alertwest.live/secure/ai-stream
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alertwest.live
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    window.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowLeft":
            case "r":
                //Go back in history
                document.getElementById('image-history-queue').children[0] ? document.getElementById('image-history-queue').children[0].click() : null
                break;
            case "ArrowRight":
                //No fire
                document.getElementById('image-no-fire').click();
                break;
        }
    });
})();
