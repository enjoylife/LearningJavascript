gen_graph_id = function () {
            // http://www.ietf.org/rfc/rfc4122.txt
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        };
/* The most basic graph implementation. 
 * It deals with creating the inital graph,  svg of the axis, 
 * the graph's title, a
 * Exposes all of the possible settings, and provides a helper object to deal with them
 */
function standardGraph(id) {

    /* Default Settings */
    var margin = {top: 40, right: 40, bottom: 40, left: 40};
    var width = 500 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
    
    var graph_id = id || gen_graph_id();
    var graph_title = "XYZ Corp",x_title = "Time", y_title = "Price";

    var data_set_options = []; // ex {"type": "line","colorscheme": "basic"}  for the specific datasets 
    var _graph_state = { 
        "x_extent":[new Date(2012,0,1),new Date()],
        "y_extent":[0,1],
        "data_sets": [],
        "container_node": null
    };
    var y_scale = d3.scale.linear()
                    .domain(_graph_state.y_extent)
                    .range([height,0]);
    var x_scale = d3.time.scale()
                    .domain(_graph_state.x_extent)
                    .rangeRound([0,width]);
    var x_axis = d3.svg.gridAxis() // custom axis with lines that extend across the whole graph
                    .scale(x_scale)
                    .ticks(d3.time.months,1)
                    .orient("bottom")
                    .tickSize(6,6) // major,minor,end
                    .tickFormat(d3.time.format("%b"))
                    .tickGridSize(height); // length of grid lines

    var y_axis = d3.svg.gridAxis()
                    .scale(y_scale)
                    .orient("right")
                    .tickSize(6,3,6)
                    .tickSubdivide(2).tickGridSize(-width);

    function graph(selection){
        // outermost element used for positioning of child elements 
        var svg = selection.append("svg")//.attr("id",""+graph_id)
                    .attr("width", width + margin.left + margin.right-2)
                    .attr("height", height + margin.top + margin.bottom);

        // holder for the graph
        var grid = svg.append("g")
                    .attr("id", "graph_"+graph_id)
                    .attr("class","graph")
                    .attr("width",width)
                    .attr("height",height)
                    .attr("transform", "translate(" + (margin.left+2) + "," + margin.top + ")");

        _graph_state.container_node = grid;

        // x axis
        grid.append("g").attr("class","x axis")
            .attr("transform", "translate("+0+"," +height+ ")")
            .call(x_axis);
        
        // y axis
        grid.append("g").attr("class","y axis")
            .attr("transform", "translate("+width+"," +0+ ")")
            .call(y_axis);

        // axis titles
        grid.append("text")
            .attr("text-anchor","end")
            .text(graph_title)
            .attr("x",width-5)
            .attr("y",height-10);
    }

    graph.add_data = function(data){
        // update if were oustide graph 
        graph._update_time_frame(data.x);
        graph._update_price_range(data.y);
        graph._update_data();

        // create the actual data to be injected
        var points = d3.zip(data.x, data.y);

        var uid = data.uid || graph.gen_data_set_uid();

        // update our state
        _graph_state.data_sets.push({
            "settings":data.settings || {"type": "line","colorscheme": "basic"},
            "uid": uid
        });

        //Inject!!
        var line = d3.svg.line()
            .x(function(d,i) {return x_scale(d[0]);})
            .y(function(d,i) {return y_scale(d[1]);});
        _graph_state.container_node
            .append("path").attr("id", "data_"+uid).datum(points)
            .attr("d", line).attr("class","line");

    };
    graph._update_data = function(){
        var line = d3.svg.line()
            .x(function(d,i) {return x_scale(d[0]);})
            .y(function(d,i) {return y_scale(d[1]);});

        _graph_state.data_sets.forEach(function(elem){
            console.log(elem.uid);
            _graph_state.container_node.select("#data_"+elem.uid).attr("d",line);
             console.log(_graph_state.container_node.select("#data_"+elem.uid).datum());
        });

    };
   
    // helpers to make sure the graphs scales encompass data set extremes
    graph._update_time_frame = function(array){
        //TODO Update the time axis
        var extent = d3.extent(array);
        min = extent[0].getTime();
        max = extent[1].getTime();
        if(min < _graph_state.x_extent[0].getTime())
            _graph_state.x_extent[0] = extent[0];
        if(max > _graph_state.x_extent[1].getTime())
            _graph_state.x_extent[1] = extent[1];

        y_scale.domain(_graph_state.y_extent);
        x_scale.domain(_graph_state.x_extent);
        _graph_state.container_node.select(".x.axis").call(x_axis);
    };

    graph._update_price_range = function(array){
        //TODO update the price axis
        var extent = d3.extent(array);
        if(extent[0] < _graph_state.y_extent[0])
            _graph_state.y_extent[0] = extent[0];
        
        if(extent[1] > _graph_state.y_extent[1])
            _graph_state.y_extent[1] = extent[1];

        y_scale.domain(_graph_state.y_extent);
        y_scale.domain(_graph_state.y_extent);
        _graph_state.container_node.select(".y.axis").call(y_axis);
    };

    
    graph._update_axis = function(){
        _graph_state.container_node.select(".x.axis").call(x_axis);
        _graph_state.container_node.select(".y.axis").call(y_axis);
    };
        /* Getters and setters
         ------------------ */
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
        graph.x_scale = function(_) {
            if (!arguments.length) return x_scale;
            x_scale = _;
            return graph;
        };
        graph.y_scale = function(_) {
            if (!arguments.length) return y_scale;
            y_scale = _;
            return graph;
        };
        graph.time_frame = function(_) {
            if (!arguments.length) return _graph_state.x_extent;
            _graph_state.x_extent = graph._update_time_frame(_);
            return graph;
        };
        graph.price_range = function(_) {
            if (!arguments.length) return _graph_state.y_extent;
            _graph_state.y_extent = graph._update_price_range(_);
            return graph;
        }; 
        graph.data_sets = function(obj,set) {
            if (!arguments.length){
                return data_set_options;
            } 
            else if(arguments.length == 1){ 
                data_set_options = obj;
            }
            else {
                data_set_options[set] = obj;
            }
        };
       graph.id = function(_) {
            if (!arguments.length) return graph_id;
            graph_id = _;
            return graph;
        };
  
        graph.gen_data_set_uid = function () {
            return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
        };
        


    // expose the newly set object
    return graph;
}


var tester = standardGraph();

/*data = data.map(function(d, i) {
            return [xValue.call(selection.datum(), d, i), yValue.call(selection.datum(), d, i)];
        });
var data = d3.range(400).map(function(i) {
    return [i / 39, (Math.sin(i / 3) + 2) / 4];
});   
*/

var test_set = { 
    "x" : [new Date(2012,1,1),new Date(2012,2,2),new Date(2012,4,3),new Date(2012,5,6)],
    "y" : [ 0.1, 0.3, 0.2, 0.5]
};
var test_set2 = { 
    "x" : [new Date(2012,0,10),new Date(2012,3,20),new Date(2012,5,2),new Date(2012,10,28)],
    "y" : [ 0.1, 0.3, 2.0, 0.5]
};


d3.select("#graph").call(tester);
tester.add_data(test_set);
//tester.add_data(test_set2);
