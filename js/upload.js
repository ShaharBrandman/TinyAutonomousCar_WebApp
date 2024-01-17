const resHeight = 800;
const resWidth = 600;

let canvas, ctx;

let canvasImage = new Image();
canvasImage.crossOrigin = 'anonymous'; //somehow this is possible with an imutable variable

canvasImage.onload = () => {
    const inputButtonLabel = document.getElementById('selectedImageTxt');
    if (inputButtonLabel) {
        inputButtonLabel.innerText = `Selected Image: ${canvasImage.alt}`
    }

    ctx.drawImage(canvasImage, 0, 0, 800, 600);
}

let x, y, px, py, w, h;
let isDrawing = false;

let selectedRect = [];

function updateSamplesDisplay() {
    const sampleContainer = document.getElementById('samplesContainer');
    sampleContainer.innerHTML = ''; //clear previous samples

    selectedRect.forEach((e) => {
        const imageTmp = new Image();

        imageTmp.src = e.data;
        imageTmp.crossOrigin = 'anonymous';

        imageTmp.alt = `x: ${e.x}, y: ${e.y}, w: ${e.w}, h: ${e.h}, label: ${e.label}`;

        sampleContainer.appendChild(imageTmp);
    })
}

function resetCanvas(removeBackgroundImage = false) {
    document.getElementById('samplesContainer').innerHTML = '';
    isDrawing = false;
    px, py, x, y, w, h = 0;
    selectedRect = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);  

    if (removeBackgroundImage == false) {
        ctx.drawImage(canvasImage, 0, 0, 800, 600);
    }
    else {  
        canvasImage = new Image();
        document.getElementById('selectedImageTxt').innerText = 'Selected Image: None';
    }
}

function uploadImageAndSelectedRect() {
    trainingDataRef.child(`Images/${canvasImage.alt}`).put(canvasImage.file, {
        contentType: 'image/jpeg'
    });

    selectedRect.forEach((face) => {
        trainingDataRef.child(`Metadata/${face.path}`).put(
            new Blob([JSON.stringify(face)]),{
                contentType: 'application/json'
            }
        );
    })
}

function drawMultipleRect(selectedRect) {
    ctx.beginPath();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasImage, 0, 0, 800, 600);

    selectedRect.forEach((e) => {
        ctx.rect(e.x, e.y, e.w, e.h);
        ctx.fillText(e.label, e.px, e.py);
        ctx.stroke();
    })

    // if (selectedRect.length >= 3) {
    //     console.log(canvas.toDataURL('image/jpeg'));
    // }

    updateSamplesDisplay();
}

function drawRect(x, y, w, h) {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasImage, 0, 0, 800, 600);
    ctx.rect(x, y, w, h);
    ctx.stroke();
}

function initRect(event) {
    px = event.pageX - canvas.offsetLeft;
    py = event.pageY - canvas.offsetTop;
}   

function moveRect(event) {
    x = event.pageX - canvas.offsetLeft;
    y = event.pageY - canvas.offsetTop;

    w = px - x;
    h = py - y;

    drawRect(x, y, w, h);
}

function saveRectToList() {
    if (isDrawing) {
        const label = prompt("Enter a label for the rectangle");

        if(label) {
            selectedRect.push({
            'label': label,
            'x': x,
            'y': y,
            'w': w,
            'h': h,
            'px': px,
            'py': py,
            'data': canvas.toDataURL('image/jpeg'), //image in bash64 format
            'alt': canvasImage.alt, //file name basically
            'path': `${canvasImage.alt}/${label}.json` //full path in firebase Metadata/ as root
            });

            //console.log(`new face: ${selectedRect[selectedRect.length - 1]}`);

            drawMultipleRect(selectedRect);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    displayAuthUsername();

    changeHeader();

    canvas = document.getElementById('canvasItself');

    if(canvas) {
        ctx = canvas.getContext('2d');

        document.getElementById('inputButton').addEventListener('change', (event) => {
            const file = event.target.files[0];
                    
            if (file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    canvasImage.src = e.target.result;
                    canvasImage.alt = file.name;
                    canvasImage.crossOrigin = 'anonymous';
                    canvasImage.file = file;
                };

                reader.readAsDataURL(file);
            
                console.log(`${file.name} has been upload to the canvas`)
            }
            else {
                console.error(`File doesn't exists for some reason`);
            }
        });

        document.getElementById('resetCanvasButton').addEventListener('click', () => {
            resetCanvas(true);
        });

        document.getElementById('removeDrawingButton').addEventListener('click', () => {
            resetCanvas();
        });

        document.getElementById('uploadSamplesButton').addEventListener('click', () => {
            if (canvasImage.src && selectedRect.length > 0) {
                uploadImageAndSelectedRect();
                resetCanvas(true);
            }
            else {
                alert('Cannot upload without any file');
            }
        });

        canvas.addEventListener('mousedown', (event) => {
            if (canvasImage.src) {
                isDrawing = true;
                initRect(event);
            }
        });

        canvas.addEventListener('mouseup', (event) => {
            if (canvasImage.src) {
                moveRect(event);
                saveRectToList(event);
                isDrawing = false;
            }
        });

        canvas.addEventListener('mouseleave', (event) => {
            if(canvasImage.src && isDrawing) {
                drawRect(x, y, w, h);
                saveRectToList(event);
                isDrawing = false;
            }
        });

        canvas.addEventListener('mousemove', (event) => {
            if (canvasImage.src && isDrawing) {
                moveRect(event);
            }
        })
    }
});