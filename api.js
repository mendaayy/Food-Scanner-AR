const apiUrl = 'https://api.logmeal.es/v2/image/segmentation/complete/v1.0?language=eng';
const token = 'dd5e0ea7e5d892464cce19c83609f2d1b341720a';
const fileInput = document.querySelector('#file-input');
let uniqueFoods = new Set();

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const form = new FormData();
    form.append('image', file);

    fetch(apiUrl, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`
    },
    body: form
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); 

        data.segmentation_results.forEach(segment => {
            let result = segment.recognition_results[0].name;
            if (!uniqueFoods.has(result)) { // Check if food name is already in the list
            uniqueFoods.add(result);
            document.getElementById('food-list').innerHTML += `<li>${result}</li>`;
            }
        });
    })
    .catch(error => {
        console.error(error); 
    });
});