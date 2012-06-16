if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}
/* 
 * Single Processing unit
 */

/* Perceptron is a simple unit that stores weights for each dimension of its
 * input. It's output is the summing of each input times the connected weight */
function Perceptron(input_dimension, learning_rate) {
    this.weights = new Array(input_dimension);  
    this.rate = learning_rate;

    for(var i = 0, len = this.weights.length; i < len; i++) {
        this.weights[i] = (Math.random()*.1)-.05; // start close to linear 
    }
}

Perceptron.prototype = {
    constructor: Perceptron,
    calc: function(input) {
        var sum=0;
        for (var i = 0, lim = input.length; i < lim; i++){
            sum += input[i] * this.weights[i];
        }
        return sum;
    },

    update: function(input, output, expected) { 
        // todo allow k-class updating of the input and output array
        for(var j = 0, len = this.weights.length; j < len; j++) {
            this.weights[j] += this.rate* (expected-output)*input[j];
        }
    },
};


 /* Layer gathers a number of Perceptrons together and provides
 * the  functions that manipulate the Perceptron methods */
function SinglelayerPerceptron(input_dimension,output_dimension, type, learning_rate) {
    //todo make sure if type is not k-class that output_dimension is always 1
    this.nodes = new Array(output_dimension);
    this.type = type;

    // null is less then starting error of 0, used in epoch vs error conditional
    this.epoch = 0;
    this.max_epochs = 1000;
    
    this.max_history;
    this.history = []; // state of current and up to max_history or perceptron;
    // ex: [{"epoch": 12, "error": .023023023},{"epoch": 13, "error": .022023498}...]

    for(var i = 0, len = this.nodes.length; i < len; i++) {
        this.nodes[i] =  new Perceptron(input_dimension+1, learning_rate); // account for bias
    }
}
SinglelayerPerceptron.prototype = {
    constructor: SinglelayerPerceptron,

    train_offline: function(all_input,all_expected){
        var error = 0;

        for(var i = 0, len = all_input.length; i < len; i++) {
            // accumulate the error
            error+= this.forward_flow(all_input[i],all_expected[i]);
        }
        error = error / all_input.length;
        // record the error
        console.log("error: "+ error);
        this.update_history(error);
        return error;
    },

    forward_flow: function(input,expected){
        var out, risk, error;
        switch(this.type) {
            // todo: complete k-class and regression cases
            case "bernoulli":
                out = this.calc(input);
                risk = 1 / (1 + Math.exp( -1 * out));  // sigmoid
                this.update(input,risk,expected);
                // cross_entropy
                error= -(expected*Math.log(risk))-((1-expected)* Math.log(1-risk));
                return error;
                break;

            case "regression":
                var out = this.calc(input);
                // square_error
                return .5 * Math.pow((expected -out),2)
                    break;
            case "k-class":
                // softmax
                break;
        }
    },
    update: function(input, output, expected) {
        switch(this.type){
            case "regression": // fall through
            case "bernoulli":

                for(var i = 0, len = this.nodes.length; i < len; i++) {
                    this.nodes[i].update(input,output, expected);
                }
                break;

            case "k-class":

                for(var i = 0, len = this.nodes.length; i < len; i++) {
                    this.nodes[i].update(input,output[i], expected[i]);
                }
                break;
        }
    },
    calc: function(input) {
        var output = [];
        input[input.length] = 1; // bias input is always 1
        for(var i = 0, len = this.nodes.length; i < len; i++) {
            output[i] = this.nodes[i].calc(input);
        }
        return output;
    },
    update_rate:function(new_rate){
        for(var i = 0, len = this.nodes.length; i < len; i++) {
            this.nodes[i].rate = new_rate;
        }
    },
    /* Called after all test cases have been seen once, or can becalled after 
     * every training case and then "epoch", will mean just test case  count;*/
    update_history: function(error){

        if(this.max_history<= this.epoch){ this.history.shift();}
         this.epoch++;
         this.history.push({"error": error, "epoch":this.epoch});
    },

    error_graph: function(){
        
        var margin = {top: 10, right: 10, bottom: 20, left: 40},
            width = 500 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;
            x_value = function(d) { return d.epoch; },
            y_value = function(d) { return d.error; },

            x_scale = d3.scale.linear().range([0,width]),
            x_axis = d3.svg.gridAxis()
                .scale(x_scale).ticks(10).orient("bottom").tickSize(6,4,6).tickSubdivide(2).tickGridSize(height),

            y_scale = d3.scale.linear().range([height,0]),
            y_axis = d3.svg.gridAxis()
                .scale(y_scale).orient("left").ticks(10).tickSize(6,3,6).tickSubdivide(2).tickGridSize(width);
            
            line = d3.svg.line()
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
                    x_scale.domain([0,d3.max(data,function(d){return d[0];})]);
                    y_scale.domain([0,d3.max(data,function(d){return d[1];})]);

                    // select the graph if it exists,
                    // only giving it arry, dont give it the true data
                    var svg = d3.select(this).selectAll("svg").data([data]);

                    // otherwise create g element holder for the graph
                    // inner dimension
                    var new_svg = svg.enter().append("svg").append("g");
                    // y axis
                    new_svg.append("g").attr("class","y axis");
                    // x axis
                    new_svg.append("g").attr("class","x axis");
                    //error line
                    new_svg.append("path").attr("class","line");

                    // Update the outer dimensions.
                    svg
                        // make sure we can see tick marks
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    //
                    // Update the inner dimensions.
                    var g = svg.select("g")
                        .attr("width",width)
                        .attr("height",height)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("class", "graph");

                    g.select(".x.axis")
                        .attr("transform", "translate(0," +(height) + ")")
                        .call(x_axis);

                    g.select(".y.axis")
                        .call(y_axis);
                    // update line
                    g.select(".line")
                        .attr("d",line);
            });
        }

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
}


l = new SinglelayerPerceptron(2,1, "bernoulli",0.1); // 1 perception getting input from a 2 diminsion vector
var i = 1;                    
//graph = basic_line_graph;

function epochs () {          
   setTimeout(function () {    
       // or function
   error = l.train_offline([[1,0],[0,1],[0,0],[1,1]],[0,0,0,1]);
   //d3.select("body").datum(l.history).call(graph());
   d3.select("body").datum(l.history).call(l.error_graph());
      i++;                     //  increment the counter
      if (error >.05 && i <600) { 
         epochs();             //  ..  again which will trigger another 
     }
     else{
        console.log("weights");
        for(var t=0; t<l.nodes.length; t++){
            console.log(l.nodes[t].weights);
        }
        console.log(l.calc([1,1]));
        console.log(l.calc([0,1]));
        console.log(l.calc([1,0]));
        console.log(l.calc([0,0]));
    }
   }, 10)// set timeout
}

epochs();    

