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


    $.mobile.loading().hide();

    window.moveToPage = function moveToPage(pageNumber) {
        if (pageNumber === 4) {
            setTimeout(()=>location.reload(), 4000);
        }
        $('.page').fadeOut("slow").promise().done(function () {
            $('#page' + pageNumber).fadeIn();

        })
    };


    $(document).on('pageinit', function () {

        moveToPageWithTimeout(2);

        var canvas = initCanvas();

        initFormValidator();


        // Send form to Server
        $("#formButton").click(function (e) {
            e.preventDefault();
            var form = $( "form" );
            if($("#detailForm").valid()){
                $.post("http://localhost/graphology/sendMail.php", $("#detailForm").serialize(), function (data) {
                    alert(data);
                });
                moveToPage(3)
            }
            // alert();

        });


        // Click on reset cavas button
        $("#resetCanvasButton").click(()=> {
            canvas.reset();
        });

        // Click on analyze button
        $('#analyze').click(() => {
            if (canvas.isTouched()) {
                canvas.analyze();
                $('#analyze').hide();
                $("#resetCanvasButton").hide();
                $('#finishButton').show();
            }
        });

    });


})();


function initData() {
    return {
        "fullName": "אתם אנשים פתוחים, גלויים, בעלי שמחת חיים, אין לכם מה להסתיר ומה שרואים - זה מה שיש. אגב, המרחק בין השמות בהחלט משנה. ככל שהשם הפרטי קרוב יותר לשם המשפחה, כך התקשורת שלכם עם משפחתכם טובה יותר. ככול שהשם הפרטי רחוק יותר משם המשפחה (מרחק של אות וחצי עד שתיים בערך) – תתחילו לעבוד על הקשרים המשפחתיים שלכם.",
        "firstName": "אתם אגואיסטים לא קטנים. אתם נוהגים להשקיע בעצמכם יותר מאשר במשפחתכם ואתם רוצים להראות לכל העולם עד כמה אתם יודעים לעשות הכל לבד. יכול להיות שסיימתם לאחרונה תיכון, לחלופין יכול להיות שלא מזמן התגרשתם ואתם רוצים להראות עד כמה אתם עצמאיים.",
        "notClear": "כנראה שיש לכם מה להסתיר. להוציא מכם משהו על עצמכם – קשה מאוד.",
        "circled": "על חומת סין שמעתם? אתם מקיפים את עצכם בחומות ולא נותנים לאף אחד להתקרב אליכם, אתם חשדנים ולא בוטחים באחרים. מאיפה נובע הריחוק הזה?",
        "isGoingUp": "אם חתימתכם עולה למעלה, אתם אנשים שעובדים עם השכל ועם ההיגיון. אתם מנכ\"לים או משהו?",
        "isGoingDown": "אם חתימתכם יורדת למטה, אתם אנשים שעובדים לפי הרגש. אתם יצריים, יצירתיים ואוהבים כסף.",
        "isMiddleLine": "אתם לא כל כך מסתדרים עם עצמכם ולא מאמינים ביכולות שלכם. לכן אתם נוטים לבטל את עצמכם. שימו פס על משהו אחר, לא על עצמכם.",
        "isUnderLine": "אתם מחפשים יציבות בחייכם. לא תיכנסו לתחומים שאתם לא שוחים בהם. כמו כן, אהבת הבמה לא פוסחת עליכם. אתם שוקלים קריירה בימתית?",
        "dotInEnd": "אתם אנשים של כאן ועכשיו, ורק תוצאות מיידות מביאות אתכם לידי סיפוק. אתם מחושבים ודייקנים ויודעים לעמוד על שלכם.",
        "acronyms": "אם חתמתם בראשי תיבות, אתם נוהגים לקצר תהליכים - ועושים את זה בצורה מדהימה.",
    };
}

function moveToPageWithTimeout(pageNumber) {
    setTimeout(()=> {
        moveToPage(pageNumber)
    }, 4000);
}


function initFormValidator() {
    var $form = $("#detailForm");
    var $formHandler = $form.validate({
        focusCleanup: true,
        errorPlacement: function (error, element) {
        },
        rules: {
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            email: {
                required: "required",
                email: true,
                emailvalidation: true
            },
            phone: {
                required: "required",
                phonevalidation: true
            }
        }
    });

    $.validator.addMethod("phonevalidation",
        function (phone, element) {
            return /^((\+)?[1-9]{1,2})?([-\s\.])?((\(\d{1,4}\))|\d{1,4})(([-\s\.])?[0-9]{1,12}){1,2}$/.test(phone);
        }
    );
    $.validator.addMethod("emailvalidation",
        function (email, element) {
            return /^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(email)
        }
    );

}


function initCanvas() {
    var canvas;
    var context;
    var clickX;
    var clickY;
    var clickX2;
    var clickY2;
    var clickDrag;
    var paint;
    var middleXY;
    var data = initData();
    initCanvas();
    printSquare();
    resizeCanvas();

    function initCanvas() {
        canvas = document.getElementById('mainCanvas');
        context = canvas.getContext("2d");
        clickX = [];
        clickY = [];
        clickX2 = [];
        clickY2 = [];
        clickDrag = [];
        middleXY = 150;
    }

    $('#mainCanvas').on("vmousedown", function (e) {
        e.preventDefault();
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        redraw();
    });

    $('#mainCanvas').on("vmousemove", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (paint) {
            console.log(e.pageY);
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    });

    $('#mainCanvas').on("vmouseup", function (e) {
        e.preventDefault();


        paint = false;
    });


    $('#mainCanvas').on("vmouseout", function (e) {
        e.preventDefault();

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

        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
        context.strokeStyle = "#df4b26";
        context.lineJoin = "round";
        context.lineWidth = 5;

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


    function analyze() {
        let avgX = calcAvg(clickX);
        let avgY = calcAvg(clickY2);
        let deviationNumber = clickY2.length;
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

        let detectArray = [
            {
                key: 'isMiddleLine',
                value: isMiddleLine
            },
            {
                key: 'isUnderLine',
                value: isUnderLine
            },
            {
                key: 'isGoingDown',
                value: isGoingDown
            },
            {
                key: 'isGoingUp',
                value: isGoingUp
            }
        ];

        showMessage(detectArray);

    };

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
        canvas.width = window.innerWidth - 60;
        canvas.height = 300;

        /**
         * Your drawings need to be inside this function otherwise they will be reset when
         * you resize the browser window and the canvas goes will be cleared.
         */
        drawStuff();
    }


    function drawStuff() {
        // do your drawing stuff here
    }


    function showMessage(detectArray) {
        for (let detect of detectArray) {
            if (detect.value) {
                $('#graphResult').text(data[detect.key]);
                return;
            }
        }
        $('#graphResult').text(pickRandomProperty(data));
    }

    function createRandomNumber(limit) {
        return Math.floor(Math.random() * limit) + 1
    }

    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj) {
            if (Math.random() < 1 / ++count) {
                result = obj[prop];
            }
        }
        return result;
    }

    return {
        analyze: analyze,
        reset: reset,
        isTouched: isTouched
    };

    //Clear canvas from old painting
    function reset() {
        initCanvas();
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Check if user has painted on the canvas
    function isTouched() {
        if (clickY2.length < 10) {
            alert('אנא רשמו חתימה');
            return false;
        }
        return true;
    }

}