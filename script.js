

document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const filename = find_filename(currentPath)


    console.log(filename)

    if (checkLogin() && !filename.includes('logout')) {

        const loginButton = document.querySelector('#loginButton')
        loginButton.remove();

        const navProfilePicture = document.querySelector('#navProfilePicture');
        navProfilePicture.innerHTML = `
         <img src="${localStorage.getItem('picture')}" width="30" height="30"
                    alt="">
        `
    }
    else {
        const navProfilePicture = document.querySelector('#navProfilePicture');
        console.log(navProfilePicture);
        try {
            document.querySelector('#loginButton').onclick = function () {
                location.href = 'https://principledent422-schedule-api.vercel.app/login/google';
            };
            navProfilePicture.remove();
        }
        catch (error) {

        }
    }

    if (filename.includes('schedule')) {
        handleSchedulePage();
    }

    else if (filename.includes('genre')) {
        handleGenrePage();
    }

    else if (filename.includes('category')) {
        handleCategoryPage();
    }

    else if (filename.includes('language')) {
        handleLanguagePage();
    }


    else if (filename.includes('search')) {
        handleSearchPage();
    }

    else if (filename.includes('login')) {
        handleLoginPage();
    }
    else if (filename.includes('logout')) {
        console.log("logout page")
        logoutUser()
    }
    else {
        handleMainPage();
    }



});


function buildScheduleButtons(params) {

    previous = [7, 6, 5, 4, 3, 2, 1]
    next = [1, 2, 3, 4]


    const previousButtons = document.querySelector('#previousButtons')
    const nextButtons = document.querySelector('#nextButtons')

    const scheduleButtonLoader = document.querySelector(".scheduleButtonLoader")
    scheduleButtonLoader.remove()


    previous.forEach((value, index) => {
        previousButtons.innerHTML += `
        <a href="schedule.html?id=${params.id}&date=${getPreviousDate(value)}" class="btn btn-danger">
            -${value}
        </a>
        `
    })

    next.forEach((value, index) => {
        nextButtons.innerHTML += `
        <a href="schedule.html?id=${params.id}&date=${getNextDate(value)}" class="btn btn-success">
            +${value}
        </a>
        `
    })

}


function extractNumberFromString(text) {


    try {
        // Use a regular expression to find numbers in the string
        const match = text.match(/\d+/);

        return parseInt(match[0], 10);
    }

    catch (error) {

        return 0;
    }


}



function formatDate(date) {
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
    let year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
}

function getPreviousDate(days) {
    // Get today's date
    let today = new Date();

    // Calculate previous date
    let previousDate = new Date(today);
    previousDate.setDate(today.getDate() - days);

    // Return formatted date
    return formatDate(previousDate);
}



function getNextDate(days) {
    // Get today's date
    let today = new Date();

    // Calculate previous date
    let previousDate = new Date(today);
    previousDate.setDate(today.getDate() + days);

    // Return formatted date
    return formatDate(previousDate);
}

function slugToText(slug) {
    // Replace dashes with spaces
    let text = slug.replace(/-/g, ' ');

    // Capitalize the first letter of each word
    text = text.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });

    // Replace any special characters, such as percent encoding
    text = decodeURIComponent(text);

    return text;
}



