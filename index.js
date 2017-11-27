'use strict';

/**
 * @return {number}
 */
function PJpYA(x) {
    return peta(joule(x)) / year(1);
}

function capita() {
    return 5778570; //Statistics Denmark
}

function peta(x) {
    return Math.pow(10, 15) * x;
}

function giga(x) {
    return Math.pow(10, 9) * x;
}

function joule(x) {
    return x;
}

function watt(x) {
    return x;
}

function square_meter(x) {
    return x;
}

function hour(x) {
    return x * 60 * 60
}

function day(x) {
    return x * hour(24)
}


function year(x) {
    return x * day(365);
}

function to_kwhpd(x) {
    return watt(x) / (watt(1000) * hour(1) / day(1)) / capita()
}


let consumers = {// https://ens.dk/sites/ens.dk/files/Statistik/energistatistik2015.pdf
    'energy': PJpYA(42),
    //'lubrication': PJpYA(11),
    'transport': PJpYA(212),
    'industry': PJpYA(161),
    'commerce': PJpYA(112),
    'residential': PJpYA(218)
};

let producers = {
    //'oil': PJpYA(280),
    //'gas': PJpYA(133),
    //'coal': PJpYA(111),
    //'garbage': PJpYA(18),
    'current sustainable': PJpYA(213 + 18) //renewables plus garbage
};


function render_meters() {
    $('.consumer').remove();
    $.each(consumers, function (key, value) {
        value = to_kwhpd(value);
        $("#consumers").append($('<div class="consumer" style="height: ' + value * 6 + 'px">' + key + ' : ' + Math.round(value) + '</div>'));
    });

    $('.producer').remove();
    $.each(producers, function (key, value) {
        value = to_kwhpd(value);
        $("#producers").append($('<div class="producer" style="height: ' + value * 6 + 'px">' + key + ' : ' + Math.round(value) + '</div>'));
    });
}

function offshore() {
    this.name = 'offshore';
    this.drawingOptions = {
        drawingMode: google.maps.drawing.OverlayType.POLYGON
    };
    this.wattpersquaremeter = watt(3) / square_meter(1);
    this.power = function (event) {
        const area = google.maps.geometry.spherical.computeArea(event.overlay.getPath());
        return square_meter(area) * this.wattpersquaremeter;
    };
    return this;
}

function nuclear() {
    this.name = 'nuclear';
    this.powerperplant = giga(watt(1.5));
    this.drawingOptions = {
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        markerOptions: {icon: 'http://icons.iconarchive.com/icons/icons8/windows-8/24/Industry-Nuclear-Power-Plant-icon.png'},
    };
    this.power = function (event) {
        return this.powerperplant;
    };
    return this;
}


function initMap() {
    let adding = null;
    let i = 1;
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 56.1488816, lng: 11.0586993},
        zoom: 6
    });
    const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false
    });
    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
        producers[adding.name + i] = adding.power(event);
        drawingManager.setOptions({drawingMode: null});
        render_meters();
        i++;
    });


    function add(producer) {
        return function () {
            adding = producer;
            drawingManager.setOptions(producer.drawingOptions);
        }
    }

    $('#add-offshore').click(add(new offshore()));
    $('#add-nuclear').click(add(new nuclear()));
}

render_meters();
