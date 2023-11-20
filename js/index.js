/*
 * This file contains all the functionally of index.html
 */
const carOptions = document.getElementsByClassName("car-options");

//add car model to be selected to the car-options div
function addCarOption(Name, ImageURL) {
    const div = document.createElement("div");
    div.className = "car-option";

    const link = document.createElement("a");
    
    link.href = "model.html";
    
    const img = document.createElement("img");
    
    img.src = ImageURL;
    img.alt = Name;
    
    link.appendChild(img);
    div.appendChild(link);

    const namePara = document.createElement("p");
    
    namePara.textContent = Name;
    
    div.appendChild(namePara);

    //also add an on click event that adds the model selected name to cache
    link.addEventListener('click', () => {
        localStorage.setItem('ModelSelected', Name);
    });

    carOptions[0].appendChild(div);
}

//simply display the car models from realtime db to car-options div
function displayCarModels() {
    const db = firebase.database();
    const carsRef = db.ref("Cars");
    carsRef.on('value', (snapshot) => {
        carOptions[0].innerHTML = ""; //clear previous car options
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            
            console.log(data)
            
            addCarOption(data.Name, data.ImageURL);
        });
    });
}

//defined every time the page loads, if a user is not signed in, make them authenciate, else display index.html
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('authUsername') == null) {
        window.location = 'auth.html';
    }
    else {
        displayAuthUsername();
        displayCarModels();
    }
});