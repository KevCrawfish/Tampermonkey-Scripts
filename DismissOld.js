// ==UserScript==
// @name         Dismiss old anomalies
// @namespace    http://tampermonkey.net/
// @version      2024-04-14
// @description  try to take over the moon
// @author       Kevin
// @match        https://alertwest.live/secure/anomalies
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alertwest.live
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function disAnoms(){

        var me = this;
        this._awaitDeps = () => {
            this._targetNode = $('button:contains("Merge")');
            if (this._targetNode.length > 0){
                this._targetNode.after(
                    $('<button>').addClass('btn-primary merge-btn').append(
                        $('<span>').html('Dismiss')
                    ).on('click', () => {
                        me.dismissAnoms();
                    })
                )
                clearInterval(this._i);
            }
        }

        function getActiveAnomalies(callback = () => {}, me) {
            var anomData = {};
            var query = new AjaxQuery("https://alertwest.live/secure/api/anomalies/active", "GET", {}, ()=>{}, (result) => {
                for(const key of Object.entries(result.responseJSON.data.incidents)) {
                    anomData[key[0]] = key[1]
                };
                callback(anomData, me);
            }, ()=>{});
        }

        function getTime(ts) {
            let now = (new Date).getTime()/1000;
            let timeAgo = now - ts;
            if (timeAgo > 43200){
                return true
            }
        }

        Object.filter = (obj, predicate) =>
        Object.keys(obj)
            .filter( key => predicate(obj[key]))
            .reduce((res,key) => (res[key] = obj[key], res), {})

        this.dismissAnoms = () => {
            getActiveAnomalies((anomData,me)=>{
                me._anomData=anomData;
                var oldAnoms = Object.filter(me._anomData, anom => (getTime(parseFloat(anom.hits[anom.inciLastHit].aihiTimestamp)) == true) && (anom.inciPublic == false));
                for(const key of Object.entries(oldAnoms)){
                    var query = new AjaxQuery("https://alertwest.live/secure/api/system/anomaly/dismiss", "POST", {"inciId": key[1].inciId, "csrfKey": globals.session.token}, ()=>{}, (result) => {}, ()=>{});
                }
            },me);
        };

        this.init = () => {
            this._i = setInterval(this._awaitDeps, 200);
        };

        this.init();
    };

    window.addEventListener('load', () => {
        window._disAnoms = new disAnoms();
    });
})();
