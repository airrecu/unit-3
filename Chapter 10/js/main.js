//Geography 575, Activity 10 Branton Kunz - April 2022
//wrap everything is immediately invoked anonymous function so nothing is in global scope
(function (){

	//pseudo-global variables
	var attrArray = ["GDP", "NG_Gas_Consumption", "HDD", "dependency_percent", "population"]; //list of attributes
	var expressed = attrArray[0]; //initial attribute


	//begin script when window loads
	window.onload = setMap();

	//sets up choropleth map
	function setMap(){

	    //map frame dimensions
    	var width = window.innerWidth * 0.5,
        height = 460;

	    //creates svg container for the map
	    var map = d3.select("body")
	        .append("svg")
	        .attr("class", "map")
	        .attr("width", width)
	        .attr("height", height);

	    //create Albers equal area conic projection centered on Europe
	    var projection = d3.geoAlbers()
	        .center([2, 54.2])
	        .rotate([-9, 0, 0])
	        .parallels([43, 62])
	        .scale(700)
	        .translate([width / 2, height / 2]);

	    var path = d3.geoPath()
	        .projection(projection);

	    //use Promise.all to parallelize asynchronous data loading
	    var promises = [d3.csv("data/lab2_europe_data.csv"),
	                    d3.json("data/europe_base.topojson"),
	                    ];
	    Promise.all(promises).then(callback);

	    function callback(data){
			var csvData = data[0], europe = data[1]

	        setGraticule(map,path);

	        //translate europe TopoJSON
	        var europeCountries = topojson.feature(europe, europe.objects.europe_base).features;
            //console.log(europeCountries)
	        
            


	        europeCountries = joinData(europeCountries, csvData);

	        var colorScale = makeColorScale(csvData);
            
	        setEnumerationUnits(europeCountries,map,path,colorScale);

	        //add coordinated visualization to the map
        	setChart(csvData, colorScale);

	    };
	};

	//creates graticule and defines settings for it
	function setGraticule(map,path){
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
	}

	//joins data based on common field SOV_A3, a country code
	function joinData(europeCountries,csvData){
		//loop through csv to assign each set of csv attribute values to geojson region
	        for (var i=0; i<csvData.length; i++){
	            var csvRegion = csvData[i]; //the current region
	            var csvKey = csvRegion.SOV_A3; //the CSV primary key

	            //loop through geojson regions to find correct region
	            for (var a=0; a<europeCountries.length; a++){

	                var geojsonProps = europeCountries[a].properties; //the current region geojson properties
	                var geojsonKey = geojsonProps.SOV_A3; //the geojson primary key

	                //where primary keys match, transfer csv data to geojson properties object
	                if (geojsonKey == csvKey){

	                    //assign all attributes and values
	                    attrArray.forEach(function(attr){
	                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
	                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
	                    });
	                };
	            };
	        };
	        return europeCountries;
	}

	//sets color scales
	function makeColorScale(data){
		var colorClasses = [
	        "#D4B9DA",
	        "#C994C7",
	        "#DF65B0",
	        "#DD1C77",
	        "#980043"
	    ];

	    //create color scale generator
	    var colorScale = d3.scaleQuantile()
	        .range(colorClasses);

	    //build array of all values of the expressed attribute
	    var domainArray = [];
	    for (var i=0; i<data.length; i++){
	        var val = parseFloat(data[i][expressed]);
	        domainArray.push(val);
	    };

	    //assign array of expressed values as scale domain
	    colorScale.domain(domainArray);

	    return colorScale;
	}

function setEnumerationUnits(europeCountries,map,path,colorScale){
    //add European countries (as regions) to map
    var regions = map.selectAll(".regions")
        .data(europeCountries)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "regions " + d.properties.SOV_A3;
        })
        .attr("d", path)
        .style("fill", function(d){
            var value = d.properties[expressed];
            console.log(value)
            if(value) {
            	return colorScale(d.properties[expressed]);
            } else {
            	return "#ccc";
            }
    });
}

//function to create coordinated bar chart
function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])   
        .domain([0, 4000000]); //was 100

    //set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.SOV_A3;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        });

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        // .text("GDP (Euros) " + expressed[3] + " in each region");
		.text("2019 Annual GDP (Millions of Euros) ");

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

};

})();