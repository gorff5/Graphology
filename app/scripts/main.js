/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function () {
    'use strict';

    // Check to make sure service workers are supported in the current browser,
    // and that the current page is accessed from a secure origin. Using a
    // service worker from an insecure origin will trigger JS console errors. See
    // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ('serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || isLocalhost)) {
        navigator.serviceWorker.register('service-worker.js')
            .then(function (registration) {
                // updatefound is fired if service-worker.js changes.
                registration.onupdatefound = function () {
                    // updatefound is also fired the very first time the SW is installed,
                    // and there's no need to prompt for a reload at that point.
                    // So check here to see if the page is already controlled,
                    // i.e. whether there's an existing service worker.
                    if (navigator.serviceWorker.controller) {
                        // The updatefound event implies that registration.installing is set:
                        // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
                        var installingWorker = registration.installing;

                        installingWorker.onstatechange = function () {
                            switch (installingWorker.state) {
                                case 'installed':
                                    // At this point, the old content will have been purged and the
                                    // fresh content will have been added to the cache.
                                    // It's the perfect time to display a "New content is
                                    // available; please refresh." message in the page's interface.
                                    break;

                                case 'redundant':
                                    throw new Error('The installing ' +
                                        'service worker became redundant.');

                                default:
                                // Ignore
                            }
                        };
                    }
                };
            }).catch(function (e) {
            console.error('Error during service worker registration:', e);
        });
    }


    // Your custom JavaScript goes here

    $(document).ready(function () {
            var canvas = document.getElementById('mainCanvas');
            var context = canvas.getContext("2d");
            var clickX = new Array();
            var clickY = new Array();
            var clickX2 = new Array();
            var clickY2 = new Array();
            var clickDrag = new Array();
            var paint;
            var middleXY = 250;
        var data = [];
            printSquare();
        initData();

            $('#mainCanvas').mousedown(function (e) {
                var mouseX = e.pageX - this.offsetLeft;
                var mouseY = e.pageY - this.offsetTop;

                paint = true;
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
                redraw();
            });

            $('#mainCanvas').mousemove(function (e) {
                if (paint) {
                    console.log(e.pageY);
                    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                    redraw();
                }
            });

            $('#mainCanvas').mouseup(function (e) {
                paint = false;
            });


            $('#mainCanvas').mouseleave(function (e) {
                paint = false;
            });


            function addClick(x, y, dragging) {


                clickX.push(x);
                clickY.push(y);
                clickDrag.push(dragging);

                // x = x - middleXY;
                y = middleXY - y;

                clickX2.push(x);
                clickY2.push(y);

            }

            function redraw() {
                // context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

                context.strokeStyle = "#df4b26";
                context.lineJoin = "round";
                context.lineWidth = 5;
                let oldX;
                let oldY;

                for (var i = 0; i < clickX.length; i++) {
                    context.beginPath();
                    if (clickDrag[i] && i) {
                        context.moveTo(clickX[i - 1], clickY[i - 1]);
                    } else {
                        context.moveTo(clickX[i] - 1, clickY[i]);
                    }
                    context.lineTo(clickX[i], clickY[i]);
                    context.closePath();
                    context.stroke();
                }
            }


            $('#analyze').click(()=> {
                let avgX = calcAvg(clickX);
                let avgY = calcAvg(clickY2);
                let deviationNumber = clickY2.length / 2;
                let maxY = Math.max(...clickY2);
                let minY = Math.min(...clickY2);
                // let maxX = Math.max(...clickX2);
                // let minX = Math.min(...clickX2);

                let isGoingUp = checkGoingUp(avgY, deviationNumber, maxY);
                let isGoingDown = checkGoingDown(avgY, deviationNumber, minY);
                let isUnderLine = checkUnderLine(clickY2, clickX2, avgY, minY);
                let isMiddleLine = checkMiddleLine(clickY2, clickX2, avgY, minY, maxY);

                console.log('isGoingUp: ' + isGoingUp.toString());
                console.log('isGoingDown: ' + isGoingDown.toString());
                console.log('isUnderLine: ' + isUnderLine.toString());
                console.log('isMiddleLine: ' + isMiddleLine.toString());

                let detectArray = [isGoingUp,isGoingDown,isUnderLine,isMiddleLine];

                showMessage(detectArray);


            });

            function checkGoingUp(avgY, deviationNumber, max) {

                return max - avgY > deviationNumber;
            }

            function checkGoingDown(avgY, deviationNumber, min) {

                return avgY - min > deviationNumber;
            }

            function calcAvg(array) {
                let sum = 0;

                for (let i = 0; i < array.length; i++) {
                    sum += array[i];
                }

                return sum / array.length;
            }

            //This func search straight line,
            //if found we check if this line is a underline
            function checkUnderLine(clickY2, clickX2, avgY, minY) {
                let deviationNumber = 15;
                let lineMinHeight = checkStraightLine(clickY2, clickX2);
                if (lineMinHeight) {
                    if (lineMinHeight < calcAvg([avgY - deviationNumber, minY])) { //I make avg to make some deviation
                        return true;
                    }
                }
                return false;
            }

            function checkMiddleLine(clickY2, clickX2, avgY, minY, maxY) {
                let deviationNumber = 15;
                let lineMinHeight = checkStraightLine(clickY2, clickX2);
                if (lineMinHeight) {
                    if (lineMinHeight > calcAvg([avgY - deviationNumber, minY]) && lineMinHeight < calcAvg([avgY - deviationNumber, maxY])) { //I make avg to make some deviation
                        return true;
                    }
                }
                return false;
            }

            // If found Straight line minimum line height null
            function checkStraightLine(clickY2, clickX2) {
                let deviationNumber = 2;
                let prevY = 0; // some temp value, used for calc in the for loop
                let prevX = 0; // some temp value, used for calc in the for loop
                let counter = 0;
                let lineLength = 100; // the line we will find need to be at least x lengyh
                let longestLineFoundNumber = 0; // the height value that the counter reached
                let lastIndex = 0; //The last index of the longestLineFoundNumber found


                for (let i = 0; i < clickY2.length; i++) {
                    if ((clickY2[i] >= prevY - deviationNumber) &&
                        (clickY2[i] <= prevY + deviationNumber) &&
                        (clickX2[i] != prevX)) {
                        counter++;
                        if (counter > longestLineFoundNumber) {
                            longestLineFoundNumber = counter;
                            lastIndex = i;
                        }
                    }
                    else {
                        counter = 0;
                    }
                    prevY = clickY2[i];
                    prevX = clickX2[i];
                }

                //if line found return avg of the max and min indexes
                return clickX2[lastIndex] - clickX2[lastIndex - longestLineFoundNumber] > lineLength ? calcAvg([clickY2[lastIndex], clickY2[lastIndex - longestLineFoundNumber]]) : null;
            }

            function printSquare() {
                context.beginPath();
                context.rect(300, 200, 400, 100);
                context.stroke();
            }

            // resize the canvas to fill browser window dynamically
            window.addEventListener('resize', resizeCanvas, false);

            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = 500;

                /**
                 * Your drawings need to be inside this function otherwise they will be reset when
                 * you resize the browser window and the canvas goes will be cleared.
                 */
                drawStuff();
            }

            resizeCanvas();

            function drawStuff() {
                // do your drawing stuff here
            }

        function initData() {
            $.getJSON("data.json", function (json) {
                data = json;
            });
        }

        function showMessage(detectArray) {

        }
    });







})();
