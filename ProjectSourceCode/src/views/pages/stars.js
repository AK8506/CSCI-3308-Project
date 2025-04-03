


function setStarRating(rating) {
    const starContainer = document.getElementById('star-rating');
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