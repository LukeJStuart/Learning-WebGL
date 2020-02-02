// Load a text resource from a file over the network
var loadTextResource = (url) => {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (request.status < 200 || request.status > 299) {
                reject('Error: HTTP Status ' + request.status + ' on resource ' + url);
            } else {
                resolve(request.responseText);
            }
        }
    })
}

var loadImage = (url) => {
    return new Promise((resolve, reject) => {
        var image = new Image();
        image.onload = function () {
            resolve(image);
        }
        image.src = url;
    })
}

var loadJSONResource = (url) => {
    return new Promise((resolve, reject) => {
        loadTextResource.then((responseText) => {
            try {
                resolve(JSON.parse(responseText));
            } catch (e) {
                reject(e);
            }
        }).catch((errorMessage) => {
            reject(errorMessage);
        })
    })
}