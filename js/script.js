var _12hour = true;
var days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const clockEl = document.querySelector(".clock");
const locationEl = document.querySelector(".location");

var param = {
    cityName: "", // your city name/ adm1
    location: "", // adm2
    key: "",    // your key, please register on https://dev.qweather.com/
    locationID: "",
    lang: "zh",
    unit: "m", //metric or imperial
}

locationEl.innerHTML = `${param.cityName} ${param.location}`;

window.onload = function () {
    time();
    getGeoLocation();
    setInterval(time, 1000);
    setInterval(getGeoLocation, 1000*60*30);
}

function time() {
    clockEl.innerHTML = getFormatedTime();
}
/**
 * get datetime and return formated time
 * @returns {string} formated time
 */
function getFormatedTime() {
    let d = new Date();
    if (_12hour)
        return new Intl.DateTimeFormat('zh-CN', { 'hour': '2-digit', 'minute': '2-digit', 'second': '2-digit', 'hour12': true }).format(d);

    return new Intl.DateTimeFormat('zh-CN', { 'hour': '2-digit', 'minute': '2-digit', 'second': '2-digit', 'hour12': false }).format(d);
}
/**
 * get geo location
 */
async function getGeoLocation() {

    fetch(`https://geoapi.qweather.com/v2/city/lookup?location=${param.location}&adm2=${param.cityName}&key=${param.key}`)
        .then(response => {
            if (response.status == 200) {
                response.json().then(data => { 
                    param.locationID = data.location[0].id;
                    getWeather();
                 });
                
            }
        })

}
/**
 * get weather data
 */
function getWeather() {
    var weatherEnd = param.locationID + "&unit=" + param.unit + "&key=" + param.key + "&lang=" + param.lang;
    var weatherURL = "https://devapi.qweather.com/v7/weather/now?location=" + weatherEnd;
    var forecastURL = "https://devapi.qweather.com/v7/weather/7d?location=" + weatherEnd;

    //fetch current weather data json
    fetch(weatherURL)
        .then(response => {
            if (response.status == 200) {
                response.json().then(data => showCurrentWeather(data));
            }
        })

    //fetch forecast data json
    fetch(forecastURL)
        .then(response => {
            if (response.status == 200) {
                response.json().then(data => showForecastWeather(data));
            }
        })
}
/**
 * bind data to currentWeather
 * @param {*} data 
 */
function showCurrentWeather(data) {
    document.getElementById('current-img').src = `https://a.hecdn.net/img/common/icon/202106d/${data.now.icon}.png`;
    document.querySelector('.current-temp').innerHTML = `${data.now.temp}°`;
    document.querySelector('.current-text').innerHTML = `${data.now.text}`;

    const list = document.querySelectorAll('.current-basic-item')
    list[0].querySelector('div:first-child').innerHTML = `${data.now.windScale}级`;
    list[0].querySelector('div:last-child').innerHTML = `${data.now.windDir}`;
    list[1].querySelector('div:first-child').innerHTML = `${data.now.humidity}%`;
    list[1].querySelector('div:last-child').innerHTML = `相对湿度`;
    list[2].querySelector('div:first-child').innerHTML = `${data.now.feelsLike}°`;
    list[2].querySelector('div:last-child').innerHTML = `体感温度`;
    list[3].querySelector('div:first-child').innerHTML = `${data.now.vis}km`;
    list[3].querySelector('div:last-child').innerHTML = `能见度`;
    list[4].querySelector('div:first-child').innerHTML = `${data.now.precip}mm`;
    list[4].querySelector('div:last-child').innerHTML = `降水量`;
    list[5].querySelector('div:first-child').innerHTML = `${data.now.pressure}hPa`;
    list[5].querySelector('div:last-child').innerHTML = `大气压`;
}
/**
 * bind data to forecastWeather
 * @param {*} data 
 */
function showForecastWeather(data) {
    // console.log(data);
    let forcast = document.querySelector('.forcast-tabs');
    var today = new Date();
    for (let item of data.daily) {
        // 创建子节点
        let forcastTabsItem = document.createElement('div')
        forcastTabsItem.className = 'forecast-tabs-item';
        forcastTabsItem.setAttribute('style', 'display: flex; align-items: center;margin-bottom: 1rem;')
        
        let fxDate = new Date(item.fxDate.toString());
        forcastTabsItem.innerHTML = 
        `
            <div class="date-bg" style="display: flex;align-items: center;white-space: nowrap;margin-right: 1rem;">
                <div class="date" style="margin-right: 2rem;">
                    <p style="font-size: 1.5rem;font-weight: bold;">${today.getDay() === fxDate.getDay() ? '今天' : days[fxDate.getDay()]}</p>
                    <p style="font-size: 1rem;color: rgba(0, 0, 0, 0.5);">${item.fxDate}</p>
                </div>
                <img src="https://a.hecdn.net/img/common/icon/202106d/${item.iconDay}.png" style="
                    display: inline-block;
                    vertical-align: middle;
                    width: 3rem;
                    height: 3rem;
                    margin-right: 1rem;
                " alt="">
            </div>
            <div class="temp-line-bg" style="display: flex;align-items: center;">
                <span class="temp left">${item.tempMin}°</span>
                <div class="temp-line" style="
                    width: 8rem;
                    height: 0.5rem;
                    background-color: #007bff;
                    border-radius: 0.5rem;
                    margin: 0 1rem;
                "></div>
                <span class="temp right">${item.tempMax}°</span>
            </div>
        `;
        forcast.appendChild(forcastTabsItem);
    }
}
