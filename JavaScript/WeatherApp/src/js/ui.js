import { getWeatherIcon } from "./api";
export function createWeatherUI(root) {
  const q = (sel) => root.querySelector(sel);
  const loadingContainer = q("#loading");
  const loadingEl = q("[data-loading]");
  const errorEl = q("[data-error]");
  const showLoading = () => {
    loadingContainer?.classList.remove("hidden");
    loadingEl?.classList.remove("hidden");
  };
  const hideLoading = () => {
    if (!errorEl && !errorEl.classList.contains("hidden")) {
      loadingContainer?.classList.add("hidden");
    }
    loadingEl?.classList.add("hidden");
  };
  const showError = (error) => {
    loadingContainer.classList.remove("hidden");
    errorEl.textContent = error?.message || "Error fetching weather data. Please try again later.";
    errorEl.classList.remove("hidden");
    console.log(error);
    console.log(errorEl);
    console.log(loadingContainer);
  };
  const hideError = () => {
    loadingContainer?.classList.add("hidden");
    errorEl?.classList.add("hidden");
  };

  function createWeatherHeader({
    locationName,
    currentTimeEpoch,
    currentTempC,
    icon,
    description,
    currentCondition,
    feelsLikeTempC,
  }) {
    //Section
    let currentWeatherSection = q("#current-weather");
    if (currentWeatherSection) {
      currentWeatherSection.remove();
    }
    currentWeatherSection = createEl("section", { attrs: { id: "current-weather", tabindex: 0 } });
    //Weather Now Container
    const weatherContainer = createEl("div", { classes: ["weather-now-container"] });

    //Location
    const weatherLocation = createEl("h2", {
      attrs: { id: "weather-location" },
      text: locationName ?? "—",
    });
    //DateTime
    const dateTimeNow = createEl("p", {
      attrs: { id: "dateTime-now" },
      text: formatEpochToTime?.(currentTimeEpoch) ?? "—",
    });

    //Weather Now Details
    const weatherNow = createEl("div", { attrs: { id: "current-weather-data" } });

    const currentTemp = createEl("p", {
      attrs: { id: "current-temp" },
      text: `${currentTempC}°C`,
    });

    const currentConditionContainer = createEl("div", { attrs: { id: "current-condition" } });

    const conditionText = createEl("p", {
      attrs: { id: "current-condition-text" },
      text: currentCondition ?? "—",
    });
    const feelsLikeP = createEl("p");
    feelsLikeP.append(document.createTextNode("Feels Like "));
    const feelsLikeSpan = createEl("span", {
      attrs: { id: "feels-like-temp" },
      text: `${Number.isFinite(feelsLikeTempC) ? Math.round(feelsLikeTempC) : "—"}°C`,
    });
    feelsLikeP.append(feelsLikeSpan);
    currentConditionContainer.append(conditionText, feelsLikeP);
    weatherNow.append(currentTemp, currentConditionContainer);

    const weatherDescription = createEl("p", {
      attrs: { id: "current-description" },
      text: description ?? "",
    });
    weatherContainer.append(weatherLocation, dateTimeNow, weatherNow, weatherDescription);
    //Weather Icon
    const weatherIconContainer = createEl("div", { attrs: { id: "current-icon-container" } });
    const weatherIcon = document.createElement("i");
    weatherIcon.className = getWeatherIcon?.(icon) || ""; // fallback to empty if mapping missing
    weatherIcon.id = "current-icon"; // matches original HTML/CSS hooks
    weatherIcon.setAttribute("aria-hidden", "true");
    weatherIconContainer.appendChild(weatherIcon);
    currentWeatherSection.append(weatherContainer, weatherIconContainer);

    return currentWeatherSection;
  }
  function createAdditionalInfo(condition) {
    const { sunriseTime, sunsetTime, visibilityKm, humidityPct, windSpeedKph, windDirectionDeg } =
      condition;
    let section = q("#additional-info");
    if (section) {
      section.remove();
    }
    section = createEl("section", { attrs: { id: "additional-info", tabindex: 0 } });
    const sectionTitle = createEl("h3", { text: "Todays Weather Details" });
    const detailsContainer = createEl("div", {
      attrs: {
        id: "details-container",
      },
    });
    const sunriseCard = makeCard({
      id: "surise",
      icon: "fa-sun",
      label: "Sunrise",
      unitId: "sunrise-time",
      unit: timeTo12HourFormat(sunriseTime) || "—",
    });
    const sunsetCard = makeCard({
      id: "sunset",
      icon: "fa-moon",
      label: "Sunset",
      unitId: "sunset-time",
      unit: timeTo12HourFormat(sunsetTime) || "—",
    });
    const visibilityCard = makeCard({
      id: "visibility",
      icon: "fa-eye",
      label: "Visibility",
      unitId: "visibility-distance",
      unit: visibilityKm ? `${visibilityKm} km` : "—",
    });
    const humidityCard = makeCard({
      id: "humidity",
      icon: "fa-droplet",
      label: "Humidity",
      unitId: "humidity-level",
      unit: humidityPct ? `${humidityPct}%` : "—",
    });
    const windSpeedCard = makeCard({
      id: "wind-speed",
      icon: "fa-wind",
      label: "Wind Speed",
      unitId: "wind-speed-value",
      unit: windSpeedKph ? `${windSpeedKph} km/h` : "—",
    });
    const windDirCard = makeCard({
      id: "wind-direction",
      icon: "fa-location-arrow",
      label: "Wind Direction",
      unitId: "wind-direction-value",
      unit: windDirectionDeg ? `${windDirectionDeg}°` : "—",
    });
    detailsContainer.append(
      sunriseCard,
      sunsetCard,
      visibilityCard,
      humidityCard,
      windSpeedCard,
      windDirCard
    );
    section.append(sectionTitle, detailsContainer);
    return section;
  }
  const makeCard = ({ id, icon, label, unitId, unit }) => {
    const card = createEl("div", {
      classes: ["detail-card"],
      attrs: { id: id, tabindex: 0 },
    });
    const i = document.createElement("i");
    i.className = `fa-solid ${icon}`;
    if (icon) i.style.color = getIconColor(icon);
    const p = createEl("p", { text: label });
    const span = createEl("span", { attrs: { id: unitId }, text: unit });
    card.append(i, p, span);
    return card;
  };
  function getIconColor(iconName) {
    if (!iconName) return null;
    if (iconName.includes("fa-location-arrow")) {
      return "#fb6124"; // specific color for wind direction arrow
    } else if (iconName.includes("fa-wind")) {
      return "#6682f6"; // specific color for wind icon
    } else if (iconName.includes("fa-droplet")) {
      return "#3b82f6"; // specific color for humidity icon
    } else if (iconName.includes("fa-eye")) {
      return "#65baff"; // specific color for visibility icon
    } else if (iconName.includes("fa-moon")) {
      return "#fb923c"; // specific color for moon icon
    } else if (iconName.includes("fa-sun")) {
      return "#ffd700"; // specific color for sun icon
    } else {
      return "#ffffff";
    }
  }
  function createForecastCards(forecasts) {
    let section = q("#forecast");

    if (section) {
      section.remove();
    }
    section = createEl("section", { attrs: { id: "forecast" }, tabindex: 0 });
    const title = createEl("h3", { text: "7-Day Forecast" });
    const cardsContainer = createEl("div", { attrs: { id: "forecast-container" } });
    forecasts.forEach((day) => {
      const card = createForecastCard(day);
      cardsContainer.appendChild(card);
    });
    section.append(title, cardsContainer);
    return section;
  }
  function createForecastCard(day) {
    const card = createEl("div", { classes: ["forecast-card"], attrs: { tabindex: 0 } });
    const forecastDay = createEl("div", { classes: ["forecast-day"] });
    const Day = createEl("h4", { text: toRelativeDay(day.dateEpoch) || "—" });
    const icon = document.createElement("i");
    icon.className = getWeatherIcon?.(day.icon) || "";
    icon.setAttribute("aria-hidden", "true");
    const condition = createEl("p", { text: day.condition || "—" });
    forecastDay.append(Day, icon, condition);
    const forecastTemp = createEl("div", { classes: ["forecast-temps"] });
    const minTemp = createEl("span", {
      classes: ["day-min"],
      text: day.tempMinC != null ? `${Math.round(day.tempMinC)}°C` : "Min: —",
    });
    const TempSliderContainer = createEl("div", { classes: ["temp-slider-container"] });
    const tempSlider = createEl("span", { classes: ["temp-slider"] });
    TempSliderContainer.appendChild(tempSlider);
    const maxTemp = createEl("span", {
      classes: ["day-max"],
      text: day.tempMaxC != null ? `${Math.round(day.tempMaxC)}°C` : "Max: —",
    });
    forecastTemp.append(minTemp, TempSliderContainer, maxTemp);
    card.append(forecastDay, forecastTemp);
    return card;
  }
  // === Helper functions ===
  const formatEpochToTime = (epoch) => {
    if (!epoch) return "";
    const date = new Date(epoch * 1000);
    return date.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toRelativeDay = (epoch) => {
    if (!epoch) return "";
    const date = new Date(epoch * 1000);
    const today = new Date();
    const diffTime = date.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };
  function createEl(tag, { classes = [], attrs = {}, text, html } = {}) {
    const node = document.createElement(tag);
    if (classes.length) node.classList.add(...classes);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (text != null) node.textContent = text;
    if (html != null) node.innerHTML = html;
    return node;
  }
  function timeTo12HourFormat(timeStr) {
    if (!timeStr) return "—";
    const [hour, minute] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  }

  return {
    showLoading,
    hideLoading,
    showError,
    hideError,
    createWeatherHeader,
    createAdditionalInfo,
    createForecastCards,
  };
}
