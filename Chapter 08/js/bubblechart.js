//Branton Kunz, March 30, 2022 - Geography 575, UW-Madison



//executes script when window is loaded
window.onload = function(){

    var w = 950, h = 500;
    var container = d3.select("body") //get the <body> element from the DOM
    //add a gray background svg rectangle
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .attr("class","container")
        .style("background-color", "rgba(0,0,0,0.2)")
         
    //define and add the inner white rectangle that will be the backdrop for the chart
    var innerRect = container.append("rect") 
        .datum(400)
        .attr("height",function(d){
            return d
        })

        .attr("width",function(d){
            return d * 2;
        })
        .attr("x",50)
        .attr("y",50)
        .style("fill","white")


        //population data
        var cityPop = [
            { 
                city: 'Madison',
                population: 233209
            },
            {
                city: 'Milwaukee',
                population: 594833
            },
            {
                city: 'Green Bay',
                population: 104057
            },
            {
                city: 'Superior',
                population: 27244
            }
        ];



    //defines the X axis length
    var x = d3.scaleLinear() //create the scale
        .range([90, 750]) //output min and max
        .domain([0, 3]); //input min and max

    //find the minimum value of the array
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    });

    //find the maximum value of the array
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    });

    //creates the scale on the left side
    //scale for circles center y coordinate
    var y = d3.scaleLinear()
        .range([450, 50]) //was 440, 95
        .domain([0, 700000]); //was minPop, maxPop

    
    //gives D3 a starting and ending color range to relate to the data proportionally 
    //color scale generator 
    var color = d3.scaleLinear()
        .range([
            "#FDBE85",
            "#D94701"
        ])
        .domain([
            minPop, 
            maxPop
        ]);


    //creates the circles that represent the data
    var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
            //use the index to place each circle horizontally
            // return 90 + (i * 180)
            return x(i)
        })
        .attr("cy", function(d){
            //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
            return y(d.population);
        })
        .style('fill',function(d){
            return color(d.population)
        })
         //Example 3.4 line 1
         .attr("cy", function(d){
            return y(d.population);
        })
        .style("fill", function(d, i){ //add a fill based on the color scale generator
            return color(d.population);
        })
        .style("stroke", "#000"); //black circle stroke
        
        //below Example 3.5...create y axis generator
        var yAxis = d3.axisLeft(y);

        //create axis g element and add axis
        var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);

        //create axis g element and add axis
        var axis = container.append("g")
        .attr("class", "axis");

        yAxis(axis);

        //creates a text element and adds the title
        var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("Wisconsin City Populations");

      

    //creates the circle labels
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
            //vertical position centered on each circle
            return y(d.population);
        });

    //creates the city labels
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .text(function(d){
            return d.city;
        });



    //create format generator
    var format = d3.format(",");

    //Breaks the circle label text into two lines
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d,i){
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .attr("dy", "15") //vertical offset
        .text(function(d){
            return "Pop. " + format(d.population); //use format generator to format numbers
        });


}