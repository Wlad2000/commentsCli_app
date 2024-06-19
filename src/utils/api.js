

/** Func Returns weatherDataHourlyDayForecast
 * @param {number,number} latitude, longitude 
 * @example
 * fetchWeather(40,40) //return { data.... };
 */
const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=21&longitude=-122&current_weather=true&daily=sunrise,sunset`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  };
  
  export { fetchWeather };
  