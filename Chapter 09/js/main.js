// // Script by Branton Kunz, April 2022 - Geography 575, UW-Madison



//begin script when window loads
window.onload = setMap();

// //set up choropleth map
// function setMap(){
//     //use Promise.all to parallelize asynchronous data loading
//     var promises = [d3.csv("data/lab2_europe_data.csv"),                    
//                     d3.json("data/europe_base.topojson")
//                     ];    
//     Promise.all(promises).then(callback);

//     function callback(data) {
//         var csvData = data[0],
//             europe = data[1]
          
//     //translate europe TopoJSON
//     var europeCountries = topojson.feature(europe, europe.objects.europe_base)

//     //examine the results
//     console.log(europeCountries);

//     }
// };

//Example 1.4 line 1...set up choropleth map
function setMap(){

    //map frame dimensions
    var width = 960,
        height = 760;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Europe
    var projection = d3.geoAlbers()
        .center([3, 53.2])
        .rotate([-15, 0, 0])
        .parallels([43, 62])
        .scale(1200)
        .translate([width / 2, height / 2]);

        var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/lab2_europe_data.csv")); //load attributes from csv    
    promises.push(d3.json("data/europe_base.topojson")); //load background spatial data    
    Promise.all(promises).then(callback);


    function callback(data) {
        
        
        //Example 2.5 line 3...create graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        var gratBackground = map.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path) //project graticule

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
        
        
        
        
        var csvData = data[0],
             europe = data[1]
                  
        //translate europe TopoJSON
        var europeCountries = topojson.feature(europe, europe.objects.europe_base)
        
        //add Europe countries to map
        var countries = map.append("path")
        .datum(europeCountries)
        .attr("class", "countries")
        .attr("d", path);

        

           
    }


}