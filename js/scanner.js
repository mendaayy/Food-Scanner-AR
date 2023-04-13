// Get the necessary DOM elements
const video = document.getElementById('camera');
const captureButton = document.getElementById('button');

// Define Logmeal Scanner API
const apiUrl = 'https://api.logmeal.es/v2/image/segmentation/complete/v1.0?language=eng';
<<<<<<< HEAD
const token = '7b1ac7010d31534454cd5a339243581f65bda26a';
=======
const token = 'ac044268642dcdf2e2d73bd085c4e6408b2e7633';
>>>>>>> f3ff0c42b53ba62d505b7dc7c43c3c6d91f5cc42

// Define Spoonacular Recipe API
const apiKey = "2cedbb7de10b4cf3914eebcfb525dfa1";

window.addEventListener("load", (event) => {
  camera();
})

// Access the camera and show the video stream
function camera() {
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {
        exact: "user"
      }
    }
  })
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

    // Display uploaded image
    const imageUrl = URL.createObjectURL(file);
    document.getElementById('uploaded-image').setAttribute('src', imageUrl);

    const loadingIcon = document.getElementById('loading-icon');
    loadingIcon.style.display = 'block';

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
      const closeButton = document.querySelector('.close-button');
      const loadingIcon = document.getElementById('loading-icon');

      loadingIcon.style.display = 'none';
      popup.style.display = 'block';
      closeButton.style.display = 'block';
    })
    .catch(error => {
      console.error(error);
      alert('ERROR: Too many API requests');
    });

  }, 'image/jpeg', 0.9);
});

// Display API request resuslts
function displayResults(data, file) {
  console.log(data);

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
    }

    console.log(uniqueFoods)
  });

  // Save unique food names to local storage
  localStorage.setItem('uniqueFoods', JSON.stringify(Array.from(uniqueFoods)));

  uniqueFoods.forEach(foodName => {
    // Create a new list item element
    const li = document.createElement('li');
  
    // Create an image element for the ingredient and set its source and alt attributes
    const img = document.createElement('img');
    const div1 = document.createElement('div');
    const span = document.createElement('span');
    const div2 = document.createElement('div');
    const input = document.createElement('input');
    const removeBtn = document.createElement('button');
    const decreaseButton = document.createElement('button');
    const increaseButton = document.createElement('button');
    const pieces = document.createElement('span');
  
    span.innerHTML = foodName;
    removeBtn.innerHTML = "&times;";
    input.type = 'number';
    input.min = 1;
    input.value = 1;
    decreaseButton.innerHTML = "-";
    increaseButton.innerHTML = "+";
    pieces.innerHTML = "pieces";
    img.src = ''; // Set the initial source to an empty string
  
    // Add the image, food name, input and buttons to the list item
    div2.appendChild(decreaseButton);
    div2.appendChild(input);
    div2.appendChild(increaseButton);
    div2.appendChild(pieces);

    div1.appendChild(span);
    div1.appendChild(div2)

    li.appendChild(img);
    li.appendChild(div1);
    li.appendChild(removeBtn);

    removeBtn.classList.add("remove");
    div1.classList.add("food-row");
    div2.classList.add("input-group");
  
    // Add the list item to the food list
    foodList.appendChild(li);
  
    // Make a query to Spoonacular API for each recognized food name
    fetch(`https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(foodName)}&apiKey=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        // Get the first result from the response
        const result = data.results[0];
  
        // Display the image of the ingredient
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
  
    // Add an event listener to the decrease button
    decreaseButton.addEventListener('click', () => {
      if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
      }
    });

    // Add an event listener to the increase button
    increaseButton.addEventListener('click', () => {
      input.value = parseInt(input.value) + 1;
    });
  
    // Add an event listener to the "x" button
    removeBtn.addEventListener('click', () => {
      li.remove(); // Remove the list item from the food list
    });
  });
  
  // Add an event listener to the close button
  const closeButton = document.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    // Remove the popup from the DOM
    const closeButton = document.querySelector('.close-button');
    closeButton.style.display = 'none';
    const popup = document.querySelector('.popup');
    popup.style.display = 'none';

    // Remove the uploaded image and display the webcam video again
    const uploadedImage = document.getElementById('uploaded-image');
    uploadedImage.removeAttribute('src');
  });
}


