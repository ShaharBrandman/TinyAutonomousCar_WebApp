/*
 * single purpose api wrapper for the google maps api
 * realtime db is implemnted here also
 * used in model.html
 * 
 * using getModelByName() method from model.js
 */
let map, marker;
let locationData;

function initMap() {
    if (locationData) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: locationData,
            zoom: 4
        });

        let modelName = localStorage.getItem('ModelSelected');

        if (!modelName) {
            modelName = "Model-Doesn't-Exists";
        }

        if (marker) {
            marker.setMap(null); // Clear previous markers
        }

        console.log(`New location: ${locationData.lat}, ${locationData.lng}`);

        marker = new google.maps.Marker({
            map: map,
            position: locationData,
            title: modelName
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    firebase.database().ref('Cars').on('value', (snapshot) => {
        const val = snapshot.val();

        for(const key in val) {
            if (val[key].Name === localStorage.getItem('ModelSelected')) {
                locationData = val[key].location;
            }
        }

        initMap();
    });
});
