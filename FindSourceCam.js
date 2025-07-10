// ==UserScript==
// @name         Show source cam
// @namespace    http://tampermonkey.net/
// @version      2024-05-31
// @description  try to take over the world!
// @author       Kevin
// @match        https://alertwest.live/secure/ai-stream
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alertwest.live
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    function windowObserver(){
        function getCameraData(callback = () => {}, me) {
            var camData = new Map();
            var locData = new Map();
            var query = new AjaxQuery("https://api.cdn.prod.alertwest.com/api/sys/getCameraDataByLoc", "GET", {}, ()=>{}, (result) => {
                for(const key of Object.entries(result.responseJSON.data.locs.data)) {
                    locData.set(key[1].id, key[1].st);
                };
                for(const key of Object.entries(result.responseJSON.data.cams.data)) {
                    camData.set(key[1].id, locData.get(key[1].lid));
                };
                var query = new AjaxQuery("https://alertwest.live/secure/api/getPCameraDataByLoc", "GET", {}, ()=>{}, (result) => {
                    for(const key of Object.entries(result.responseJSON.data.locs.data)) {
                        locData.set(key[1].id, key[1].st);
                    };
                    for(const key of Object.entries(result.responseJSON.data.cams.data)) {
                        camData.set(key[1].id, locData.get(key[1].lid));
                    };
                    callback(camData, me);
                }, ()=>{});
            }, ()=>{});
        }

        this.awaitDeps = () => {
            var me = this;
            var targetNode = document.querySelector('#image-display > div > div > img:nth-child(1)');
            if (targetNode) {
                clearInterval(this._i);
                getCameraData((camData,me)=>{
                    me._camData=camData;
                    var link = document.createElement('a');
                    var detail = document.querySelector('#image-display > div > div > div.filter-details');
                    link.id = 'cam-source';
                    link.style = `position: absolute; left: 1em; background-color: #000000bf; padding: 4px; border-radius: 4px; top: 15em;`
                    var cam = document.querySelector('#image-display > div:nth-last-child(1) > div > img:nth-child(1)').src.match(/([1-9])\w+/g)[0];
                    link.href = `https://alertwest.live/secure/cam-console/${cam}`;
                    link.innerHTML = `<span>src: ${camData.get(cam)}</span>`;
                    document.getElementById('image-debug2').after(link);
                    me.observe(camData);
                },me);
            }
        }

        this.observe = (camData) => {
            var observer = new MutationObserver(() => {
                var cam = document.querySelector('#image-display > div:nth-last-child(1) > div > img:nth-child(1)');
                if (cam == null){return};
                var src = cam.src.match(/([1-9])\w+/g)[0];
                document.getElementById('cam-source').href = `https://alertwest.live/secure/cam-console/${src}`;
                document.getElementById('cam-source').innerHTML = `<span>src: ${camData.get(src)}</span>`;
            });

            var config = { childList: true, subtree: true };

            observer.observe(document.getElementById('image-display'), config);
        }

        this.init = () => {
            this._i = setInterval(this.awaitDeps, 200)
        }

        this.init();
    };

    window.addEventListener('load', () => {
        window._addObserver = new windowObserver();
    })
})();
