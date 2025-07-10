// ==UserScript==
// @name         Screensaver
// @namespace    http://tampermonkey.net/
// @version      2024-05-10
// @description  try to take over the world!
// @author       You
// @match        https://alertwest.live/secure/ai-dashboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alertwest.live
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function screensaver(){
        var me = this;
        this._awaitDeps = () => {
            this._targetNode = document.getElementById('logo-wrap');
            if (this._targetNode){
                var b = document.createElement('button');
                b.innerHTML = 'ALERTWest Screensaver';
                b.addEventListener('click', () => {
                    document.body.innerHTML = '';
                    document.body.style.cssText = 'position: relative; width: 100vw; height: 100vh; background-color: black; overflow: hidden';

                    var svg = document.createElement('svg');
                    svg.id = 'logo';
                    svg.width = '200';
                    svg.height = '200';
                    svg.style = 'position: absolute; left: calc(50vw - 150px); top: calc(50vh - 28px);';
                    svg.xmlns = 'http://www.w3.org/2000/svg';

                    var img = document.createElement('img');
                    img.width = '300';
                    img.height = '300';
                    img.src = 'img/aw_logo_white.svg';

                    svg.append(img);
                    document.body.append(svg);
                    window.requestAnimationFrame(move);
                });
                this._targetNode.after(b);
                window.addEventListener('resize', reset, true)
                clearInterval(this._i);
            }
        }

        let width = document.body.clientWidth,
            height = document.body.clientHeight,
            velocityX = 3,
            velocityY = 3,
            color = 0, prev,
            colors = ['',
                      'invert(30%) sepia(88%) saturate(2400%) hue-rotate(356deg) brightness(96%) contrast(94%)',
                      'invert(60%) sepia(98%) saturate(398%) hue-rotate(1deg) brightness(95%) contrast(99%)',
                      'invert(76%) sepia(96%) saturate(1427%) hue-rotate(78deg) brightness(94%) contrast(97%)',
                      'invert(17%) sepia(94%) saturate(4584%) hue-rotate(233deg) brightness(90%) contrast(106%)',
                      'invert(62%) sepia(49%) saturate(3708%) hue-rotate(152deg) brightness(109%) contrast(87%)',
                      'invert(35%) sepia(90%) saturate(5563%) hue-rotate(273deg) brightness(86%) contrast(125%)',
                      'invert(59%) sepia(5%) saturate(834%) hue-rotate(321deg) brightness(88%) contrast(89%)',
                      'invert(44%) sepia(14%) saturate(3275%) hue-rotate(158deg) brightness(95%) contrast(85%)',
                      'invert(74%) sepia(24%) saturate(218%) hue-rotate(221deg) brightness(87%) contrast(88%)',
                      'invert(66%) sepia(19%) saturate(590%) hue-rotate(108deg) brightness(88%) contrast(93%)'];

        function reset(){
            width = document.body.clientWidth;
            height = document.body.clientHeight;
            document.getElementById('logo').style.left = 'calc(50vw - 150px)';
            document.getElementById('logo').style.top = 'calc(50vh - 28px)';
        }

        function move(timestamp){
            var logo = document.getElementById('logo');
            let rect = logo.getBoundingClientRect();

            function changeColor(){
                prev = colors[color]
                colors.splice(color, 1);
                color = Math.floor(Math.random() * colors.length);
                colors.push(prev);
                logo.style.filter = colors[color];
            }

            if (rect.x + rect.width >= width + 15 || rect.x <= -15){
                velocityX = -velocityX;
                changeColor();
            }

            if (rect.y + rect.height >= height + 75 || rect.y <= -68){
                velocityY = -velocityY;
                changeColor();
            }

            logo.style.left = `${rect.x + velocityX}px`;
            logo.style.top = `${rect.y + velocityY}px`;
            requestAnimationFrame(move)
        }

        this.init = () => {
            this._i = setInterval(this._awaitDeps, 100);
        };

        this.init();
    }

    // Your code here...
    window.addEventListener('load', () => {
        window._screensaver = new screensaver();
    })
})();
