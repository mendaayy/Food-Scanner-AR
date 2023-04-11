// Get the necessary DOM elements
const video = document.getElementById('camera');
const captureButton = document.getElementById('button');

// Define Logmeal Scanner API
const apiUrl = 'https://api.logmeal.es/v2/image/segmentation/complete/v1.0?language=eng';
const token = '57b77cd1e529e14ebd7f65691bf7be6b11632ad1';

// Define Spoonacular Recipe API
const apiKey = "2cedbb7de10b4cf3914eebcfb525dfa1";

window.addEventListener("load", (event) => {
  camera();
})

// Access the camera and show the video stream
function camera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
      };
    })
    .catch(error => {
      console.error(error);
      throw new Error('Unable to access the camera');
    });
}

// Capture the image and send it to an API
captureButton.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  // Conver canvas image to blob
  canvas.toBlob(blob => {
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    const form = new FormData();

    form.append('image', file);

    // Send image to API
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    })
    .then(response => response.json())
    .then(data => {
      // Display api results and image
      displayResults(data, file);

      const popup = document.querySelector('.popup');
      popup.style.display = 'block';
    })
    .catch(error => {
      console.error(error);
      alert('An error occurred while processing the image.');
    });

  }, 'image/jpeg', 0.9);
});

// Display API request resuslts
function displayResults(data, file) {
  console.log(data);

  // Display uploaded image
  const imageUrl = URL.createObjectURL(file);
  document.getElementById('uploaded-image').setAttribute('src', imageUrl);

  // Reset ingredients list
  const foodList = document.getElementById('food-list');
  foodList.innerHTML = "";
  const uniqueFoods = new Set();

  // Display recognized food family names
  data.segmentation_results.forEach(segment => {
    const result = segment.recognition_results[0].name;

    // Check if food name is already in the list
    if (!uniqueFoods.has(result)) { 
      uniqueFoods.add(result);
       // Create a new list item element
      const li = document.createElement('li');

      // Create an image element for the ingredient and set its source and alt attributes
      const img = document.createElement('img');
      img.src = ''; // Set the initial source to an empty string

      // Add the image and food name to the list item
      li.appendChild(img);
      li.appendChild(document.createTextNode(result));

      // Add the list item to the food list
      foodList.appendChild(li);
    }
  });

  // Make a query to Spoonacular API for each recognized food name
  uniqueFoods.forEach(foodName => {
    fetch(`https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(foodName)}&apiKey=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        // Get the first result from the response
        const result = data.results[0];

        // Display the image of the ingredient
        const foodList = document.getElementById('food-list');
        const lis = foodList.querySelectorAll('li');

        for (const li of lis) {
          if (li.textContent.includes(foodName)) {
            const img = li.querySelector('img');
            img.src=`https://spoonacular.com/cdn/ingredients_100x100/${result.image}`;
          }
        }
      })
      .catch(error => {
        console.error(error);
      });
  });

  // Add an event listener to the close button
  const closeButton = document.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    // Remove the popup from the DOM
    const popup = document.querySelector('.popup');
    popup.style.display = 'none';

    // Remove the uploaded image and display the webcam video again
    const uploadedImage = document.getElementById('uploaded-image');
    uploadedImage.removeAttribute('src');
  });
}


