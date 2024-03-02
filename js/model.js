let modelSelected = null;

function displayGeolocation(locationData) {
    if (locationData) {
        const cords = document.getElementById('coordinates');
        if (cords) {
            if (cords.innerText != `( ${locationData.lat} , ${locationData.lng} )`) {
                cords.innerText = `( ${locationData.lat} , ${locationData.lng} )`;
            }
            
        }
    }
    else {
        console.error(`locationData doesn't exists`);
    }
}

function displayTargetSelector(targets) {
    if (targets) {
        const selector = document.getElementById('targets');
        selector.innerHTML = '';

        if (selector) {
            targets.forEach((target) => {
                const optionElement = document.createElement('option');

                optionElement.text = target;

                selector.add(optionElement);
            });
        }
    }
    else {
        console.error(`targets doesn't exists`);
    }
}

function displayTarget(target) {
    const targetSpan = document.getElementById('target');
    
    if (targetSpan) {
        if (target) {
            if (targetSpan.text != target) {
                targetSpan.innerText = target;
            }
        }
        else {
            targetSpan.innerHTML = 'None';
        }
    }
}

function displayFollowingLaserButton(doesFollowingLaser) {
    const followLaser = document.getElementById('followLaser');

    if (followLaser) {
        if (doesFollowingLaser != undefined) {
            followLaser.innerHTML = `
                <div class="follow-laser-btn" onclick="toggleFollowLaser()">
                    ${doesFollowingLaser == true ? 'Unfollow Laser' : 'Follow Laser'}
                    <div class="circle" id="circle" style="background-color: ${doesFollowingLaser  == true ? 'green' : 'red'}"></div>
                </div>
            `;
        }
        else {
            console.error(`doesFollowingLaser doesn't exists`);
        }
    }
}

function toggleFollowLaser() {
    carsRef.once('value', (s) => {
        const modelData = getModelByName(s.val(), modelSelected)

        if (modelData) {
            if (modelData.doesFollowingLaser == false) {
                carsRef.child(modelData.key).update({
                    doesFollowingLaser: true,
                    target: 'Searching for Laser'
                });
            }
            else {
                carsRef.child(modelData.key).update({
                    doesFollowingLaser: false,
                    target: ''
                });
            }
        }
    })
}

function chooseTarget(event) {
    carsRef.once('value', (s) => {
        const modelData = getModelByName(s.val(), modelSelected)

        if (modelData) {
            carsRef.child(modelData.key).update({
                target: event.target.value
            });
        }
    })
}
function redirectToUploadPage() {
    window.location = 'upload.html';
}

function redirectToReviewPage() {
    window.location = 'review.html';
}

document.addEventListener('DOMContentLoaded', () => {
    modelSelected = localStorage.getItem('ModelSelected');

    displayAuthUsername();
    changeHeader();
    
    document.getElementById('targets').addEventListener('click', chooseTarget);

    carsRef.on('value', (s) => {
        const modelData = getModelByName(s.val(), modelSelected);

        if (modelData) {
            displayGeolocation(modelData.location);
            displayTargetSelector(modelData.targets);
            displayTarget(modelData.target);
            displayFollowingLaserButton(modelData.doesFollowingLaser);
        }
        else {
            console.error(`Model: ${modelSelected} doesn't exists`)
        }
        
    });
});