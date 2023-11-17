const form = document.querySelector("form");
const apiKey = "2b6b2c75790565a4f251171556ece413";
let cities = {};

function renderCityCard(city) {
  const { name, description, icon, temp, country, time } = city;
  const date = new Date(time * 1000);
  const now = new Date();
  const difference = Math.round((now - date) / 1000 / 60);
  const html = `
<div class="col" data-name="${name}, ${country}">
  <div class="city">
    <h2 class="city-name">
      <span>${name}</span>
      <span class="country-code">${country}</span>
      <i class="bi bi-x-circle-fill close-icon text-danger"></i>
    </h2>
    <div class="city-temp">${temp}<sup>°F</sup></div>
    <figure>
      <img
        src="https://openweathermap.org/img/wn/${icon}@2x.png"
        class="city-icon"
        alt="icon"
      />
      <figcaption>${description}</figcaption>
    </figure>
    <div class="card-footer">
      <small class="text-body-secondary"
        >Last updated ${difference} mins ago</small
      >
    </div>
  </div>
</div>
  `;

  document.querySelector(".cities").insertAdjacentHTML("beforeend", html);
}

function renderError(message) {
  document.querySelector(".error-message").textContent = message;
}

async function getData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  try {
    const res = await axios.get(url);
    console.log(res.data);

    const cityAndCounty = res.data.name + ", " + res.data.sys.country;

    console.log(cityAndCounty);

    if (!cities[cityAndCounty]) {
      // cities[cityAndCounty] = res.data;
      cities[cityAndCounty] = {
        description: res.data.weather[0].description,
        icon: res.data.weather[0].icon,
        temp: res.data.main.temp,
        country: res.data.sys.country,
        name: res.data.name,
        time: res.data.dt,
      };

      console.log(cities);

      localStorage.setItem("cities", JSON.stringify(cities));
      renderCityCard(cities[cityAndCounty]);
    } else {
      throw new Error(`${city} is already in your card list`);
    }
  } catch (err) {
    console.log(err.message);
    renderError(err.message);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  renderError("");
  const city = form.querySelector(".header__input").value;
  form.reset();

  getData(city);
});

document.querySelector(".cities").addEventListener("click", (e) => {
  console.log(e.target);
  if (e.target.classList.contains("close-icon")) {
    const card = e.target.closest(".col");
    console.log(card);
    const city = card.dataset.name;
    console.log(city);
    delete cities[city];
    console.log(cities);
    card.remove();
    localStorage.setItem("cities", JSON.stringify(cities));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const cities = JSON.parse(localStorage.getItem("cities")) || {};
  console.log(cities);
  Object.keys(cities).map((item) => {
    getData(item);
  });
});

setInterval(() => {
  document.querySelector(".cities").innerHTML = "";
  Object.values(cities).map((item) => {
    renderCityCard(item);
  });
}, 10000);
