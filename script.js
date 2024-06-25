document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const filename = find_filename(currentPath)



    if (checkLogin() && !filename.includes('logout') && !filename.includes('login')) {

        const loginButton = document.querySelector('#loginButton')
        loginButton.remove();

        const navProfilePicture = document.querySelector('#navProfilePicture');
        navProfilePicture.innerHTML = `
         <img src="${localStorage.getItem('picture')}" width="30" height="30"
                    alt="">
        `;
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

        logoutUser();
    }
    else if (filename.includes('channel-listing')) {

        handleChannelListingPage()
    }
    else {
        if (checkLogin()) {

            handleMainPage();
        }
        updateCarousel();
    }



});

function sendBookmarkUpdateNotification(message, bootstrapClass) {


    document.querySelector('#toastMessage').innerHTML = `
    
    <div class="alert alert-${bootstrapClass} alert-dismissible fade show" role="alert">
        <strong>${bootstrapClass.toUpperCase()}</strong> ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
    </div>
    `;

    $('#bookmarkToast').toast({ delay: 1800 });
    $('#bookmarkToast').toast('show');


}


function bookmarkChannelDemo(channelId, channelName) {
    if (checkLogin()) {
        bookmarkChannel(channelId, channelName);
    }
    else {
        sendBookmarkUpdateNotification("Login to use this Feature", "danger");
    }
}

function bookmarkChannel(channelId, channelName) {

    if (!checkLogin()) {
        sendBookmarkUpdateNotification("Login to use this Feature", "danger");
    }

    else {

        const bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds');
        const bookmarkLimit = 10;
        let bookmarkLenght;

        try {
            bookmarkLenght = bookmarkChannelIds.split("+").length;
        } catch {
            bookmarkLenght = 0;
        }

        const bookmarkButton = document.querySelector(`[data-channel-id="${channelId}"]`);

        if (bookmarkLenght >= bookmarkLimit && (!bookmarkChannelIds || !bookmarkChannelIds.includes(channelId))) {
            const message = "Limit reached for adding bookmarks";
            const color = "danger";
            sendBookmarkUpdateNotification(message, color);
        }
        else {

            if (bookmarkChannelIds === null) {
                const newValue = channelId.toString();
                localStorage.setItem('bookmarkChannelIds', newValue);
                const message = `${channelName} bookmarked successfully`;
                const color = "success";
                sendBookmarkUpdateNotification(message, color);
                bookmarkButton.style.backgroundColor = "green";
            }
            else {
                const bookmarksArray = bookmarkChannelIds.split("+");
                const index = bookmarksArray.indexOf(channelId.toString());
                if (index === -1) {
                    bookmarksArray.push(channelId);
                    localStorage.setItem('bookmarkChannelIds', bookmarksArray.join("+"));
                    const message = `${channelName} bookmarked successfully`;
                    const color = "success";
                    sendBookmarkUpdateNotification(message, color);
                    bookmarkButton.style.backgroundColor = "green";
                } else {
                    bookmarksArray.splice(index, 1);
                    localStorage.setItem('bookmarkChannelIds', bookmarksArray.join("+"));
                    const message = `${channelName} unbookmarked successfully`;
                    const color = "warning";
                    sendBookmarkUpdateNotification(message, color);
                    bookmarkButton.style.backgroundColor = "#007bff";
                }
            }
        }
    }


}



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


async function updateCarousel() {
    const mainCarousel = document.querySelector("#mainCarousel")
    const data = await fetchData("/get-hero-banner")

    data.forEach((item, index) => {
        let extraClass = "";

        if (index === 1) {
            extraClass = " active"
        }
        mainCarousel.innerHTML += `
        <div class="carousel-item${extraClass}">
            <a href="schedule.html?id=${item.channelId}&date=${getCurrentDate()}"><img
                    src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_432,w_1440/${item.image}"
                    class="d-block w-100" alt="${item.channelName}">
            </a>
        </div>
        `
    })

}


async function handleMainPage() {

    const loginToUseFeatures = document.querySelector('#loginToUseFeatures')
    loginToUseFeatures.remove()

    const bookmarkChannelAiringShowDetailContainer = document.querySelector("#bookmarkChannelAiringShowDetailContainer");

    bookmarkChannelAiringShowDetailContainer.innerHTML = `
    <div class = "loader"></div>`;
    let bookmarkChannelIds
    bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds')

    if (bookmarkChannelIds == null || bookmarkChannelIds === "") {

        bookmarkChannelAiringShowDetailContainer.innerHTML = `
        <div class="card">
        <div class="card-body">
            Start Adding Bookmarks...
        </div>
        </div>
        `
    }

    else {
        const bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds').split("+")
        const bookmarkList = bookmarkChannelIds.filter(part => part !== "");
        let randomIndex = Math.floor(Math.random() * bookmarkList.length);
        let randomChannelId = bookmarkList[randomIndex];

        const response = await fetchData(`/get-content-details?channelId=${randomChannelId} `)
        const data = response.data
        console.log(data)
        const meta = data.meta[0]
        const channelMeta = data.channelMeta

        bookmarkChannelAiringShowDetailContainer.innerHTML = "";



        bookmarkChannelAiringShowDetailContainer.innerHTML = `
    
     <div class="card mb-4">
        <div class="card-body">
            <h5>Currenlty airing on one of your bookmarked channel</h5>
        </div>
        </div>
                <div class="card" id = "bookmarkChannelAiringShowDetail" style = "opacity: 95%;">
    
    
                    <div class="row g-0">
                        <div class="col-md-2" style="max-width:200px">
                            <img src="${meta.boxCoverImage}" width='100%'
                                style='float:left;margin:20px;'>
                        </div>
                        <div class="col-md-7">
                            <div class="card-body" style="background:transparent">
                                <h5 class="card-title">${meta.title}</h5>
                                <p class="card-text">${meta.description}</p>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <img src="${channelMeta.logo}" width='100%'
                                style='float:left;margin:20px;'>
                        </div>
                    </div>
    
        </div >
                `
    }



}



