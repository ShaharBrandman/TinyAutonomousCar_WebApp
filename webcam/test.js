let recording = false;

let currentImages = [];
let datasets = [];

const supportedTypes = [
    "person",
    "bicycle",
    "car",
    "motorcycle",
    "airplane",
    "bus",
    "train",
    "truck",
    "boat",
    "traffic light",
    "fire hydrant",
    "stop sign",
    "parking meter",
    "bench",
    "bird",
    "cat",
    "dog",
    "horse",
    "sheep",
    "cow",
    "elephant",
    "bear",
    "zebra",
    "giraffe",
    "backpack",
    "umbrella",
    "handbag",
    "tie",
    "suitcase",
    "frisbee",
    "skis",
    "snowboard",
    "sports ball",
    "kite",
    "baseball bat",
    "baseball glove",
    "skateboard",
    "surfboard",
    "tennis racket",
    "bottle",
    "wine glass",
    "cup",
    "fork",
    "knife",
    "spoon",
    "bowl",
    "banana",
    "apple",
    "sandwich",
    "orange",
    "broccoli",
    "carrot",
    "hot dog",
    "pizza",
    "donut",
    "cake",
    "chair",
    "couch",
    "potted plant",
    "bed",
    "dining table",
    "toilet",
    "tv",
    "laptop",
    "mouse",
    "remote",
    "keyboard",
    "cell phone",
    "microwave",
    "oven",
    "toaster",
    "sink",
    "refrigerator",
    "book",
    "clock",
    "vase",
    "scissors",
    "teddy bear",
    "hair drier",
    "toothbrush"
];

function updateImagesDiv() {
    const imagesDiv = document.getElementById('imagesDiv');
    imagesDiv.innerText = '';
    
    if (currentImages.length > 0) {
        for(let e in currentImages) {
            const newImage = new Image();
            newImage.crossOrigin = 'annoymous';
            newImage.src = currentImages[e];
            newImage.id = e
            imagesDiv.append(newImage);
        }
    }
    else {
        const p = document.createElement('p');
        p.innerText = 'No Images yet';
        imagesDiv.append(p);
    }
}

function updateFoldersDiv() {
    const foldersDiv = document.getElementById('folderDiv');
    foldersDiv.innerHTML = '';

    for(let i in datasets) {
        e = datasets[i];
        const newDataset = document.createElement('div');
        newDataset.id = 'folderItem';

        const datasetThumbnail = new Image();

        datasetThumbnail.addEventListener('click', () => {
            currentImages = datasets[i]['images'];
            updateImagesDiv();
        });
        datasetThumbnail.crossOrigin = 'anonymous';
        datasetThumbnail.src = e['images'][e['images'].length - 1]
        newDataset.append(datasetThumbnail);

        const label = document.createElement('p');
        label.id = 'label';
        label.contentEditable = true;
        label.innerText = e['label'];
        newDataset.append(label);

        const type = document.createElement('p');
        type.id = 'type';
        type.contentEditable = true;
        type.innerText = e['type'];
        newDataset.append(type);

        const count = document.createElement('p');
        count.id = 'count';
        count.innerText = e['images'].length
        newDataset.append(count);
        
        foldersDiv.append(newDataset);
    }
}

//a function to record the webcam feed every 100ms second if recording
function record() {
    if (recording) {
        const videoFeed = document.getElementById('videoElement')
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
            
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
            
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
            
        const imageData = canvas.toDataURL('image/jpeg');
            
        currentImages.push(imageData);

        updateImagesDiv();

        setTimeout(record, 100);
    }
}

function stopRecord() {
    Swal.fire({
        title: "Submit the label the new dataset",
        input: "text",
        inputAttributes: {
          autocapitalize: "off"
        },
        showCancelButton: false,
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true
    }).then((label) => {
        return new Promise((resolve, reject) => {
            Swal.fire({
                title: "Submit the Type the new dataset",
                input: "text",
                inputAttributes: {
                  autocapitalize: "off"
                },
                showCancelButton: false,
                confirmButtonText: "Submit",
                showLoaderOnConfirm: true
            }).then((t) => {
                resolve({'label': label.value, 'type': t.value});
            }).catch((err) => {
                reject(err);
            })
        })
        
    }).then((result) => {
        if (supportedTypes.includes(result['type'])) {
            datasets.push({
                'type': result['type'],
                'label': result['label'],
                'images': currentImages
            });
            updateFoldersDiv();

            currentImages = [];
            updateImagesDiv();
        }
        else {
            Swal.fire({
                icon: "error",
                title: "Invalid Type",
                text: `${result['type']} is not a valid type`,
                footer: '<a href="https://gist.github.com/aallan/fbdf008cffd1e08a619ad11a02b74fa8">Supported Types</a>'
            }).then(() => {
                stopRecord();
            })   
        }
    })
}

function displayWebFeed() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            var video = document.querySelector("#videoElement");
            video.srcObject = stream;
        })
        .catch((err) => {
            console.log(err);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    displayWebFeed();

    const recordButton = document.getElementById('recordButton');
    const webCam = document.getElementById('videoElement');

    recordButton.addEventListener('click', () => {
        recording = !recording;
        if (recording) {
            webCam.play();
        }
        else {
            webCam.pause();
        }
    });

    webCam.addEventListener('play', () => {
        recordButton.innerText = "stop recording"
        recordButton.style.backgroundColor = '#d7220a';
        record();
    })
    webCam.addEventListener('pause', () => {
        recordButton.innerText = "Click to record"
        recordButton.style.backgroundColor = '#007bff';
        stopRecord();
    })

    
});