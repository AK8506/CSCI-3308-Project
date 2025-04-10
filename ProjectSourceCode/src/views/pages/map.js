
let map;

export async function initMap(lattitude, longitude) {
    
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    

    map = new Map(document.getElementById("map"), {
        center: { lat: lattitude, lng: longitude },
        zoom: 12,
        mapId: "MOUNTAIN_MAP",
    });
    new google.maps.marker.AdvancedMarkerElement({
        position: { lat: lattitude, lng: longitude },
        map: map,
        title: "Mountain Location"
    });
}

