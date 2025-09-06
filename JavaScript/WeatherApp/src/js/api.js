//Items to be displayed
/*
- Location Name ->{ address: }
- Current Time -> {datetimeEpoch}
- Current Condition -> {conditions}
- Current Temperature (Celsius) -> {temp}
- Feels Like Temperature (Celsius) -> {feelsLike}
- Sunrise Time -> {sunrise}
- Sunset Time -> {sunset}
- Visibility -> {visibility}
- Humidity -> {humidity}
- Wind Speed -> {windspeed}
- Get ICON for weather -> {icon}
- Description of weather -> {description}
- 7 Day Forecast (Day, Condition,Temp, High Temp, Low Temp, Icon) -> {days: [{datetime, conditions, temp, tempmax, tempmin, icon}]}
*/
export async function getWeatherData(location) {
  const loc = String(location || "").trim();
  if (!loc) throw new Error("Please enter a location.");
  // eslint-disable-next-line no-undef
  const apiKey = process.env.WEATHER_API_KEY;
  // eslint-disable-next-line no-undef
  const baseUrl = process.env.DEFAULT_WEATHER_URL;

  if (!apiKey || !baseUrl) {
    throw new Error("Missing API config. Check WEATHER_API_KEY and DEFAULT_WEATHER_URL.");
  }
  const qs = new URLSearchParams({
    unitGroup: "metric",
    key: apiKey,
    contentType: "json",
  });
  const url = `${baseUrl}/${location}?${qs.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Bad request. Please check the location and try again.");
      }
      if (response.status === 403) {
        throw new Error("Access forbidden. Please check your API key.");
      }
      if (response.status === 404) {
        throw new Error("Location not found. Please enter a valid location.");
      }
      throw new Error(`Error fetching weather data: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // console.log("RAW DATA:", data); // Log the raw data for debugging
    return data;
  } catch (error) {
    throw new Error(`Network error: ${error.message}`);
  }
}

export function parseWeatherData(data) {
  if (!data || !data.currentConditions || !Array.isArray(data.days)) {
    throw new Error("Invalid data format");
  }
  const mappedData = {
    locationName: data.address || "Unknown Location",
    currentTimeEpoch: data.currentConditions.datetimeEpoch || "N/A",
    currentCondition: data.currentConditions.conditions || "N/A",
    currentTempC: data.currentConditions.temp || "N/A",
    description: data.description || "N/A",
    feelsLikeTempC: data.currentConditions.feelslike || "N/A",
    sunriseTime: data.currentConditions.sunrise || "N/A",
    sunsetTime: data.currentConditions.sunset || "N/A",
    visibilityKm: data.currentConditions.visibility || "N/A",
    humidityPct: data.currentConditions.humidity || "N/A",
    windSpeedKph: data.currentConditions.windspeed || "N/A",
    windDirectionDeg: data.currentConditions.winddir || "N/A",
    icon: data.currentConditions.icon || "N/A",
    forecast: data.days.slice(1, 8).map((day) => ({
      dateISO: day.datetime || "N/A",
      dateEpoch: day.datetimeEpoch || "N/A",
      condition: day.conditions || "N/A",
      tempMaxC: day.tempmax || "N/A",
      tempMinC: day.tempmin || "N/A",
      icon: day.icon || "N/A",
    })),
  };
  console.log("MAPPED DATA:", mappedData); // Log the mapped data for debugging
  return mappedData;
}

export function getWeatherIcon(iconName) {
  const map = {
    snow: "fa-snowflake",
    rain: "fa-cloud-rain",
    fog: "fa-smog",
    wind: "fa-wind",
    cloudy: "fa-cloud",
    "partly-cloudy-day": "fa-cloud-sun",
    "partly-cloudy-night": "fa-cloud-moon",
    "clear-day": "fa-sun",
    "clear-night": "fa-moon",
  };
  return `fa-solid ${map[iconName] || "fa-question"}`;
}
