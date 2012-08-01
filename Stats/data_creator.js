function data_creator(selection) {

    /* Settings 
     ----------- */
    var margin = {top: 10, right: 40, bottom: 20, left: 20};

    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    
    var num_of_ticks = 20; // doesn't crowd graph to much 
    
    var points = []; //  [[x coor,y coor, symbol_type], ....]

    // color based on these choices
    var symbol_choices = ["circle","cross","diamond","square","triangle"];
    var symbol_type = "circle"; //default

    var color_scale = d3.scale.category10().domain(symbol_choices);

    var symbol_picker = d3.scale.ordinal()
            .domain(symbol_choices)
            .range(d3.svg.symbolTypes);
        
    // labels
    var graph_title = "Data Creator";
    var x_title = "x axis";
    var y_title = "y axis";

        
        /* Main 
        ------- */
        function graph() {
            
            // create the dropdown options
            selection.call(graph.add_symbol_option);
            //selection.call(graph.add_control_help);
            var x_max_value = num_of_ticks;
            var y_max_value = num_of_ticks;

            var x_scale = d3.scale.linear()
                .domain([0,x_max_value]).range([0,width]).nice();
            var y_scale = d3.scale.linear()
                .domain([0,y_max_value]).range([height,0]).nice();
                
            var x_axis = d3.svg.gridAxis() // custom axis with lines that extend across the whole graph
                .scale(x_scale)
                .ticks(num_of_ticks)
                .orient("bottom")
                .tickSize(6,4,6) // major,minor,end
                .tickSubdivide(2) // how many minor ticks
                .tickGridSize(height); // length of grid lines

            var y_axis = d3.svg.gridAxis()
                .scale(y_scale)
                .orient("left").ticks(num_of_ticks)
                .tickSize(6,3,6)
                .tickSubdivide(2)
                .tickGridSize(width);

            // outermost element used for positioning of child elements 
            var svg = selection.append("svg").attr("id","data_creator")
                .attr("width", width + margin.left + margin.right-2)
                .attr("height", height + margin.top + margin.bottom);
            
            // holder for the graph
            var grid = svg.append("g")
                .attr("class","data_select")
                .attr("width",width)
                .attr("height",height)
                .attr("transform", "translate(" + (margin.left+2) + "," + margin.top + ")");
            
            // x axis
            grid.append("g").attr("class","x axis")
                .attr("transform", "translate("+0+"," +height+ ")")
                .call(x_axis);
            // y axis
            grid.append("g").attr("class","y axis")
                .attr("transform", "translate("+0+"," +0+ ")")
                .call(y_axis);
            
            // axis titles
            grid.append("text")
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

            // register callbacks
            d3.select(window).on("keydown", graph.remove);

        }
            
         /* Helpers
         ---------- */
        graph.add_symbol_option = function() {
            // Add interpolator dropdown
            this.append("select")
                .on("change", function() {
                   symbol_type = this.value;})
              .selectAll("option")
                  .data(symbol_choices)
              .enter().append("option")
                .attr("value", String)
                .text(String);
        };

        graph.add_control_help = function() {
            this.append("ul").selectAll("li")
                .data(["choose symbol type from the dropdown",
                    "click to enter","backspace to delete"])
                .enter().append("li")
                    .text(function(d){return d;});
        };

        graph.update = function() {
            data_points = d3.select(".graph").selectAll(".symbols")
                .data(points,function(d) { return d;});
            data_points.enter().append("path")
                .attr("class",function(d) { return "symbols "+ d[2]; })
                .attr("stroke",function(d) {return color_scale(d[2]);})
                .attr("transform", function(d) { return "translate(" + d[0] + "," + d[1] + ")"; })
                // feels like this is wrong way to change types, probably a
                // cleaner solution out there
                .attr("d", function(d) { return d3.svg.symbol().type(symbol_picker(d[2]))(); });
            data_points.exit().remove();
        };

        graph.remove = function() {
          switch (d3.event.keyCode) {
            case 8: // backspace
            case 46:  // delete
              points.pop();
              graph.update();
              break;
            
          }
        };

         /* Getters and setters
         ------------------ */
        graph.width = function(_) {
            if (!arguments.length) return width;
            if (_ === "auto") {
                width = selection.property("clientWidth")-margin.left - margin.right;
                return graph;
            }
            width = _;
            return graph;
          };

          graph.height = function(_) {
            if (!arguments.length) return height;
            if (_ === "auto") {
                height = selection.property("clientHeight")-margin.top - margin.bottom-40;
                return graph;
            }
            height = _;
            return graph;
          };
          
          

          graph.num_of_ticks = function(_) {
            if (!arguments.length) return num_of_ticks;
            num_of_ticks = _;
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
//graph = data_creator(d3.select("#creator"));
graph = data_creator(d3.select("#creator")).width("auto").height("auto").num_of_ticks(10);

graph();
