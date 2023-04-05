

const video = document.getElementById('camera-view');
const captureButton = document.getElementById('capture-button');
const fileInput = document.getElementById('file-input');

// Access the camera and show the video stream
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
.then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
    video.play();
    };
})
.catch(error => {
    console.error(error);
});

// Capture the image and send it to an API
captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    const form = new FormData();

    form.append('image', file);

    // Send the captured image to the API
    const apiUrl = 'https://api.logmeal.es/v2/image/segmentation/complete/v1.0?language=eng';
    const token = 'dd5e0ea7e5d892464cce19c83609f2d1b341720a';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: form
    })
    .then(response => response.json())
    .then(data => {
        // Log results
        console.log(data); 

        // Display uploaded image
        const imageUrl = URL.createObjectURL(file);
        document.getElementById('uploaded-image').setAttribute('src', imageUrl);

        // Reset ingredients list
        document.getElementById('food-list').innerHTML = "";
        const uniqueFoods = new Set();
        
            // Display recognized food family names
        data.segmentation_results.forEach(segment => {
            let result = segment.recognition_results[0].name;

            // Check if food name is already in the list
            if (!uniqueFoods.has(result)) { 
                uniqueFoods.add(result);
                document.getElementById('food-list').innerHTML += `<li>${result}</li>`;
            }

        });
    })
    .catch(error => {
        console.error(error); 
    });

    }, 'image/jpeg', 0.9);
});

/*

const jsonUrl = 'ing.json';

// Use fetch to load the contents of the JSON file
fetch(jsonUrl)
.then(response => response.json())
.then(data => {
    // Use the data in your application
    console.log(data);

    const uniqueFoods = new Set();
        
    data.segmentation_results.forEach(segment => {
        let result = segment.recognition_results[0].name;

        if (!uniqueFoods.has(result)) { // Check if food name is already in the list
            uniqueFoods.add(result);
            document.getElementById('food-list').innerHTML += `<li>${result}</li>`;
        }

    });
})
.catch(error => {
    // Handle errors here
    console.error(error);
});

*/