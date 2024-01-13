function displayImages(images) {
    if (images) {
        const imageContainer = document.getElementById('imageContainer');

        if(imageContainer) {
            imageContainer.innerHTML = ''; //clear previous images

            images.forEach((image) => {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('imageItem');

                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.name;

                const buttonsContainer = document.createElement('div');
                buttonsContainer.classList.add('imageButtons');

                const approveButton = document.createElement('button');
                approveButton.textContent = 'Approve';
                approveButton.classList.add('approveButton');
                approveButton.onclick = () => approveImage(image.name);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('deleteButton');
                deleteButton.onclick = () => deleteImage(image.name);

                buttonsContainer.appendChild(approveButton);
                buttonsContainer.appendChild(deleteButton);

                imgContainer.appendChild(img);
                imgContainer.appendChild(buttonsContainer);

                imageContainer.appendChild(imgContainer);
            });
        }
        else {
            console.error(`imageContainer doesn't exists!`);
        }   
    }
}

function fetchAndDisplayImages() {
    testOutputRef.listAll().then((result) => {
        const images = [];
        result.items.forEach((item) => {
            item.getDownloadURL().then((url) => {
                images.push({ name: item.name, url: url });
                displayImages(images);
            });
        });
    }).catch((error) => {
        console.error('Error fetching images:', error);
    });
}

function approveImage(id) {
    const dest = prompt(`Enter a classification label for ${id}`);

    if (dest) {
        const sourceRef = testOutputRef.child(id);
        const destinationRef = trainingDataRef.child(dest + "/" + id);

        //get download url of approved image
        sourceRef.getDownloadURL().then((url) => {
            fetch(url)
                .then((response) => response.blob())
                .then((blob) => {
                    const metadata = { contentType: 'image/jpeg' };
                    
                    //upload image to destination folder
                    destinationRef.put(blob, metadata).then(() => {
                        //deleting the approved image
                        sourceRef.delete().then(() => {
                            console.log(`${id} Approved and Moved`);
                            fetchAndDisplayImages();
                        }).catch((error) => {
                            console.error(`Error deleting ${id} in ${url}:`, error);
                        });
                    }).catch((error) => {
                        console.error(`Error moving ${id} in ${url}:`, error);
                    });
                })
                .catch((error) => {
                    console.error('Error fetching image as blob:', error);
                });
        }).catch((error) => {
            console.error('Error fetching image URL:', error);
        });
    }
}

function deleteImage(id) {
    const imageRef = testOutputRef.child(id);

    imageRef.delete().then(() => {
        console.log(`Image Deleted: ${id}`);
        fetchAndDisplayImages();
    }).catch((error) => {
        console.error(`Error deleting ${id}:`, error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    modelSelected = localStorage.getItem('ModelSelected');

    changeHeader();

    carsRef.on('value', (s) => {
        const modelData = getModelByName(s.val(), modelSelected);

        if (modelData) {
            fetchAndDisplayImages();
        }
        else {
            console.error(`Model: ${modelSelected} doesn't exists`)
        }
        
    });
});