function getReadableTimeStartStop(start, stop) {
    const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(stop).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${startTime} - ${endTime}`;
}

function getQueryParams() {
    let params = {};
    let searchParams = new URLSearchParams(window.location.search);
    for (let [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;

}

function find_filename(filepath) {
    const filepath_parts = filepath.split("/");
    return filepath_parts[filepath_parts.length - 1];
}


function getCurrentDate() {

    const today = new Date();

    return formatDate(today)

}


async function fetchData(path) {

    const API_PATH = 'https://principledent422-schedule-api.vercel.app'
    // https://principledent422-schedule.vercel.app/category?id=hindi-entertainment
    const url = `${API_PATH}${path}`

    try {
        const response = await fetch(url);

        const data = await response.json();

        return data;
    }

    catch (error) {
        console.error('Error fetching data:', error);
    }


}

async function handleMainPage() {


    const data = await fetchData("/channels?limit=60");
    renderHomePageChannels(data.data.list);


}


async function handleSchedulePage() {

    const params = getQueryParams();
    const data = await fetchData(`/schedule?id=${params.id}&date=${params.date}`);
    buildScheduleButtons(params);

    renderSchedulePage(data.data.epg, params);
}


async function handleGenrePage() {

    const params = getQueryParams();
    // Constructing the path needed by the API
    const data = await fetchData(`/genre?id=${params.id}`);

    renderGenrePage(data, params.id);
}


async function handleCategoryPage() {

    const params = getQueryParams();

    const data = await fetchData(`/category?id=${params.id}`);

    renderCategoryPage(data, params.id);


}


async function handleLanguagePage() {

    const params = getQueryParams();
    const data = await fetchData(`/language?id=${params.id}`);

    renderLanguagePage(data, params.id);


}


async function handleSearchPage() {

    const params = getQueryParams();
    const data = await fetchData(`/search?query=${params.query}`);

    renderSearchPage(data, params.query);

}

async function handleLoginPage() {

    const params = getQueryParams();

    if (params.userid === '') {

    }
    else {
        await loginUser(params.userid);
    }
}

function checkLogin() {
    if (localStorage.getItem('email')) {
        return true;
    }
    else {
        return false;
    }
}

async function loginUser(userid) {
    const data = await fetchData(`/get-user-details?userid=${userid}`);

    for (const [key, value] of Object.entries(data[0])) {

        localStorage.setItem(key, value);
    }
    // const redirectURL = `${window.location.pathname.split["/"]}`
    window.location.href = window.location.pathname.replace("login.html", "index.html")
}


function logoutUser() {
    localStorage.clear();
    window.location.href = window.location.pathname.replace("logout.html", "index.html")
}

function renderHomePageChannels(channels) {
    const channelContainer = document.querySelector("#channelContainer");

    channelContainer.innerHTML = "";

    channels.forEach((channel, index) => {


        let hd_html = '';


        if (channel.title.includes("HD")) {

            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }

        channelContainer.innerHTML += `
            <div class="col-md-2" bis_skin_checked="1">
                <div class="card" bis_skin_checked="1">
                    
                <div style="position: relative;">
    ${hd_html}
                    <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${channel.image}" class="card-img-top" alt="${channel.title}">
                
                </div>

                    <div class="card-body" bis_skin_checked="1">
                       <p class="card-text">${channel.title}</p>
                        <a href="schedule.html?id=${channel.id}&date=${getCurrentDate()}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `;
    });
}


function renderSchedulePage(data, params) {
    const scheduleContainer = document.querySelector("#scheduleContainer");
    const scheduleTitle = document.querySelector("#scheduleTitle");



    scheduleContainer.innerHTML = "";


    data.forEach((epg, index) => {
        scheduleTitle.textContent = `Schedule - ${epg.channelName} (${params.date})`;


        const numberFromGroupKey = extractNumberFromString(epg.groupKey);

        if (numberFromGroupKey === 0) {
            episodeHTML = "";
        }

        else {
            episodeHTML = `
            <span style="position: absolute; top: 10px; right: 10px; background-color: black; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">E${numberFromGroupKey}</span>
            `;
        }


        scheduleContainer.innerHTML += `
           <div class="col-md-3" bis_skin_checked="1">
                <div class="card" bis_skin_checked="1">



                    <div style="position: relative;">
                    ${episodeHTML}
                        <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${epg.boxCoverImage}" class="card-img-top" alt="${epg.title}">
                    
                    </div>


                    <div class="card" bis_skin_checked="1">
                        <h5 class="card-title">${epg.title}</h5>
                        
                    <p class="card-text">${getReadableTimeStartStop(epg.startTime, epg.endTime)}</p>
                    </div>

                </div>
            </div>
        `;
    });
}


