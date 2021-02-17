(function (window,document,undefined)
    {
        //=============================================================================================================
        class Place{
            constructor(latitude,longitude) {
                this.latitude=latitude;
                this.longitude=longitude;
            }
        }
        let currentPlace=new Place();
        let nameCurrentPlace;
        window.onload = init;

        //=============================================================================================================

        function init() {

            list_manager.displayList();
            document.getElementById("Latitude").addEventListener("change",update_text_input);
            document.getElementById("Longitude").addEventListener("change",update_text_input);
            document.getElementById("Submit").addEventListener("click",new_place.add_place);
            document.getElementById("displayWeather").addEventListener("click",representWeather.get_latitude_and_longitude);
            document.getElementById("deleteList").addEventListener("click",list_manager.remove_all_list);

        }
        //=============================================================================================================

        function update_text_input() {
            this.nextElementSibling.innerHTML=this.value.toString();
        }

        //=============================================================================================================
        //create new place
        let new_place= (function () {
            function add_place(event) {
                event.preventDefault();
                let place_name = document.getElementById("place_name");
                if (!name_valdiation(place_name)) {
                    place_name.value = "";
                }
                else
                {
                    list_manager.updateList();
                    clean_values();
                }
            }
            //=========================================================================================================
            // check if the name of place is valid
            function name_valdiation(name) {
                name.value = name.value.toString().replace(/[^a-z-A-Z ]/g, "").
                replace(/ +/, " ");
                let justSpaces = name.value.toString().trim();
                if (name === "" || name === null || justSpaces === "") {
                    alert("please enter place name");
                    return false;
                }
                return true;
            }
            //=========================================================================================================
            // clean values to get new input
            function clean_values(){

                document.getElementById("mainForm").reset();
                let latitudeAndLongitude=document.getElementsByClassName("custom-range");
                for (let i of latitudeAndLongitude){
                    i.nextElementSibling.innerHTML="0";
                }
            }
            return{
                add_place:add_place
            };
        })();
        //=============================================================================================================
        //For choose one place from the list
        let choose_place=(function () {

            function choose()
            {
                remove_active();
                this.className="list-group-item list-group-item-action active";
                nameCurrentPlace = this.id;
            }
            //=========================================================================================================
            // remove active from all the other places
            function remove_active()
            {
                let placeList=document.getElementById("place_list").childNodes;
                for (let place of placeList)
                {
                    place.className="list-group-item list-group-item-action";
                }
            }
            return{
                choose:choose

            };
        })();
//=====================================================================================================================
        //manager the list and display.
        let list_manager=(function(){
            function displayList() {
                fetch('./weather/displayList' )
                    .then(function (response) {
                            // handle the error
                            if (response.status !== 200) {
                                alert("Looks like there was a problem");
                                return;
                            }
                            // Examine the response and generate the HTML
                            response.json().then(function (data){runList(data)});
                        }
                    )
                    .catch(function (err) {
                        alert('Fetch Error :' . err);

                    });
            }
            //=========================================================================================================
            //present list after get it from server
            function runList(placeList)
            {
                if (placeList.error)
                    alert("Some error occured, is the database initialized?");
                else {
                    let place_list = document.getElementById("place_list");
                    representWeather.remove_all_child_nodes(place_list);
                    for (let i in placeList)
                    {
                        let new_place = document.createElement("button");
                        let new_span = document.createElement("span");
                        new_span.className = "close";
                        new_span.innerHTML = 'x';
                        new_span.addEventListener("click", remove_from_list);
                        new_place.innerHTML = placeList[i].locationName;
                        new_place.id = placeList[i].locationName;
                        new_place.className = "list-group-item list-group-item-action";
                        new_place.addEventListener("click", choose_place.choose);
                        new_place.appendChild(new_span);
                        place_list.appendChild(new_place);
                    }
                }
            }
            //=========================================================================================================
            //update the list after adding a new place.
            function updateList()
            {
                let location =document.getElementById("place_name");
                let latitude =document.getElementById("Latitude");
                let longitude =document.getElementById("Longitude");
                let ajaxParams = {method: "post", headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({locationName: location.value,
                        latitude: latitude.value, longitude:longitude.value})}

                fetch('./weather/updateList',ajaxParams)
                    .then(function (response) {
                        if (response.status === 205) {
                            alert("The place is already exist. try again please");
                            return;
                        }
                        else if (response.status !== 200) {
                            alert("Looks like there was a problem");
                            return window.location.replace('/login');
                        }

                        response.json().then(function (data){runList(data)});
                    })
                    .catch(function (err) {
                    });
            }
            //==========================================================================================================
            //remove all the list from server
            function remove_all_list()
            {
                let ajaxParams = {
                    method: 'delete',
                };
                fetch('./weather/deleteAllList' ,ajaxParams)
                    .then(
                        function (response) {
                            // handle the error
                            if (response.status !== 200) {

                                alert('Looks like there was a problem. Status Code: ' +
                                    response.status);
                                return window.location.replace('/login')
                            }
                            response.json().then(function (data){runList(data)});
                        }
                    )
                    .catch(function (err) {
                        alert('Fetch Error :' . err);

                    });
            }
            //==========================================================================================================
            //remove one place from list
            function remove_from_list(){
                let name=this.parentNode.id;
                let ajaxParams = {method: "delete",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({locationName: name.toString()})
                };
                fetch('./weather/deleteFromList',ajaxParams)
                    .then(function (response) {
                        if (response.status !== 200) {
                            alert("Looks like there was a problem");
                            return window.location.replace('/login');
                        }
                        response.json().then(function (data){runList(data)});
                    })
                    .catch(function (err) {});
            }
            return{
                displayList:displayList,
                remove_all_list:remove_all_list,
                updateList:updateList
            };
        })();
//=====================================================================================================================
        let representWeather=(function (){

            //main function. do fetch and load the weather
            function get_weather() {

                let url = "http://www.7timer.info/bin/api.pl?lon=" + currentPlace.longitude + "&lat=" +
                    currentPlace.latitude + "&product=civillight&output=json";

                let pictureUrl = "http://www.7timer.info/bin/astro.php?lon=" + currentPlace.longitude + "&lat=" +
                    currentPlace.latitude + "&ac=0&lang=en&unit=metric&output=internal&tzshift=0";

                let image = document.createElement("img");
                let pictureWeather = document.getElementById("pictureWeather");
                let weather = document.getElementById("weather");
                remove_all_child_nodes(pictureWeather);
                remove_all_child_nodes(weather);
                image.src = "images/loadingGif.gif";
                image.className = "center";
                weather.appendChild(image);
                let ajaxParams = {
                    method: 'GET',
                };
                fetch(url, ajaxParams).then(

                    function (response) {
                        // handle the error
                        if (response.status !== 200) {
                            alert("Looks like there was a problem");
                            return window.location.replace('/login');
                        }
                        response.json().then(function (data) {
                                remove_all_child_nodes(weather);
                                document.getElementById("weatherHeadLine").style.visibility = "visible";
                                for (let day of data.dataseries) {
                                    let newDay = creat_weather_for_day(day);
                                    weather.appendChild(newDay);
                                }
                                let img = document.createElement("img");
                                img.src = pictureUrl;
                                img.onerror = function errorImg() {
                                    img.src = "image/defualt.gif";

                                };
                                img.className = "center";
                                pictureWeather.appendChild(img);
                            document.body.scrollIntoView(false);


                            }
                        )
                    })
                    .catch(function (err) {

                        document.getElementById("allPage").style.display = 'none';
                        document.getElementById("error").style.display = 'block';
                    });



            }
            //=========================================================================================================
            // return the date in regular pattern
            function orginaize_date(date) {
                return date.slice(6, 8) + "/" + date.slice(4, 6) + "/" + date.slice(0, 4);
            }
            //=========================================================================================================
            // return image for day
            function adjust_image(weather) {

                let image = document.createElement("img");
                image.style.width = "100%";

                let weatherArray = ["cloudy", "clear", "snow", "rain", "foggy", "shower", "mixed", "Thunderstorm", "Windy"];
                let imageArray = ["meonan_helkit.jpg", "suny.jpg", "snow.jpg", "rain.jpg", "foggy.png", "showers.png",
                    "mixed.png", "Thunderstorm.png", "Windy.png"];

                for (let i = 0; i < weatherArray.length; i++) {
                    if (weather.search(weatherArray[i]) > -1) {
                        image.src = "images/" + imageArray[i];
                        return image;
                    }
                }
                image.src = "images/renbow.jpg";
                return image;
            }
            //=========================================================================================================
            // return details for day
            function creat_sub(day) {
                let sub = document.createElement("text-block");
                sub.className = "text-block";
                let headLine = document.createElement("h6");
                let secondHead = document.createElement("p");
                let date = orginaize_date(day.date.toString());
                headLine.innerHTML = date;
                secondHead.innerHTML = day.weather + " , " + day.temp2m.min + " - " + day.temp2m.max + get_wind(day.wind10m_max);
                sub.appendChild(headLine);
                sub.appendChild(secondHead);
                return sub;

            }
            //=========================================================================================================
            // return the wind for day
            function get_wind(windSpeed) {
                if (windSpeed == 1)
                    return "";
                else
                    return " wind speed = " + windSpeed.toString();
            }
            //=========================================================================================================
            // return day with image and details
            function creat_weather_for_day(day) {
                let new_day = document.createElement("column");
                new_day.className = "column";
                new_day.className = "col-sm-6 col-md-4 col-lg-3 col-xl-1.5";
                let image = adjust_image(day.weather.toString().toLocaleLowerCase());
                let sub = creat_sub(day);
                new_day.appendChild(image);
                new_day.appendChild(sub);

                return new_day;

            }
            //=========================================================================================================
            //remove old weather before present new day
            function remove_all_child_nodes(parent) {
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
            }
            //=========================================================================================================
            //Fetch to get lon and lat
            function get_latitude_and_longitude()
            {
                fetch('./weather/locationData' ,{method: "post", headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(
                        {locationName: nameCurrentPlace})})
                    .then(
                        function (response) {
                            // handle the error
                            if (response.status !== 200) {
                                alert('Looks like there was a problem. Status Code: ' +
                                    response.status);
                                return window.location.replace('/login');
                            }
                            response.json().then(function (data){

                                currentPlace.longitude = parseFloat(data.info.longitude).toFixed(2);
                                currentPlace.latitude=parseFloat(data.info.latitude).toFixed(2);

                                get_weather();
                            });
                        }

                    )
                    .catch(function (err) {

                        alert("Fetch error");

                    });
            }
            return{
                remove_all_child_nodes:remove_all_child_nodes,
                get_latitude_and_longitude:get_latitude_and_longitude
            };


        })();
    }
)(window,document,undefined);