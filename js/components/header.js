//update the model selected and change the header at once
function changeHeader() {
    const header = document.getElementsByClassName('header');
    if (header.length > 0) {
        const span = document.getElementById('auth-username');

        if (span) {
            span.addEventListener('click', () => {
                firebase.auth().currentUser.getIdToken(true).then((idToken) => {
                    navigator.clipboard.writeText(idToken);
                    alert('Copied ID Token to clipboard.');
                    console.log(`Token ID: ${idToken}`);
                }).catch((err) => {
                    console.error(err);
                })
            })
        }
        
        const modelSelected = localStorage.getItem('ModelSelected');

        if (modelSelected) {
            const h1 = document.createElement('h1');

            // if (window.location.href.includes('review.html')) {
            //     h1.innerHTML = "Review: " + modelSelected;
            // }
            // else 
            if (window.location.href.includes('upload.html')) {
                h1.innerHTML = "Upload: " + modelSelected;
            }
            else {
                h1.innerHTML = "Model: " + modelSelected;
            }

            header[0].appendChild(h1);
            
        }
        else {
            window.location = 'index.html';
        }
    }
}  