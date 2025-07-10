// ==UserScript==
// @name         ALERTGuessr
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hover over the settings icon in the tagged anomalies section to find the start button (Reach out to me if you find any bugs)
// @author       Kevin Crawford
// @match        https://alertwest.live/secure/anomalies
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alertwest.live
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Todo:
// Online leaderboard?

(function() {
    'use strict';
    function makeGuessr(){
        var me = this;
        this._awaitDeps = () => {
            this._targetNode = $('#fire-feed-wrap > div.feed-header > div.feed-options');
            if (this._targetNode.length > 0){
                $('#next-button').html('Lock Oldest');
                this._targetNode.append(
                    $('<div>').addClass('row').append([
                        $('<p>').attr('style', 'margin-right: 50px; margin-top: 2px;').html('ALERTGuessr:'),
                        $('<button>').attr('id', 'guessrBtn').attr('style', 'border-radius: 50%; padding: 0px; width: 32px; height: 32px;').append(
                            $('<span>').attr('id', 'guessrBtnColor').addClass('material-icons').html('power_settings_new')
                        ).on('click', () => {
                            function on(){
                                $('#guessrBtn').prop('disabled', true);
                                $('#guessrBtnColor').attr('style', 'color: grey');
                                me.initGuessr();
                            }
                            function off(){
                                $('div#gameMap').remove();
                                $('div#gameInput').remove();
                                $('#guess-score').remove();
                                $('#guessrBtnColor').attr('style', 'color: black')
                                console.log('Closed Streetview');
                            }
                            this.clickToggle ^= 1;
                            this.clickToggle ? on() : off();
                        })
                    ])
                )
                clearInterval(this._i);
            }
        };

        this.initGuessr = () => {
            var loaded = 0;
            var latlon = {lat: 0, lng: 0}
            var panorama;
            var best = 99999999;

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
            };

            function keyupEvent(e){
                if (e.key === 'Enter' || e.button == 1 || e.target.id == 'game-guess') {
                    var pattern = /((-?[0-9]{1,3}(?:.[0-9]{1,})?(?:[, ]{1,})?){2}|(-?[0-9]{1,3}(?:.[0-9]{1,})?(?:[° ]{1,})[0-9]{1,3}(?:.[0-9]{1,})?[' ]*(?:[0-9]{1,3}(?:.[0-9]{1,})?[&quot; ]{1,})?(?:[NSEWnsew])?[, ]{0,2}){2})/g;
                    if (pattern.test($('.coordinates-input').val())){
                        var dist = haversine(latlon.lat, latlon.lng, parseFloat($('.coordinates-input').val().split(',')[0]), parseFloat($('.coordinates-input').val().split(',')[1]));
                        Math.round(dist) < best ? best = Math.round(dist) : null;
                        $('#guess-result').stop().show(0).html(`Your guess was ${Math.round(dist)} mi away!`);
                        $('[id="pac-input"]').val(`${latlon.lat},${latlon.lng}`).trigger('submit');
                        $('#guess-score').html(`Best Guess: ${best} mi`);
                        $('[id="pac-input"]').val('');
                        $('[id="game-next"]').html('Play again?');
                        $('[id="game-guess"]').off();
                        $('#coordinates-input').off();
                    } else {
                        $('#guess-result').html('Please enter a valid set of coordinates.').show().fadeOut(3000);
                    }
                }
            }

            function TryRandomLocation(callback) {
                const lat = Math.random() * 180 - 90;
                const lng = Math.random() * 360 - 180;
                var sv = new google.maps.StreetViewService();

                sv.getPanorama({
                    location: new google.maps.LatLng(lat, lng),
                    radius: 5000
                }, callback);
            }

            function HandleCallback(data, status) {
                if (status == 'OK' && loaded) {
                    latlon = { lat: data.location.latLng.lat(), lng: data.location.latLng.lng() };
                    $('#guess-result').html('');
                    $('#game-next').html('Skip').prop('disabled', false);
                    $('#coordinates-input').val('');
                    panorama.setPosition(latlon);
                    $('[id="game-guess"]').off().on('click', (e) => keyupEvent(e));
                    $('#coordinates-input').off().on('keyup mousedown', (e) => keyupEvent(e));
                } else if (status == 'OK' && !loaded) {
                    $('div#fire-feed').prepend([
                        $('<div>').attr({
                            'style': 'width: 602px; height: 24px; margin-bottom: 10px; margin-top: 10px; display: flex',
                            'id': 'gameInput'
                        }).append([
                            $('<button>').attr({
                                'class': 'btn-primary',
                                'id': 'game-next',
                                'style': 'margin-right: 5px; border-radius: 3px; border: 0; '
                            }).html('Skip').on('click', () => {
                                $('#game-next').html('Loading...').prop('disabled', true);
                                TryRandomLocation(HandleCallback);
                            }),
                            $('<button>').attr({
                                'class': 'btn-primary',
                                'id': 'game-guess',
                                'style': 'border-radius: 3px; border: 0; '
                            }).html('Guess').on('click', (e) => keyupEvent(e)),
                            $('<input>').attr({
                                'class': 'coordinates-input',
                                'id': 'coordinates-input',
                                'placeholder': 'Enter guess coordinates',
                                'style': 'margin-left: 10px; font: 400 11px Roboto, Arial, sans-serif; width: 150.5px;'
                            }).on('keyup mousedown', (e) => keyupEvent(e)),
                            $('<p>').attr({
                                'style': 'height: 24px; color: yellow; margin-left: 10px',
                                'id': 'guess-result'
                            })
                        ]),
                        $('<div>').attr({
                            'style': 'width: 602px; height: 473px; margin-bottom: 10px',
                            'id': 'gameMap'
                        }),
                        $('<p>').attr({
                            'style': 'height: 24px; color: yellow; margin-left: 10px',
                            'id': 'guess-score'
                        }).html('Best Guess:')
                    ])
                    $('#guessrBtnColor').attr('style', 'color: green');
                    $('#guessrBtn').prop('disabled', false);

                    latlon = { lat: data.location.latLng.lat(), lng: data.location.latLng.lng() };
                    panorama = new google.maps.StreetViewPanorama(
                        document.getElementById("gameMap"),
                        {
                            position: latlon,
                            pov: {
                                heading: 34,
                                pitch: 10,
                            },
                        },
                    );

                    panorama.setOptions({
                        addressControl: false,
                        showRoadLabels: false,
                        disableDefaultUI: true
                    })

                    setTimeout(() => {
                        if ($('#gameMap > div > div:nth-child(14)').length > 0) {
                            $('#gameMap > div > div:nth-child(14)').wrap("<div class='new' style='pointer-events: none'></div>");
                        }
                    }, 100);

                    loaded = 1;
                    console.log('Loaded Streetview');
                } else {
                    TryRandomLocation(HandleCallback);
                }
            }

            TryRandomLocation(HandleCallback);
        };

        this.init = () => {
            this._i = setInterval(this._awaitDeps, 200);
        };

        this.init();
    };

    window.addEventListener('load', () => {
        window._makeGuessr = new makeGuessr();
    });

})();