async function handleChannelListingPage() {


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
    console.log(data)

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
    if (window.location.pathname.includes('html')) {
        window.location.href = window.location.pathname.replace("login.html", "index.html")
    }
    else {

        window.location.href = window.location.pathname.replace("login", "index")
    }
}


function logoutUser() {
    localStorage.clear();

    if (window.location.pathname.includes('html')) {
        window.location.href = window.location.pathname.replace("logout.html", "index.html")
    }
    else {

        window.location.href = window.location.pathname.replace("logout", "index")
    }
}

function renderHomePageChannels(channels) {
    const channelContainer = document.querySelector("#channelContainer");

    channelContainer.innerHTML = "";

    const bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds') ? localStorage.getItem('bookmarkChannelIds').split("+") : [];

    channels.forEach((channel, index) => {


        let hd_html = '';


        if (channel.title.includes("HD")) {

            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }


        let bookmarkHTML = "";

        const isBookmarked = bookmarkChannelIds.includes(channel.id.toString()) && checkLogin();
        const bookmarkColor = isBookmarked ? "green" : "#007bff";

        bookmarkHTML = `
            <span data-channel-id="${channel.id}" style="position: absolute; top: 10px; left: 10px; background-color: ${bookmarkColor}; color: white; padding: 5px; border-radius: 5px; font-size: 12px; cursor: pointer;" onclick="bookmarkChannel(${channel.id}, '${channel.title}')">
                    <i class="fas fa-bookmark" style="margin-left: 3px; margin-right: 3px;"></i> 
            </span>
        `;

        hd_html += bookmarkHTML;



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

        let episodeHTMLFinal = '';

        if (checkLogin()) {
            episodeHTMLFinal = episodeHTML
        }


        scheduleContainer.innerHTML += `
         <div class="col-md-3 mt-4">
        <div class="card">

            <div style="position: relative;">
                    ${episodeHTMLFinal}
                <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${epg.boxCoverImage}" class="card-img-top" alt="${epg.title}">
                    
            </div>


            <div class="card-body">
                <h5 class="card-title">${epg.title}</h5>
                <p class="card-text">${getReadableTimeStartStop(epg.startTime, epg.endTime)}
                </p>
                
            </div>
        </div>
    </div>
        `
    });




}