function renderGenrePage(data, genreId) {
    const genreContainer = document.querySelector("#genreContainer");
    const genreTitle = document.querySelector("#genreTitle");
    genreTitle.textContent = `Genre - ${slugToText(genreId)}`
    genreContainer.innerHTML = "";





    data.forEach((genre, index) => {

        let hd_html = '';


        if (genre.channelMeta.hd) {
            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }


        genreContainer.innerHTML += `
           <div class="col-md-3" bis_skin_checked="1">
                <div class="card" bis_skin_checked="1">



                <div style="position: relative;">
    ${hd_html}
                    <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${genre.meta[0].boxCoverImage}" class="card-img-top">
                </div>


                    <div class="card-body" bis_skin_checked="1">
                        <h5 class="card-title">${genre.channelMeta.channelName}</h5>
                        
                        <p class="card-text">${genre.meta[0].title}</p>
                        <p class="card-text">${getReadableTimeStartStop(genre.meta[0].startTime, genre.meta[0].endTime)}</p>

                        <a href="schedule.html?id=${genre.channelMeta.id}&date=${getCurrentDate()}" class="btn btn-primary">View Details</a>

                    </div>

                </div>
            </div>
        `;
    });
}



function renderCategoryPage(data, categoryId) {
    const categoryContainer = document.querySelector("#categoryContainer");
    const categoryTitle = document.querySelector("#categoryTitle");

    categoryTitle.textContent = `Category - ${slugToText(categoryId)}`

    // Removing the loader
    categoryContainer.innerHTML = "";





    data.forEach((category, index) => {

        let hd_html = '';

        // Nick HD+
        // Disney
        if (category.channelName.includes("HD")) {
            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }

        categoryContainer.innerHTML += `
           <div class="col-md-3" bis_skin_checked="1">
                <div class="card" bis_skin_checked="1">


            <div style="position: relative;">
                ${hd_html}
                <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${category.image}" class="card-img-top">
                
            </div>

                    <div class="card-body" bis_skin_checked="1">
                        <h5 class="card-title">${category.channelName}</h5>
                        
                        <p class="card-text">${category.title}</p>
                        <p class="card-text">${getReadableTimeStartStop(category.airStartDate, category.airStartDate)}</p>

                        <a href="schedule.html?id=${category.id}&date=${getCurrentDate()}" class="btn btn-primary">View Details</a>

                    </div>

                </div>
            </div>
        `;
    });
}



function renderLanguagePage(data, languageId) {
    const languageContainer = document.querySelector("#languageContainer");
    const languageTitle = document.querySelector("#languageTitle");

    languageTitle.textContent = `Language - ${slugToText(languageId)}`

    languageContainer.innerHTML = "";





    data.forEach((item, index) => {

        let hd_html = '';


        if (item.channelName.includes("HD")) {
            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }

        languageContainer.innerHTML += `
           <div class="col-md-3" bis_skin_checked="1">
                <div class="card" bis_skin_checked="1">


            <div style="position: relative;">
                ${hd_html}
                <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${item.image}" class="card-img-top">
                
            </div>

                    <div class="card-body" bis_skin_checked="1">
                        <h5 class="card-title">${item.channelName}</h5>
                        
                        <p class="card-text">${item.title}</p>
                        <p class="card-text">${getReadableTimeStartStop(item.airStartDate, item.airStartDate)}</p>

                        <a href="schedule.html?id=${item.channelId}&date=${getCurrentDate()}" class="btn btn-primary">View Details</a>

                    </div>

                </div>
            </div>
        `;
    });
}


function renderSearchPage(channels, searchQuery) {
    const searchContainer = document.querySelector("#searchContainer");
    const searchTitle = document.querySelector("#searchTitle");

    searchTitle.textContent = `Search query for ${slugToText(searchQuery)}`
    searchContainer.innerHTML = "";

    channels.forEach((channel, index) => {


        let hd_html = '';


        if (channel.title.includes("HD")) {

            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }

        const channelId = channel.id.split("_")

        searchContainer.innerHTML += `
            <div class="col-md-2" bis_skin_checked="1">
                <div class="card" bis_skin_checked="1">
                    
                <div style="position: relative;">
    ${hd_html}
                    <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${channel.channelLogo}" class="card-img-top" alt="${channel.title}">
                
                </div>

                    <div class="card-body" bis_skin_checked="1">
                        <p class="card-text">${channel.title}</p>
                        <a href="schedule.html?id=${channelId[1]}&date=${getCurrentDate()}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `;
    });
}