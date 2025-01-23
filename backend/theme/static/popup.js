import { getAllSensors, getSensorsByRoom } from './fetcher.js';

// Récupère les données des capteurs depuis l'API
async function getSensorData() {
    try {
        return await getAllSensors();
    } catch (error) {
        console.error('Erreur :', error);
        return {};
    }
}

// Récupère les données des capteurs pour une salle
function getRoomData(data, roomId) {
    if (data[roomId] && data[roomId].sensors) {
        return data[roomId].sensors;
    }
    return [];
}

// permet de récupérer la dernière valeur d'un champ spécifique
function getLatestValue(roomData, field) {
    const sensorData = roomData.find(sensor => sensor.field === field);
    return sensorData ? sensorData.value : null;
}

// Permet de récupérer les données pour une salle
async function fetchData(roomName) {
    // récupère les données
    const sensorData = await getSensorData();
    const roomData = getRoomData(sensorData, roomName);
    
    const realData = {
        temperature: getLatestValue(roomData, 'temperature'),
        humidity: getLatestValue(roomData, 'humidity')
    };

    // valeurs de test pour le développement ou si les données réelles ne sont pas disponibles
    const testData = {
        temperature: '-',
        humidity: '-'
    };

    // on formate les données pour les afficher
    const formattedData = {
        temperature: realData.temperature ? `${realData.temperature}°C` : testData.temperature,
        humidity: realData.humidity ? `${realData.humidity}%` : testData.humidity
    };

    return formattedData;
}

// Gère l'affichage de la fenêtre popup avec les informations de la salle
async function showPopupOnHover(element) {
    const popup = document.getElementById('popup');
    const roomName = element.getAttribute('data-room');

    // On va chercher les dernières données disponibles
    const data = await fetchData(roomName);

    if (!popup.classList.contains('fixed')){
        // On update le view avec les nouvelles données lorsque le pop-up n'est pas fixe
        document.getElementById('popup-title').innerText = `Données en ${roomName}`;
        document.getElementById('temp-value').innerText = data.temperature;
        document.getElementById('humidity-value').innerText = data.humidity;

        // On positionne la fenêtre popup juste à côté de l'élément cliqué
        const rect = element.getBoundingClientRect();
        popup.style.top = `${rect.top + window.scrollY + element.offsetHeight}px`;
        popup.style.left = `${rect.left + window.scrollX}px`;

        // On rend la fenêtre visible
        popup.style.display = 'block';

        updatePopupPosition(element, popup);

        const mouseMoveHandler = (event) => {
            if (!popup.classList.contains('fixed')){
                updatePopupPosition(event, popup);
            }
        };

        element.addEventListener('mousemove', mouseMoveHandler);

        element.addEventListener('mouseleave', () => {
            if (!popup.classList.contains('fixed')) {
                hidePopupOnHover();
            }
            element.removeEventListener('mousemove', mouseMoveHandler);
        });

        element.addEventListener('click', (event) => {
            event.stopPropagation();
            popup.classList.add('fixed');
            popup.style.top = `${event.pageY + 10}px`;
            popup.style.left = `${event.pageX + 10}px`;
            element.removeEventListener('mousemove', mouseMoveHandler);
        });
    }
}

// Masque la fenêtre popup quand on quitte une zone
function hidePopupOnHover() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
    popup.classList.remove('fixed');
}

// Mets à jour la position de la popup
function updatePopupPosition(event, popup) {
    const popupOffset = 10; // Décalage pour éviter que la popup soit directement sous le curseur
    popup.style.top = `${event.pageY + popupOffset}px`;
    popup.style.left = `${event.pageX + popupOffset}px`;
}

// Configuration des événements pour les zones sur SVG
document.querySelectorAll('path[data-room]').forEach(path => {
    path.addEventListener('mouseenter', () => showPopupOnHover(path));
});

// Ferme automatiquement la popup si on clique en dehors
document.addEventListener('click', (event) => {
    const popup = document.getElementById('popup');
    const isClickInside = popup.contains(event.target) || 
                         event.target.classList.contains('trigger-btn') || 
                         event.target.hasAttribute('data-room');
    if (!isClickInside) {
        hidePopupOnHover();
    }
});

// Ajoute la fonction de fermeture au bouton × de la popup
document.querySelector('.close-btn').addEventListener('click', () => hidePopupOnHover());