function renderGenrePage(data, genreId) {
    const genreContainer = document.querySelector("#genreContainer");
    const genreTitle = document.querySelector("#genreTitle");
    genreTitle.textContent = `Genre - ${slugToText(genreId)}`
    genreContainer.innerHTML = "";

    const bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds') ? localStorage.getItem('bookmarkChannelIds').split("+") : [];

    data.forEach((genre) => {
        let hd_html = '';

        if (genre.channelMeta.hd) {
            hd_html = `
                <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>`;
        }

        let channelHTML = "";
        if (checkLogin()) {
            channelHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <p class="card-text">CH ${genre.channelMeta.channelNumber} <img src="https://play-lh.googleusercontent.com/PTLQRc7a8vRjs8fmM7hRI36s7gGYalxIFd80xZDvYkIl91d709fcl4-UH9vZbxWDGG8" style="max-width: 25px; height: auto; margin-left: 10px;" class="img-fluid"></p>
                </div>
                <br />
            `;
        }

        let bookmarkHTML = "";
        const isBookmarked = bookmarkChannelIds.includes(genre.channelMeta.id.toString()) && checkLogin();
        const bookmarkColor = isBookmarked ? "green" : "#007bff";

        bookmarkHTML = `
            <span data-channel-id="${genre.channelMeta.id}" style="position: absolute; top: 10px; left: 10px; background-color: ${bookmarkColor}; color: white; padding: 5px; border-radius: 5px; font-size: 12px; cursor: pointer;" onclick="bookmarkChannel(${genre.channelMeta.id}, '${genre.channelMeta.channelName}')">
                    <i class="fas fa-bookmark" style="margin-left: 3px; margin-right: 3px;"></i> 
            </span>
        `;

        hd_html += bookmarkHTML;


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
                        ${channelHTML}
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

    const bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds') ? localStorage.getItem('bookmarkChannelIds').split("+") : [];






    data.forEach((category, index) => {

        let hd_html = '';

        // Nick HD+
        // Disney
        if (category.channelName.includes("HD")) {
            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }



        let channelHTML = "";

        if (checkLogin()) {
            channelHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <p class="card-text">CH ${category.channelNumber} <img src="https://play-lh.googleusercontent.com/PTLQRc7a8vRjs8fmM7hRI36s7gGYalxIFd80xZDvYkIl91d709fcl4-UH9vZbxWDGG8" style="max-width: 25px; height: auto; margin-left: 10px;" class="img-fluid"></p>
               
            </div>
            <br />
            `
        }

        let bookmarkHTML = "";
        const isBookmarked = bookmarkChannelIds.includes(category.id.toString()) && checkLogin();

        const bookmarkColor = isBookmarked ? "green" : "#007bff";

        bookmarkHTML = `
            <span data-channel-id="${category.id}" style="position: absolute; top: 10px; left: 10px; background-color: ${bookmarkColor}; color: white; padding: 5px; border-radius: 5px; font-size: 12px; cursor: pointer;" onclick="bookmarkChannel(${category.id}, '${category.channelName}')">
                    <i class="fas fa-bookmark" style="margin-left: 3px; margin-right: 3px;"></i> 
            </span>
        `;

        hd_html += bookmarkHTML;



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
                        ${channelHTML}
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
    const bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds') ? localStorage.getItem('bookmarkChannelIds').split("+") : [];






    data.forEach((item, index) => {

        let hd_html = '';


        if (item.channelName.includes("HD")) {
            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }

        let channelNumberHTML = "";

        if (checkLogin()) {
            channelNumberHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <p class="card-text">CH ${item.channelNumber} <img src="https://play-lh.googleusercontent.com/PTLQRc7a8vRjs8fmM7hRI36s7gGYalxIFd80xZDvYkIl91d709fcl4-UH9vZbxWDGG8" style="max-width: 25px; height: auto; margin-left: 10px;" class="img-fluid"></p>
               
            </div>
            <br />
            `;
        }

        let bookmarkHTML = "";
        const isBookmarked = bookmarkChannelIds.includes(item.channelId.toString()) && checkLogin();
        const bookmarkColor = isBookmarked ? "green" : "#007bff";

        bookmarkHTML = `
            <span data-channel-id="${item.channelId}" style="position: absolute; top: 10px; left: 10px; background-color: ${bookmarkColor}; color: white; padding: 5px; border-radius: 5px; font-size: 12px; cursor: pointer;" onclick="bookmarkChannel(${item.channelId}, '${item.channelName}')">
                    <i class="fas fa-bookmark" style="margin-left: 3px; margin-right: 3px;"></i> 
            </span>
        `;

        hd_html += bookmarkHTML;





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
                        ${channelNumberHTML}
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

    const bookmarkChannelIds = localStorage.getItem('bookmarkChannelIds') ? localStorage.getItem('bookmarkChannelIds').split("+") : [];


    channels.forEach((channel, index) => {


        let hd_html = '';


        if (channel.title.includes("HD")) {

            hd_html = `
            
             <span style="position: absolute; top: 10px; right: 10px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px; font-size: 12px;">HD</span>
            `;
        }

        let channelNumberHTML = "";

        if (checkLogin()) {
            channelNumberHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <p class="card-text">CH ${channel.channelNumber} <img src="https://play-lh.googleusercontent.com/PTLQRc7a8vRjs8fmM7hRI36s7gGYalxIFd80xZDvYkIl91d709fcl4-UH9vZbxWDGG8" style="max-width: 25px; height: auto; margin-left: 10px;" class="img-fluid"></p>
               
            </div>
            <br />
            `;
        }

        const channelId = channel.id.split("_")

        let bookmarkHTML = "";
        const isBookmarked = bookmarkChannelIds.includes(channelId[1].toString()) && checkLogin();
        const bookmarkColor = isBookmarked ? "green" : "#007bff";

        bookmarkHTML = `
            <span data-channel-id="${channelId[1]}" style="position: absolute; top: 10px; left: 10px; background-color: ${bookmarkColor}; color: white; padding: 5px; border-radius: 5px; font-size: 12px; cursor: pointer;" onclick="bookmarkChannel(${channelId[1]}, '${channel.title}')">
                    <i class="fas fa-bookmark" style="margin-left: 3px; margin-right: 3px;"></i> 
            </span>
        `;

        hd_html += bookmarkHTML;






        searchContainer.innerHTML += `
            <div class="col-md-2" bis_skin_checked="1">
                <div class="card" bis_skin_checked="1">
                    
                <div style="position: relative;">
    ${hd_html}
                    <img src="https://mediaready.videoready.tv/tatasky/image/fetch/f_auto,fl_lossy,q_auto,dpr_1.5,h_150,w_265/${channel.channelLogo}" class="card-img-top" alt="${channel.title}">
                
                </div>

                    <div class="card-body" bis_skin_checked="1">
                        <p class="card-text">${channel.title}</p>
                        ${channelNumberHTML}
                        <a href="schedule.html?id=${channelId[1]}&date=${getCurrentDate()}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `;
    });
}