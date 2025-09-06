import { getWeatherData, parseWeatherData } from "./api";
import { createWeatherUI } from "./ui";

export function mountController(root) {
  const ui = createWeatherUI(root);
  const form = root.querySelector("#location-form");
  const input = root.querySelector("#location-input");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const location = input.value.trim();
    if (!location) return;
    ui.hideError();
    ui.showLoading();
    setTimeout(async () => {
      try {
        const raw = await getWeatherData(location);
        const mapped = parseWeatherData(raw);
        root.appendChild(
          ui.createWeatherHeader({
            locationName: mapped.locationName,
            currentTimeEpoch: mapped.currentTimeEpoch,
            currentTempC: mapped.currentTempC,
            icon: mapped.icon,
            description: mapped.description,
            currentCondition: mapped.currentCondition,
            feelsLikeTempC: mapped.feelsLikeTempC,
          })
        );
        root.appendChild(
          ui.createAdditionalInfo({
            sunriseTime: mapped.sunriseTime,
            sunsetTime: mapped.sunsetTime,
            visibilityKm: mapped.visibilityKm,
            humidityPct: mapped.humidityPct,
            windSpeedKph: mapped.windSpeedKph,
            windDirectionDeg: mapped.windDirectionDeg,
          })
        );
        root.appendChild(ui.createForecastCards(mapped.forecast));
      } catch (error) {
        ui.showError(error);
      } finally {
        ui.hideLoading();
      }
    }, 1000);
  });
}
