const carsRef = firebase.database().ref('Cars');

let modelSelected = null;

function getModelByName(snapshot, name) {
    for(key in snapshot) {
        if (snapshot[key].Name === name) {
            //cheap trick to append the key to the model data
            return { ...snapshot[key], key: key };
        }   
    }

    return undefined;
}

//updaet the model selected and change the header at once
function changeHeader() {
    const header = document.getElementsByClassName('header');
    if (header.length > 0) {
        const h1 = document.createElement('h1');
        
        if (modelSelected) {
            h1.innerHTML = "Model: " + modelSelected;
            header[0].appendChild(h1);
        }
        else {
            window.location = 'index.html';
        }
    }
}   

function displayGeolocation(locationData) {
    if (locationData) {
        const cords = document.getElementById('coordinates');
        if (cords) {
            cords.innerText = `( ${locationData.lat} , ${locationData.lng} )`
        }
    }
    else {
        console.error(`locationData doesn't exists`);
    }
}

function displayTargetSelector(targets) {
    if (targets) {
        const selector = document.getElementById('targets');

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
            targetSpan.innerText = target;
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

document.addEventListener('DOMContentLoaded', function() {
    modelSelected = localStorage.getItem('ModelSelected');

    changeHeader();

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