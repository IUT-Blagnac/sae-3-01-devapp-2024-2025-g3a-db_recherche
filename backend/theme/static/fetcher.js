// URL de base pour l'API
const apiURL = 'http://localhost:8000/api'

// Objets globaux pour stocker les données
let allSensors = {}
let sensorTypes = {}
let roomSensors = {}

// Permet de récupérer tous les sensors depuis l'API
async function fetchAllSensors() {
    try {
        const response = await fetch(`${apiURL}/sensors`)
        allSensors = await response.json()
        return allSensors
    } catch (error) {
        console.error('Erreur :', error)
        return {}
    }
}

// Permet de récupérer les sensors pour une salle depuis l'API
async function fetchSensorsByRoom(roomId, sensorId, sensorType, field, startTime, endTime) {
    try {
        // on construit l'URL de l'API en fonction des paramètres
        let url = `${apiURL}/sensors/${roomId}`
        let params = []
        
        // ajout des paramètres si ils sont définis
        if (sensorId) params.push(`sensor_id=${sensorId}`)
        if (sensorType) params.push(`sensor_type=${sensorType}`)
        if (field) params.push(`field=${field}`)
        if (startTime) params.push(`start_time=${startTime}`)
        if (endTime) params.push(`end_time=${endTime}`)
        
        // si il y a des paramètres on les ajoute à l'URL
        if (params.length > 0) {
            url += '?' + params.join('&')
        }

        const response = await fetch(url)
        return await response.json()
    } catch (err) {
        console.error(`Erreur pour la salle ${roomId}:`, err)
        return {}
    }
}

// Va chercher la liste des types de sensor depuis l'API
async function fetchSensorTypes() {
    try {
        const response = await fetch(`${apiURL}/sensors_types`)
        sensorTypes = await response.json()
        return sensorTypes
    } catch (err) {
        console.error('Erreur :', err)
        return {}
    }
}

// Permet de récupérer tous les sensors
async function getAllSensors() {
    return allSensors
}

// Permet de récupérer les sensors pour une salle
async function getSensorsByRoom(roomId, sensorId, sensorType, field, startTime, endTime) {
    roomSensors[roomId] = await fetchSensorsByRoom(roomId, sensorId, sensorType, field, startTime, endTime)
    return roomSensors[roomId]
}

// Va chercher la liste des types de sensor
async function getSensorTypes() {
    return sensorTypes
}

// ---- Exemples d'utilisations ----
// Cette partie pourrait potentiellement être enlevée quand Esteban implémentera sa récupération automatique

// pour tous les capteurs
function fetchAllSensorsPeriodically(callback) {
    // premier appel est immédiat
    getAllSensors().then(data => callback(data))
    
    // puis toutes les 10 secondes
    return setInterval(async () => {
        await fetchAllSensors()
        callback(allSensors)
    }, 10000)
}

// pour une salle spécifique
function fetchRoomSensorsPeriodically(roomId, callback) {
    // premier appel est immédiat
    getSensorsByRoom(roomId).then(data => callback(data))
    
    // puis toutes les 10 secondes
    return setInterval(async () => {
        await fetchSensorsByRoom(roomId)
        callback(roomSensors[roomId])
    }, 10000)
}

// pour les types de capteurs
function fetchSensorTypesPeriodically(callback) {
    // premier appel est immédiat
    getSensorTypes().then(data => callback(data))
    
    // puis toutes les 5 minutes
    return setInterval(async () => {
        await fetchSensorTypes()
        callback(sensorTypes)
    }, 5 * 60 * 1000)
}

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', async () => {
    try {
        
        // on fait un premier fetch pour initialiser les données
        await fetchAllSensors()
        
        // fetch des types de capteurs
        await fetchSensorTypes()
        
        // update des données toutes les 10 secondes
        fetchAllSensorsPeriodically((data) => {})
        
        fetchSensorTypesPeriodically((data) => {})
        
    } catch (error) {
        console.error('Erreur : ', error)
    }
})

// export des fonctions
export {
    getAllSensors,
    getSensorsByRoom,
    getSensorTypes,
    fetchAllSensorsPeriodically,
    fetchRoomSensorsPeriodically,
    fetchSensorTypesPeriodically
}