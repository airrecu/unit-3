// // Script by Branton Kunz, April 9, 2022 - Geography 575, UW-Madison

//runs main functions when browser loads the window
window.onload = setMap();

//choropleth map creating and settings
function setMap(){

    //map frame dimensions
    var width = 960,
        height = 760;

    //creates svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //creates Albers equal area conic projection centered on Europe
    var projection = d3.geoAlbers()
        .center([3, 53.2])
        .rotate([-15, 0, 0])
        .parallels([38, 57])
        .scale(1200)
        .translate([width / 2, height / 2]);

        var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/lab2_europe_data.csv")); //load attributes from csv    
    promises.push(d3.json("data/europe_base.topojson")); //load Europe basemap 
    Promise.all(promises).then(callback);

    //prepares and places data and maps on the map
    function callback(data) {
        
        //creates graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //creates graticule background (water)
        var gratBackground = map.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path) //project graticule

        //creates graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
        
        //pulls data from array to seperate variables 
        var csvData = data[0],
             europe = data[1]
                  
        //translates europe_base TopoJSON to GeoJSON
        var europeCountries = topojson.feature(europe, europe.objects.europe_base)
        
        //add Europe basemap to map
        var countries = map.append("path")
        .datum(europeCountries)
        .attr("class", "countries")
        .attr("d", path);
    }
}