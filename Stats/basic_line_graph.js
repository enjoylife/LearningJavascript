function basic_line_graph() {
    /*
     * Settings 
     */
    var margin = {top: 10, right: 40, bottom: 20, left: 40};

    var width = 500 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    // data accesor functions
    var x_value = function(d) { return d[0]; };
    var y_value = function(d) { return d[1]; };

    var num_of_ticks = 10;

    var x_scale = d3.scale.linear().range([0,width]).nice();
    var y_scale = d3.scale.linear().range([height,0]).nice();

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
            .orient("left")
            .ticks(10)
            .tickSize(6,3,6)
            .tickSubdivide(2)
            .tickGridSize(width);

    // drawn line
    var line = d3.svg.line()
        .x(function(d){return x_scale(d[0]);})
        .y(function(d){return y_scale(d[1]);});


        function graph(selection) {
            selection.each(function(data) {
                    // Convert data to standard representation greedily;
                    // this is needed for nondeterministic accessors.
                    data = data.map(function(d, i) {
                      return [x_value.call(data, d, i), y_value.call(data, d, i)];
                    });

                    // update scales
                    x_scale.domain([0,d3.max(data,function(d){return d[0];})*1.1]);
                    y_scale.domain([0,d3.max(data,function(d){return d[1];})*1.1]);

                    // select the graph if it exists,
                    var svg = d3.select(this).selectAll("svg").data([data]);

                    // otherwise create g element holder for the graph
                    // inner dimension
                    var new_svg = svg.enter().append("svg").append("g");
                    
                    new_svg.append("g").attr("class","x axis"); // axis
                    new_svg.append("g").attr("class","y axis");
                    new_svg.append("path").attr("class","line"); // data line

                    // Update the outer dimensions.
                    svg.attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    
                    // Update the inner dimensions.
                    var g = svg.select("g")
                        .attr("width",width)
                        .attr("height",height)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("class", "graph");

                    g.select(".x.axis").attr("transform", "translate("+0+"," +height+ ")").call(x_axis);
                    g.select(".y.axis").attr("transform", "translate("+0+"," +0+ ")").call(y_axis);

                    // update line
                    g.select(".line").attr("d",line);
            });
        }

        /*
         * Getters and Setters
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
    return graph;
}

d3.select("body").append("div").datum([[0,2],[2,3],[3,7]]).call(basic_line_graph())

