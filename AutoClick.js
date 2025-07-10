// ==UserScript==
// @name         Auto Click Fire Check & Home
// @namespace    http://tampermonkey.net/
// @version      2024-04-07
// @description  Take over Arrakis
// @author       Kevin
// @match        https://alertwest.live/secure/cam-console/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alertwest.live
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    function windowObserver() {
        var me = this;
        this._awaitDeps = () => {
            var dep = document.getElementById('confirmMoveModal');
            if (dep) {
                clearInterval(this._i);
                this._targetNode = $('#confirmMoveModal');
                this._targetNode.on('show.bs.modal', function (e) {
                    return e.preventDefault();
                });
                me._observe();
            }
        }

        this._observe = () => {
            var observer = new MutationObserver(() => {
                document.querySelector('[id^="camMoveForm"] > div:nth-child(11) > div > div:nth-child(2) > div:nth-child(1) > button').click();
                document.querySelector('#confirmMoveModal > div > div > div.modal-footer > button.btn.btn-primary').click();
            });

            var config = { childList: true, subtree: true };

            observer.observe(document.querySelector(`[id^="confirmMoveModal"]`), config);
        }

        this.init = () => {
            this._i = setInterval(this._awaitDeps, 200);
        }

        this.init();
    }

    window.addEventListener('load', () => {
        window._addObserver = new windowObserver();
    })
})();
