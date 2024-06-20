const form = document.querySelector('form');
//! API Key is encrypted.
const apiKey = 'Ù¾ÙÎùïÝ9ë¸nu×½yç§{w';
let cities = {};

//! function to render city card. Requires city object that contains all the data.
function renderCityCard(city) {
  //? destructure city object
  const { name, description, icon, temp, country, time, state, id } = city;

  //? convert time to date object
  const date = new Date(time * 1000);
  const now = new Date();
  //? calculate difference in minutes to see how long ago the data was updated
  const difference = Math.round((now - date) / 1000 / 60);

  //? create html for the card
  const html = `
<div class="col" data-id="${id}">
  <div class="city">
    <h2 class="city-name">
      <span>${name}</span>
      <span class="country-code">${state ? state : ''} ${country}</span>
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

  //? insert the html into the cities container.
  //* Instead of using appendChild, we use insertAdjacentHTML to insert the html at the end of the container.
  //* 'beforeend' is the position where the html will be inserted.
  //* the difference between appendChild and insertAdjacentHTML is appendChild is for appending existing NODEs as children to a parent node.
  //* insertAdjacentHTML is for inserting HTML parsed from a string at a specific position relative to an element.
  document.querySelector('.cities').insertAdjacentHTML('beforeend', html);
}

//! function to render error message.
function renderError(message) {
  document.querySelector('.error-message').textContent = message;
}

//! function to get data from the API.
async function getData(city, isId = false) {
  //? url to get data from the API.
  //? we can fetch data by city name or by city id.
  //? when user searches a new city, isId is false, and this function makes a request to fetch data by city name.
  //? when user refreshes the page, isId is true, and this function makes a request to fetch data by city id. As we store city data in localstorage with city id as key, this is how we know which data to fetch.
  //* if isId is false, the url is for getting data by city name. By default isId is false.
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${btoa(
    apiKey
  )}&units=imperial`;

  //* if isId is true, the url is for getting data by id.
  if (isId) {
    url = `https://api.openweathermap.org/data/2.5/weather?id=${city}&appid=${btoa(
      apiKey
    )}&units=imperial`;
  }

  try {
    const res = await axios.get(url);
    console.log(res.data);
    const id = res.data.id;

    //? we need to check if the city is already in the cities object.
    //? There is an extra case here! if isId is true, we don't want to check if the city is already in the cities object. This means that we are in refresh mode and the city is already in the cities object.
    if (cities[id] && !isId)
      throw new Error(`${city} is already in your card list`);

    //? API is sending a lot of data. We don't need all the incoming data. We select the data that we need. And create a new entry into the cities object.
    cities[id] = {
      state: cities[id]?.state,
      description: res.data.weather[0].description,
      icon: res.data.weather[0].icon,
      temp: res.data.main.temp,
      country: res.data.sys.country,
      name: res.data.name,
      time: res.data.dt,
      id,
    };

    //? city input entered by user can contain city, state, and country separated by comma.
    const cityParams = city.split(',');

    //? API does not contain any state data. Just city and country.
    //? So we need to check if the city input contains state and country. If it does, we add it to the cities object.
    //? Why we need this. There are some cities in the US with the same name. To specify the exact city we need to store the state data by ourselves.
    //? example: there are 2 Portland cities in the US:
    //? "Portland, OR, US" and "Portland, MA, US". OR is Oregon and MA is Maine
    //? if user searches for just portland it finds the more famous one as Portland, OR, US

    if (cityParams.length > 2) {
      cities[id].state = cityParams[1];
    }

    console.log(cities);

    //? save the cities object to localstorage.
    localStorage.setItem('cities', JSON.stringify(cities));
    //? render the city card.
    renderCityCard(cities[id]);
  } catch (err) {
    //? if error, render the error message.
    console.log(err.message);
    renderError(err.message);
  }
}

//! event listener for the form submit event. If user seachs a city name, the form is submitted and this event listener is triggered.
form.addEventListener('submit', (e) => {
  e.preventDefault();
  //? if there are any previous error we clear the previous error messages
  renderError('');
  //? get the city name from the form
  const city = form.querySelector('.header__input').value;
  //? reset the form
  form.reset();
  //? get the data from the API
  getData(city);
});

//! event listener for the cities container. If user clicks any place inside the cities container, the event listener is triggered.
document.querySelector('.cities').addEventListener('click', (e) => {
  console.log(e.target);

  //? if the clicked element has the close-icon class, this means that user wants to remove that city card and we remove the city from the cities object and the cities container.
  if (e.target.classList.contains('close-icon')) {
    //? get the closest parent element with the col class. This is the city card.
    const card = e.target.closest('.col');
    console.log(card);
    //? each HTML City Card contains a data attribute with the city id as we did so in card render function.
    //? get the city id from the data attribute
    const cityId = card.dataset.id;
    console.log(cityId);
    //? remove the city from the cities object
    delete cities[cityId];
    console.log(cities);
    //? remove the city card from the cities container
    card.remove();
    //? save the updated cities object to localstorage
    localStorage.setItem('cities', JSON.stringify(cities));
  }
});

//! event listener for the DOMContentLoaded event. This event is triggered when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and other subresources to finish loading.
document.addEventListener('DOMContentLoaded', () => {
  //? get the cities from localstorage and parse it to an object. If there are no cities, we create an empty object.
  cities = JSON.parse(localStorage.getItem('cities')) || {};
  console.log(cities);
  //? Loop over cities object and call getData function with the city id = true, as we store cities in localstorage with city id as key.
  //? This getData function fetches the lates weather information and create a city card..
  Object.keys(cities).map((item) => {
    getData(item, true);
  });
});

//! event listener for the setInterval function. This function is triggered every 10 seconds.
setInterval(() => {
  //? clear the cities container
  document.querySelector('.cities').innerHTML = '';
  //? loop over the cities object and render the city cards again.
  //? This time we use renderCityCard function to render the city cards. And we are not making any API calls. We are using the data from the cities object that we already have. Just want to see how old is this data.
  //? Instead we can use getData function to fetch the latest data from the API and update the cities object. However, the API we use is free, it has some limits. Not sure but for example 60 requests per hour maybe. If we fetch data every 10 seconds, we can make 600 requests per hour for just one city and this will easily exceed the free limits.
  Object.values(cities).map((item) => {
    renderCityCard(item);
  });
}, 10000);
