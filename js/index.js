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

function displayAuthScreen() {
    const authScreen = document.createElement('div');
    
    authScreen.innerHTML = `
        <div class="auth-form">
            <form id="login-form">
                <input type="email" id="email" placeholder="Email" required>
                <div class="password-container">
                    <input type="password" id="password" placeholder="Password" required>
                    <span class="toggle-password" onclick="togglePasswordVisibility()">&#x1F441;</span>
                </div>
                <button type="submit">Sign In</button>
            </form>
        </div>`;

    carOptions[0].appendChild(authScreen);

    configOnSubmitListener();
}

//defined every time the page loads, if a user is not signed in, make them authenciate, else display index.html
document.addEventListener('DOMContentLoaded', () => {
    //if user is not logged in, display the sign in/up screen
    if (localStorage.getItem('authUsername') == null) {
        document.getElementById('auth-username-button').hidden = true;
        displayAuthScreen();
    }
    //else display the car models
    else {
        document.getElementById('auth-username-button').hidden = false;
        displayAuthUsername();
        displayCarModels();
    }
});