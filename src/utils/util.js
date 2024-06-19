import Geolocation from '@react-native-community/geolocation';
/** Func Returns CurrentLocation 
 * @param 
 * @example
 * 
 */
const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            error => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    });
};

export { getCurrentLocation };