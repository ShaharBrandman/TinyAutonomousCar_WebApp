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

class WebCam {
    static webCamStream;
    constructor() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                WebCam.webCamStream = stream;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    displayCameraFeed() {
        const video = document.querySelector("#videoElement");
        video.srcObject = WebCam.webCamStream;
    }

    hideCameraFeed() {
        const video = document.querySelector("#videoElement");
        video.srcObject = null;
    }
}

const wc = new WebCam();

//simply clear the previous imagesDiv content and display new one
//display nothing if there's no dataset selected
function updateImagesDiv() {
    const imagesDiv = document.getElementById('imagesDiv');
    imagesDiv.innerText = '';
    
    if (currentImages.length > 0) {
        for(let e of currentImages) {
            const newImage = new Image();
            newImage.crossOrigin = 'anonymous';
            newImage.src = e;
            imagesDiv.append(newImage);
        }
    }
    else {
        const p = document.createElement('p');
        p.innerText = 'No Images yet';
        imagesDiv.append(p);
    }
}

//display the datasets in the folderDiv after clearing the previous content
function updateFoldersDiv() {
    const foldersDiv = document.getElementById('folderDiv');
    foldersDiv.innerHTML = '';

    for(let e of datasets) {
        const newDataset = document.createElement('div');
        newDataset.id = 'folderItem';

        const datasetThumbnail = new Image();

        datasetThumbnail.addEventListener('click', () => {
            currentImages = e['images'];
            updateImagesDiv();
            currentImages = [];
        });
        datasetThumbnail.crossOrigin = 'anonymous';
        datasetThumbnail.src = e['images'][e['images'].length - 1]; 
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
        count.innerText = e['images'].length;
        newDataset.append(count);
        
        foldersDiv.append(newDataset);
    }
}

//a function to record the webcam feed every 50ms second if recording
function record() {
    if (recording) {
        const videoFeed = document.getElementById('videoElement');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
            
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
            
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg');
        
        if (imageData.startsWith('data:image/jpeg;base64,')) {
            currentImages.push(imageData);
        }
        
        updateImagesDiv();

        setTimeout(record, 50);
    }
}

//ask the user for label and type until the values are valid
//then reset the imagesDiv and update the foldersDiv with the new dataset
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
        return Swal.fire({
            title: "Submit the Type the new dataset",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: false,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: true
        }).then((t) => {
            return {'label': label.value, 'type': t.value};
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
                return stopRecord();
            });
        }
    });
}

function convertB64ToBlob(b64Image) {
    let byteCharacters;
    if (b64Image.startsWith('data:image/jpeg;base64,')) {
        byteCharacters = atob(b64Image.split(',')[1]);
    } else {
        throw new Error('Base64 string is not correctly formatted.');
    }

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
}
function uploadDatasetsToFirebase() {
    if (datasets.length <= 0) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Cannot upload without any datasets",
            showConfirmButton: true,
            timer: 1500
          });
    }
    else {
        try {
            for(let d of datasets) {
                trainingDataRef
                    .child(`${d['type']}-${d['label']}`)
                    .listAll()
                    .then((res) => {
                        const existingImagesCount = res.items.length;
            
                        for (let i in d['images']) {
                            const index = Number(i) + existingImagesCount; // Adjust index to avoid overwriting
                            
                            trainingDataRef.child(`${d['type']}-${d['label']}/${index}.jpeg`).put(convertB64ToBlob(d['images'][i]), {
                                contentType: 'image/jpeg'
                            }).catch((err) => { throw err });
                    }
                });
            }
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Datasets has been uploaded",
                showConfirmButton: true,
                timer: 1500
            });

            wc.hideCameraFeed();
            currentImages = [];
            datasets = [];
            updateImagesDiv();
            updateFoldersDiv();
        }
        catch(err) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: err,
                showConfirmButton: true,
                timer: 1500
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayAuthUsername();
    changeHeader();

    const recordButton = document.getElementById('recordButton');
    const uploadButton = document.getElementById('uploadButton');
    const webCam = document.getElementById('videoElement');

    recordButton.addEventListener('click', () => {
        recording = !recording;
        if (recording) {
            wc.displayCameraFeed();
            webCam.play();
            record();
        }
        else {
            webCam.pause();
            wc.hideCameraFeed();
            stopRecord();
        }
    });

    uploadButton.addEventListener('click', uploadDatasetsToFirebase);
});
