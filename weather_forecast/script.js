const API_KEY = "8bd8813d4d9b261795e8bf55b56c8e94";
const CITY = "Tampere";

const FORECAST_URL = 
    `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`;

const fetchWeatherInfo = async () => {
    try {
        const response = await fetch(FORECAST_URL);
        const data = await response.json();

        // show current date and time under main heading
        const dateTime0 = new Date(1000 * data.list[0].dt);
        const dateTime0Element = document.getElementById("dateTime0");
        dateTime0Element.textContent = dateTime0;
        
        // console.log(data);
        // console.log(data.list[1]);
        console.log(data.list[0].weather[0].icon);
        console.log(data.list[0].main.temp);
        console.log(data.list[1].weather[0].icon);
        console.log(data.list[1].main.temp);
        console.log(data.list[2].weather[0].icon);
        console.log(data.list[3].main.temp);

        // weather now (or nearest forecast)
        // set time
        const time0Element = document.getElementById("time0");
        time0Element.textContent = dateTime0.getHours() + ":00";
        // set temp
        const temp0 = data.list[0].main.temp;
        const temp0Element = document.getElementById("temp0");
        temp0Element.textContent = Math.round(temp0) + "\u00B0C";
        // set img src
        const icon0 = data.list[0].weather[0].icon;
        const icon0URL = `https://openweathermap.org/img/wn/${icon0}@2x.png`;
        const icon0Element = document.getElementById("icon0");
        icon0Element.src = icon0URL;

        // weather now +3 hours
        // set time
        const dateTime1 = new Date(1000 * data.list[1].dt);
        const time1Element = document.getElementById("time1");
        time1Element.textContent = dateTime1.getHours() + ":00";
        // set temp
        const temp1 = data.list[1].main.temp;
        const temp1Element = document.getElementById("temp1");
        temp1Element.textContent = Math.round(temp1) + "\u00B0C";
        // set img src
        const icon1 = data.list[1].weather[0].icon;
        const icon1URL = `https://openweathermap.org/img/wn/${icon1}@2x.png`;
        const icon1Element = document.getElementById("icon1");
        icon1Element.src = icon1URL;

        // weather now +6 hours
        // set time
        const dateTime2 = new Date(1000 * data.list[2].dt);
        const time2Element = document.getElementById("time2");
        time2Element.textContent = dateTime2.getHours() + ":00";
        // set temp
        const temp2 = data.list[2].main.temp;
        const temp2Element = document.getElementById("temp2");
        temp2Element.textContent = Math.round(temp2) + "\u00B0C";
        // set img src
        const icon2 = data.list[2].weather[0].icon;
        const icon2URL = `https://openweathermap.org/img/wn/${icon2}@2x.png`;
        const icon2Element = document.getElementById("icon2");
        icon2Element.src = icon2URL;



    } catch (error) {
        console.error(error);
    }
};

fetchWeatherInfo();
