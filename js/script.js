const APIKEY = '4cf9378237c9f0e46c8ef9a06ca8cada';
const APISECRET = '4bb69aa6829cdd85';
const APIURL = 'https://www.flickr.com/services/rest/';
let currentUrl;
let pageNumber = 1;
let searchQuery;

function searchFlickr(query) {
    currentUrl = APIURL
        + '?format=json&nojsoncallback=1&method=flickr.photos.search&per_page=10&sort=relevance'
        + '&api_key=' + APIKEY
        + '&text=' + query
        + '&page=';
    $.get(currentUrl + (pageNumber++), function (raw) {
        if ($('#total').length === 0) {
            $('main').prepend('<div class="row mt-3" id="total"><div class="col text-right">results found: ' + raw.photos.total + '</div></div>');
        }
        parsePhoto(raw.photos.photo);
    }).done(function () {
        $('#loader').hide();
        $(document).find('#more').removeAttr('disabled')
    })
}

function getInfo(photo_id) {
    let photoInfoUrl = APIURL + '?format=json&nojsoncallback=1&method=flickr.photos.getInfo'
        + '&api_key=' + APIKEY
        + '&photo_id=' + photo_id;
    let modal = $('.modal');
    $.get(photoInfoUrl, function (raw) {
        if (raw.stat === 'ok') {
            let image = raw.photo;
            let table = modal.find('table');
            table.html('');

            let src = 'https://farm' + image.farm
                + '.staticflickr.com/' + image.server
                + '/' + image.id + '_'
                + image.secret + '.jpg';
            modal.find('img').attr('src', src);
            modal.find('h3').text(image.title._content);

            let dt = new Date(image.dates.posted * 1000);
            let date = dt.getDay() + "/" + dt.getMonth() + "/" + dt.getFullYear();

            let name = image.owner.realname ? image.owner.realname : image.owner.username;

            table.append("<tr><th>Author</th><td>" + name + "</td></tr>");
            table.append("<tr><th>Posted</th><td>" + date + "</td></tr>");

            if (image.hasOwnProperty('location')) {
                let loc = image.location;
                table.append("<tr><th>Country</th><td>" + loc.country._content + "</td></tr>");
                table.append("<tr><th>Region</th><td>" + loc.region._content + "</td></tr>");
                table.append("<tr><th>City</th><td>" + loc.county._content + "</td></tr>");
            }
            if (image.tags.tag.length > 0) {
                let tag = image.tags.tag;
                let tagText = '';
                for (i in tag) {
                    tagText += tag[i]._content + ", ";
                }
                table.append("<tr><th>Tags</th><td>" + tagText.substr(0, (tagText.length - 2)) + "</td></tr>");

            }
            if (image.description._content !== "") {
                table.append("<tr><th>Description</th><td>" + image.description._content + "</td></tr>")
            }
            console.log(raw);
        }
    }).done(function () {
        modal.modal('show')
    })
}

function parsePhoto(photos) {
    let imgTag;
    let photo;
    let image = '';
    for (let i in photos) {
        photo = photos[i];
        imgTag = '<figure class="figure col-12 col-sm-6 col-md-4 col-lg-2">';
        imgTag += `<a href="#" class="photoInfo" id="${photo.id}"><img
             src="https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg"
             class="figure-img img-thumbnail">`;
        imgTag += '</a></figure>';
        image += imgTag;
    }
    $('main.container-fluid div#imageSet').append(image);
}
$('#loader').hide();

$(document).ready(function () {
    $('#navForm, #mainForm').submit(function (e) {
        e.preventDefault();
        $(this).find('button').trigger('click');
    });
    $('#navFormSubmit, #mainFormSubmit').click(function (e) {
        e.preventDefault();
        searchQuery = $(this).parent().parent().find('input').val();
        let main = $('main.container-fluid');
        $('#loader').show();
        $('.modal').modal('hide');
        main.html('<div class="row mt-3" id="imageSet"></div>');
        searchFlickr(searchQuery);
        main.append('<div class="row mb-5"><div class="col-12 text-center"><button class="btn btn-primary rounded-circle" id="more">+</button></div></div>')
    });

    $(document).on('click', '#more', function (e) {
        e.preventDefault();
        $(this).attr('disabled', true);
        searchFlickr(searchQuery);
    });

    $(document).on('click', '.photoInfo', function (e) {
        e.preventDefault();
        let photoId = $(this).attr('id');
        let loader = $('#loader div');
        $(this).append(loader);
        getInfo(photoId);
    });
    $('.modal').on('hidden.bs.modal', function () {
        $(this).find('img').attr('src', 'images/loader.gif')
    })
});
