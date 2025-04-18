


function setStarRating_xl(rating, star_Container) {
    const starContainer = document.getElementById(star_Container);
    starContainer.innerHTML = '';
    for (let i = 0; i < Math.floor(rating); i++) {
        starContainer.innerHTML += '<i class="fa-solid fa-star fa-2xl" style="color: #FFD43B;"></i>';
    }
    if (rating % 1 !== 0) {
        starContainer.innerHTML += '<i class="fa-solid fa-star-half-stroke fa-2xl" style="color: #FFD43B;"></i>';
    }
    for (let i = 0; i < 5 - Math.floor(rating) - (rating % 1 !== 0); i++) {
        starContainer.innerHTML += '<i class="fa-regular fa-star fa-2xl" style="color: #FFD43B;"></i>';
    }
}

function setStarRating_large(rating, star_Container) {
    const starContainer = document.getElementById(star_Container);
    starContainer.innerHTML = '';
    for (let i = 0; i < Math.floor(rating); i++) {
        starContainer.innerHTML += '<i class="fa-solid fa-star fa-xl" style="color: #FFD43B;"></i>';
    }
    if (rating % 1 !== 0) {
        starContainer.innerHTML += '<i class="fa-solid fa-star-half-stroke fa-xl" style="color: #FFD43B;"></i>';
    }
    for (let i = 0; i < 5 - Math.floor(rating) - (rating % 1 !== 0); i++) {
        starContainer.innerHTML += '<i class="fa-regular fa-star fa-xl" style="color: #FFD43B;"></i>';
    }
}

function setStarRating_med(rating, star_Container) {
    const starContainer = document.getElementById(star_Container);
    starContainer.innerHTML = '';
    for (let i = 0; i < Math.floor(rating); i++) {
        starContainer.innerHTML += '<i class="fa-solid fa-star fa-lg" style="color: #FFD43B;"></i>';
    }
    if (rating % 1 !== 0) {
        starContainer.innerHTML += '<i class="fa-solid fa-star-half-stroke fa-lg" style="color: #FFD43B;"></i>';
    }
    for (let i = 0; i < 5 - Math.floor(rating) - (rating % 1 !== 0); i++) {
        starContainer.innerHTML += '<i class="fa-regular fa-star fa-lg" style="color: #FFD43B;"></i>';
    }
}