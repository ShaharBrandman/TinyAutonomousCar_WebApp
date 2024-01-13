//handle post signed in event
function handleOk(email) {
    localStorage.setItem('authUsername', email);
    window.location = 'index.html';
}

//return true if user exists in realtime db else return false
function doesUserExist(email) {
    return new Promise((resolve, reject) => {
        const usersRef = firebase.database().ref('Usernames');
        usersRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
            resolve(snapshot.exists());
        });
    });
}

//log out from current signed in user
function logout() {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem('authUsername');
        window.location = 'index.html'; //refresh the page
    }).catch((error) => {
        console.error(error);
    })
}

//simply add user email to realtime db
function addUserByEmail(email) {
    const usersRef = firebase.database().ref('Usernames');
    const newUserRef = usersRef.push();

    //simply push a new object with a random ID to the Usernames array containing
    newUserRef.set({
        email: email
    });
} 

//toggle password visibiliy (used in auth.html)
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
    }
    else {
        passwordField.type = 'password';
    }
}

//used in the header component in index.html, about.html, contact.html and model.html
function displayAuthUsername() {
    const authUsername = localStorage.getItem('authUsername');
    const authUsernameComponent = document.getElementById('auth-username');

    if (authUsernameComponent) {
        authUsernameComponent.innerHTML = authUsername;
    }
}

//configuration of the onSubmit event listener for the sign in/up form after displaying it in index.html
function configOnSubmitListener() {
    const signInForm = document.getElementById('login-form');

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        //console.log(email + '\n' + password);

        doesUserExist(email).then((exists) => {
            if (exists) {
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        console.log('signed in: ' + userCredential)
                        handleOk(email);
                    })
                    .catch((error) => {
                        console.error(error.message);
                    });
            }
            else {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                     .then((userCredential) => {
                        console.log('signed up: ' + userCredential);
                        addUserByEmail(email);
                        handleOk(email);
                    })
                    .catch((error) => {
                         console.error(error.message);
                    });
            }
        })
    });
}