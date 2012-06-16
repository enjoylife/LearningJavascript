function data_creator(selection) {
    /*
     * Settings 
     */
    var margin = {top: 10, right: 40, bottom: 20, left: 20};

    var width = 600 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    // for look of axis's
    var num_of_ticks = 10;
    var x_max_value = 10;
    var y_max_value = 10;

    // for x,y coordinates and symbol types
    var points = [];

    // the 5 shapes that we will use for symbols
    var symbol_type = "circle"; //default
    var color = d3.scale.category10()
        .domain(["circle","cross","diamond","square","triangle"]);
    var symbol_chooser = d3.scale.ordinal()
        .domain(["circle","cross","diamond","square","triangle"])
        .range(d3.svg.symbolTypes);

    var x_scale = d3.scale.linear().domain([0,x_max_value]).range([0,width]).nice();
    var y_scale = d3.scale.linear().domain([0,y_max_value]).range([height,0]).nice();
    
    // custom axis with lines that extend across the whole graph
    var x_axis = d3.svg.gridAxis()
            .scale(x_scale)
            .ticks(10)
            .orient("bottom")
            .tickSize(6,4,6) // major,minor,end
            .tickSubdivide(2) // how many minor ticks
            .tickGridSize(height); // length of gird lines

    var y_axis = d3.svg.gridAxis()
            .scale(y_scale)
            .orient("left").ticks(10)
            .tickSize(6,3,6)
            .tickSubdivide(2)
            .tickGridSize(width);

    // axis titles
    var graph_title = "Data Creator";
    var x_title = "x axis";
    var y_title = "y axis";

        /*
        * Main 
        */
        function graph() {

            // outermost element used for positioning of child elements 
            var svg = selection.append("svg").attr("id","data_creator")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
            // create g element holder for the graph
            var grid = svg.append("g")
                .attr("class","data_select")
                .attr("width",width)
                .attr("height",height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            // x axis
            grid.append("g").attr("class","x axis")
                .attr("transform", "translate("+0+"," +height+ ")")
                .call(x_axis);
            // y axis
            grid.append("g").attr("class","y axis")
                .attr("transform", "translate("+0+"," +0+ ")")
                .call(y_axis);
            
            // axis titles
            grid.append("text").attr("class", "title")
                .attr("text-anchor","end")
                .text(graph_title)
                .attr("x",width-5)
                .attr("y",0);

            // x axis
            grid.append("text").attr("class", "x title")
                .attr("text-anchor","middle")
                .text(x_title)
                .attr("x",width/2)
                .attr("y",height-5);

            // y axis
            grid.append("text").attr("class", "y title")
                .attr("text-anchor","start")
                .text(y_title)
                .attr("x",5)
                .attr("y",height/2);

            // holder for the user created elements
            grid.append("g").attr("class", "graph");
            // holder for any fututre data that needs to live inside this svg 
            grid.append("g").attr("class", "outside_data");
            
            // for the selecting of data coordintes
            grid.append("rect")
                .attr("width",width)
                .attr("height", height)
                .attr("opacity",0)
                .on("mousedown", function() {
                    var pos = d3.mouse(grid.node());
                    pos.push(symbol_type);
                  points.push(pos);
                  graph.update();
                });
            
            // intial points if any
            graph.update();

            // create the dropdown options
            graph.symbol_chooser();
            
            // register callbacks
            d3.select(window).on("keydown", graph.remove);
        };

        /*
         * Helpers
         */
        graph.symbol_chooser = function() {
            // Add interpolator dropdown
            picker = selection
            .append("select")
                .attr("id", "symbol_picker")
                .on("change", function() {
                   symbol_type = this.value;
                })
              .selectAll("option")
                  .data([
                  "circle",
                  "square",
                  "cross",
                  "diamond",
                  "triangle"
                ])
              .enter().append("option")
                .attr("value", String)
                .text(String);
        };
        graph.update = function() {
            data_points = d3.select(".graph").selectAll(".symbols").data(points,function(d) { return d;});
            data_points.enter().append("path")
                .attr("class",function(d) { return "symbols "+ d[2]; })
                .attr("stroke",function(d) {return color(d[2]);})
                .attr("transform", function(d) { return "translate(" + d[0] + "," + d[1] + ")"; })
                // feels like this is wrong way to change types, probably a
                // cleaner solution out there
                .attr("d", function(d) { return d3.svg.symbol().type(symbol_chooser(d[2]))(); });
            data_points.exit().remove();
        };
        graph.remove = function() {
          switch (d3.event.keyCode) {
            case 8: // backspace
            case 46: { // delete
              points.pop();
              graph.update();
              break;
            }
          }
        };

        /*
         * Getters/setters
         */
        graph.width = function(_) {
            if (!arguments.length) return width;
            width = _;
            return graph;
          };

          graph.height = function(_) {
            if (!arguments.length) return height;
            height = _;
            return graph;
          };

          graph.x = function(_) {
            if (!arguments.length) return x_value;
            x_value = _;
            return graph;
          };

          graph.y = function(_) {
            if (!arguments.length) return y_value;
            y_value = _;
            return graph;
          };
          graph.symbol_type = function(_) {
            if (!arguments.length) return symbol_type;
            symbol_type = +_;
            return graph;
          };
          graph.points = function(_) {
            if (!arguments.length) return points;
            points = _;
            return graph;
          };

    return graph;
}

//data_creator(d3.select("body")).points([[30,50,"square"],[200,100,"triangle"]])();
data_creator(d3.select("body"))();
