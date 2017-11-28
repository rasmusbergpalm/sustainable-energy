'use strict';

/**
 * @return {number}
 */
function PJpY(x) {
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
    'energy': PJpY(42),
    //'lubrication': PJpY(11),
    'transport': PJpY(212),
    'industry': PJpY(161),
    'commerce': PJpY(112),
    'residential': PJpY(218)
};

let producers = {
    //'oil': PJpY(280),
    //'gas': PJpY(133),
    //'coal': PJpY(111),
    //'garbage': PJpY(18),
    'current sustainable': PJpY(213 + 18) //renewables plus garbage
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

function Offshore() {
    this.name = 'offshore';
    this.drawingOptions = {
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        polygonOptions: {
            fillColor: 'darkblue'
        }
    };
    this.wattpersquaremeter = watt(3) / square_meter(1);
    this.power = function (event) {
        const area = google.maps.geometry.spherical.computeArea(event.overlay.getPath());
        return square_meter(area) * this.wattpersquaremeter;
    };
}

function Nuclear() {
    this.name = 'nuclear';
    this.powerperplant = giga(watt(1.5));  // Roughly what the newest french plants gives
    this.drawingOptions = {
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        markerOptions: {icon: 'http://icons.iconarchive.com/icons/icons8/windows-8/24/Industry-Nuclear-Power-Plant-icon.png'},
    };
    this.power = function (event) {
        return this.powerperplant;
    };
}

function Solar() {
    this.name = 'solar';
    this.wattpersquaremeter = watt(10) / square_meter(1); //Lerchenborg Gods gives ~ 9 (https://ing.dk/artikel/skandinaviens-stoerste-solcellepark-paa-61-mw-aabnet-ved-kalundborg-181224)
    this.drawingOptions = {
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        polygonOptions: {
            fillColor: 'yellow'
        }
    };
    this.power = function (event) {
        const area = google.maps.geometry.spherical.computeArea(event.overlay.getPath());
        return square_meter(area) * this.wattpersquaremeter;
    };
}


function initMap() {
    let adding = null;
    let i = 1;
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 56.1488816, lng: 10.5586993},
        zoom: 7
    });
    const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false
    });
    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
        hideMapAlert();
        producers[adding.name + i] = adding.power(event);
        render_meters();
        i++;
    });


    function add(producer) {
        return function () {
            adding = producer;
            drawingManager.setOptions(producer.drawingOptions);
            $('#mapAlert').show();
        }
    }

    $('#add-offshore').click(add(new Offshore()));
    $('#add-nuclear').click(add(new Nuclear()));
    $('#add-solar').click(add(new Solar()));

    function hideMapAlert() {
        $('#mapAlert').hide();
        drawingManager.setOptions({drawingMode: null});
    }

    $('#mapAlert').find('.close').click(hideMapAlert);
}

render_meters();

