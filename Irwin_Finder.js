// ==UserScript==
// @name         Finds anomalies close to irwins (within 2.5 miles)
// @namespace    http://tampermonkey.net/
// @version      2024-04-13
// @description  you take the moon and you take the sun
// @author       Kevin
// @match        https://alertwest.live/secure/anomalies
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alertwest.live
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {

    'use strict';
    function pinAnoms(){
        var me = this;
        this._awaitDeps = () => {
            this._targetNode = $('[id="map-legend"]');
            if (this._targetNode.length > 0){
                this._targetNode.after(
                    $('<div>').addClass('custom-gm-control-wrap').attr('style', 'position:absolute; top: 400px; right:0px;').attr('title', 'Locate irwins').append(
                        $('<button>').attr('style', 'width:40px; height:40px;').append(
                            $('<span>').addClass('material-icons').html('local_fire_department')
                        ).on('click', () => {
                            me.setPins();
                        })
                    )
                )
                clearInterval(this._i);
            }
        }

        function getActiveIrwinData(callback = () => {}, me){
            /*var query0 = new AjaxQuery("https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?f=json&where=1%3D1&outFields=*", "GET", {}, ()=>{}, (result0) => {
                */var irwinData = {};/*
                result0.responseJSON.features.forEach((feature) => {
                    irwinData[feature.attributes.IrwinID] = feature;
                });*/
                var query = new AjaxQuery("https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services/WFIGS_Incident_Locations_Last24h/FeatureServer/0/query?where=1%3D1&outFields=*&f=pjson", "GET", {}, ()=>{}, (result) => {
                    result.responseJSON.features.forEach((feature) => {
                        irwinData[feature.attributes.IrwinID] = feature;
                    });

                    callback(irwinData, me);
                }, ()=>{});
            /*}, ()=>{});*/
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

        Object.filter = (obj, predicate) =>
        Object.keys(obj)
            .filter( key => predicate(obj[key]))
            .reduce((res,key) => (res[key] = obj[key], res), {})

        function haversine(lat1, lon1, lat2, lon2) {
            // this function is super rad 😎
            function toRad(x) {
                return x * Math.PI / 180;
            }
            var r = 6371;
            var a = 1 - Math.cos(toRad(lat2 - lat1)) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * (1 - Math.cos(toRad(lon2 - lon1)));
            var c = Math.sqrt(a/2);
            var d = 2 * r * Math.asin(c);
            return d * 0.621371;
        }

        this.setPins = () => {
            getActiveIrwinData((irwinData,me)=>{
                me._irwinData=irwinData;
                getActiveAnomalies((anomData,me)=>{
                    me._anomData=anomData;
                    var filteredIrwins = Object.filter(me._irwinData, irwin => (irwin.attributes.POOState == 'US-CA') || (irwin.attributes.POOState == 'US-OR') || (irwin.attributes.POOState == 'US-NV')
                                                       || (irwin.attributes.POOState == 'US-ID') || (irwin.attributes.POOState == 'US-WA') || (irwin.attributes.POOState == 'US-AZ') || (irwin.attributes.POOState == 'US-CO')
                                                       || (irwin.attributes.POOState == 'US-HI') || (irwin.attributes.POOState == 'US-MT'));
                    var anomSet = new Map();
                    for (const key of Object.entries(filteredIrwins)){
                        // note: this calculates distance by irwin position on map. irwins don't always have their lat/lon recorded as an atrribute.
                        var closeAnoms = Object.filter(me._anomData, anom => (anom.inciPublic == false) && (haversine(key[1].geometry.y, key[1].geometry.x, parseFloat(anom.inciLat), parseFloat(anom.inciLon)) <= 2.5));
                        for (const anom of Object.entries(closeAnoms)){
                            anomSet.set(anom[0], anom[1]);
                        }
                    }
                    anomSet.forEach((value, key, map) => {
                        $('[id="pac-input"]').val(`${value.inciLat},${value.inciLon}`).trigger('submit');
                    })
                    $('[id="pac-input"]').val('');
                },me);
            },me);
        };

        this.init = () => {
            this._i = setInterval(this._awaitDeps, 200);
        };

        this.init();
    };

    window.addEventListener('load', () => {
        window._pinAnoms = new pinAnoms();
    });

})();
