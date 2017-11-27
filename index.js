//consumption = 100; //kwh/day


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
    return day(365);
}

function offshore(area) {
    return square_meter(area) * watt(3) / square_meter(1)
}

function to_kwhpd(x) {
    return watt(x) / (watt(1000) * hour(1) / day(1)) / capita()
}


consumers = {// https://ens.dk/sites/ens.dk/files/Statistik/energistatistik2015.pdf
    'energy': PJpYA(42),
    //'lubrication': PJpYA(11),
    'transport': PJpYA(212),
    'industry': PJpYA(161),
    'commerce': PJpYA(112),
    'residential': PJpYA(218)
};

producers = {
    //'oil': PJpYA(280),
    //'gas': PJpYA(133),
    //'coal': PJpYA(111),
    //'garbage': PJpYA(18),
    'current sustainable': PJpYA(213 + 18) //renewables plus garbage
};


function update() {
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


function initMap() {
    var i = 1;
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 56.1488816, lng: 11.0586993},
        zoom: 7
    });
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
        }

        //markerOptions: {icon: 'http://icons.iconarchive.com/icons/icons8/windows-8/24/Industry-Nuclear-Power-Plant-icon.png'},
    });
    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
        var area = google.maps.geometry.spherical.computeArea(polygon.getPath());
        producers["offshore" + i] = offshore(area);
        update();
        i++;
    });
}

update();