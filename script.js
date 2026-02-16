document.addEventListener("DOMContentLoaded", () => {
	const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=40.2033&longitude=-8.4103&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto";

	fetchWeatherData();

	// Fetch delle informazioni tramite API Open-Meteo
	function fetchWeatherData() {
		fetch(API_URL)
			.then(response => response.json())
			.then(data => {
				updateCurrentWeather(data.current);
				updateHourlyForecast(data.hourly);
				updateDailyForecast(data.daily);
			})
			.catch(error => {
				console.error("Error fetching weather data:", error);
				document.getElementById("current-location").textContent = "Error loading data";
			});
	}

	// Aggiornamento previsioni attuali
	function updateCurrentWeather(current) {
		document.getElementById("current-temp").textContent = `${Math.round(current.temperature_2m)}°`;
		document.getElementById("current-location").textContent = "Coimbra, Portugal";
		document.getElementById("current-icon").innerHTML = getWeatherIcon(current.weather_code, 100);
	}

	// Aggiornamento previsioni orarie
	function updateHourlyForecast(hourly) {
		const container = document.getElementById("hourly-container");
		const carouselId = "hourly";

		const hourlyData = [];

		for (let i = 0; i < 24; i++) {
			const time = new Date(hourly.time[i]);

			hourlyData.push({
				temp: Math.round(hourly.temperature_2m[i]),
				code: hourly.weather_code[i],
				time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				label: "today"
			});
		}

		renderCarousel(container, hourlyData, carouselId, "hourly");
	}

	// Aggiornamento previsioni giornaliere
	function updateDailyForecast(daily) {
		const container = document.getElementById("daily-container");
		const carouselId = "daily";

		const dailyData = [];

		for (let i = 0; i < daily.time.length; i++) {
			const date = new Date(daily.time[i]);
			const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

			dailyData.push({
				min: Math.round(daily.temperature_2m_min[i]),
				max: Math.round(daily.temperature_2m_max[i]),
				code: daily.weather_code[i],
				label: dayName
			});
		}

		renderCarousel(container, dailyData, carouselId, "daily");
	}

	// Rendering del carosello
	function renderCarousel(container, data, carouselId, type) {
		container.innerHTML = "";
		const itemsPerPage = 5;
		const totalPages = Math.ceil(data.length / itemsPerPage);

		data.forEach(item => {
			const div = document.createElement("div");
			div.className = "forecast-item";

			const icon = getWeatherIcon(item.code, 32);

			if (type === "hourly") {
				div.innerHTML = `
					<p>${item.temp}°</p>
					<div class="forecast-icon">${icon}</div>
					<p class="sub-text">${item.time}</p>
				`;
			} else {
				div.innerHTML = `
					<p>${item.max}° <span style="color:#bdc3c7">${item.min}°</span></p>
					<div class="forecast-icon">${icon}</div>
					<p class="sub-text">${item.label}</p>
				`;
			}
			container.appendChild(div);
		});

		setupDots(carouselId, totalPages, container);
	}

	// Gestione dei pallini
	function setupDots(carouselId, totalPages, container) {
		const dotsContainer = document.getElementById(`${carouselId}-dots`);
		dotsContainer.innerHTML = "";

		for (let i = 0; i < totalPages; i++) {
			const dot = document.createElement("div");
			dot.className = "dot";
			if (i === 0) dot.classList.add("active");

			dot.addEventListener("click", () => {
				scrollToPage(container, i, dotsContainer);
			});

			dotsContainer.appendChild(dot);
		}
	}

	// Scorrimento del carosello
	function scrollToPage(container, pageIndex, dotsContainer) {
		const offset = -(pageIndex * 100);
		container.style.transform = `translateX(${offset}%)`;

		const dots = dotsContainer.querySelectorAll(".dot");
		dots.forEach((dot, index) => {
			if (index === pageIndex) dot.classList.add("active");
			else dot.classList.remove("active");
		});
	}

	// Gestione delle icone
	function getWeatherIcon(code, size) {
		let iconName = "cloud";
		let color = "#7f8c8d";

		// Mappatura codici WMO (Open-Meteo) a Material Icons

		// 0: Ciel sereno
		if (code === 0) {
			iconName = "wb_sunny";
			color = "#f1c40f";
		}
		// 1-3: Nuvoloso, parzialmente nuvoloso
		else if (code >= 1 && code <= 3) {
			iconName = "cloud";
			color = "#95a5a6";
		}
		// 45, 48: Nebbia
		else if (code === 45 || code === 48) {
			iconName = "foggy";
			color = "#bdc3c7";
		}
		// 51-57: Pioviggine
		else if (code >= 51 && code <= 57) {
			iconName = "grain";
			color = "#3498db";
		}
		// 61-67: Pioggia
		else if (code >= 61 && code <= 67) {
			iconName = "water_drop";
			color = "#2980b9";
		}
		// 71-77: Neve
		else if (code >= 71 && code <= 77) {
			iconName = "ac_unit";
			color = "#ecf0f1";
		}
		// 80-82: Rovesci di pioggia
		else if (code >= 80 && code <= 82) {
			iconName = "grain";
			color = "#3498db";
		}
		// 85-86: Rovesci di neve
		else if (code === 85 || code === 86) {
			iconName = "ac_unit";
			color = "#00d2ff";
		}
		// 95-99: Temporale
		else if (code >= 95 && code <= 99) {
			iconName = "thunderstorm";
			color = "#8e44ad";
		}

		return `<span class="material-icons" style="font-size: ${size}px; color: ${color}; user-select: none;">${iconName}</span>`;
	}
});
