function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}
/* Perceptron is a simple unit that creates a non-linear output from linear
 * combinations of it's inputs. 
 *
 * Things Learned:
 *      * Unit is metaphorically speaking split into two parts, the right side
 *      which stores the computed output from summing (inputs*incoming_weight), 
 *      and the left side stores the computed unit error, which is the 
 *      derivative of the output with respect to the the input.
 *      * When bacpropagating error, you need to account for all the errors of
 *      all the units that this units output is going into.

                                  weight       
                                      \* unit.error 
                                       /
      unit.error = ( unit.derivative* (+) )
                                       \
                                     /*  unit.error
                                   weight     
 * Params:
 *      input_dimension = determines the starting number of incoming connections
 * to this perceptron.
 *
 *      learning_rate = constant of proportionality which affects the size of
 * updates to the weights, and therefore the speed of convergance, and possibly
 * if it's too big, whether it can converge. */

    
function Perceptron(input_dimension, learning_rate) {
    this.weights = new Array(input_dimension); // column vectors 
    // stored in unit for future rate per unit net settings
    this.rate = learning_rate; // should be negative or positive???

    // computed in forward pass
    this.output = 0;  // right side
    this.derivative = 0;   // left side 
    
    this.partial_derivative = []; // cummulative error per weight

    // intialize random weights
    for(var i = 0, len = this.weights.length; i < len; i++) {
        this.weights[i] = (Math.random()*.1)-.05; // starting very close to linear 
    }
}

Perceptron.prototype = {
    constructor: Perceptron,

    /* Used in the left-to-right forward operations of a network.
     * Defines the needed unit derivative and the computed output of it's
     * input, which is then passed along to layers farther up in the net.
     *
     * Params:
     *      input = the array of values returned by prior units below 
     *      Or in the case that this is the first hidden layer it's input is from
     *      the initial outside input.
     * Returns:
     *      a single floating point value from its output function.(sigmoid) */
    calc: function(input) {
        console.log("Calculating for a perceptron");
        var sum = 0;
        // right side
        assert(this.weights.length == input.length, "mismatch in unit input to weight calc");
        for (var i = 0, lim = this.weights.length; i < lim; i++){
            sum += input[i] * this.weights[i];
        }
        this.output =  1 / (1 + Math.exp(-sum)); //sigmoid 
        this.derivative = this.output * (1-this.output); // derivative of sigmoid
        console.log("perceptron output " +this.output);
        return this.output;
    },
    
    /* Called when running backpropagation through the network.
     * Params: 
     *      input = the original input that was computed in  feedforward 
     *      backprop_error = the accumulative error upto this unit from all
     *      possilbly connected units.
     *      output_units_weights = the weights from each unit that this unit has
     *      output going into. */
    backprop: function(input, output_units_weight, backprop_errors){
        console.log("backproping for a perceptron");
        var sum = 0;
        assert(output_units_weight.length == backprop_errors.length,"backprop mismatch");
        for (var i = 0, lim = output_units_weight.length; i < lim; i++){
           sum +=  backprop_errors[i] * output_units_weight[i];
        }
        // backpropagaed error 
        error = this.derivative * sum;

        assert(this.weights.length == input.length,"weight to input mismatch");
        for (var i = 0, lim = this.weights.length; i < lim; i++){
            this.partial_derivative[i] = error * input[i]; 
        }
        return error; //backpropaged error 
    },

    /* The method called when all errors have been backpropageted and calculated
     * by a network and the current weights are not longer needed. */
    update: function() { 
        for(var j = 0, len = this.weights.length; j < len; j++) {
            this.weights[j] += this.rate * this.output * this.partial_derivative[i];
        }
    }
}

/* The OutputUnit is the final unit that data is passed through inorder to
 * convert the feed_forwaded calculations into the correct error outputfor the
 * problem type (regression, bernoulli, or k-class). Differs from a normal
 * perceptron in that it must convert the input from previous layers into the
 * desired output, and must provide the initial derivatives for all the layers
 * below it.
 *
 * Regression is a single real valued output. 
 * K-class is the probability  of k>2 classes.
 * Bernoulli is the linear discriminant of two classes with a single output being,
 * class 1 if output >0 and class 2 otherwise.
 *
 * Params:
 *      type = the type of problem to be solved. 
 *
 *      input_dimension = determines the starting number of incoming connections
 *      to this perceptron.
 *      
 *      output_dimension = used if type is k-class, and determines the number of
 *
 *      output classes.If not using k-class its ignored.
 *
 *      learning_rate = constant of proportionality which affects the size of
 *      updates to the weights, and therefore the speed of convergance, and possibly
 *      if it's too big, it's convergance. */
function OutputUnit(input_dimension, learning_rate) {
    this.weights = new Array(input_dimension); // column vectors 
    // stored in unit for future rate per unit net settings
    this.rate = learning_rate; // should be negative or positive???

    // computed in forward pass
    this.output = 0;  // right side
    this.derivative = 0;   // left side 
    
    this.partial_derivative = []; // cummulative error per weight

    // intialize random weights
    for(var i = 0, len = this.weights.length; i < len; i++) {
        this.weights[i] = (Math.random()*.1)-.05; // starting very close to linear 
    }
}

OutputUnit.prototype = {
    /* Used in the left-to-right forward operations of a network.
     * Defines the needed unit derivative and the computed output of it's
     * input, which is then passed along to layers farther up in the net.
     *
     * Params:
     *      input = the array of values returned by prior units below 
     *      expected = the true value of the output
     * Returns:
     *       a numer, which is the square error for this unit.   */
    calc: function(input,expected) {
        console.log("Calculating for a output unit");
        var sum = 0;
        var error;
        // right side
        assert(this.weights.length == input.length, "mismatch in unit input to weight calc");
        for (var i = 0, lim = this.weights.length; i < lim; i++){
            sum += input[i] * this.weights[i];
        }
        this.output =  1 / (1 + Math.exp(-sum)); //sigmoid 
        error = 0.5 * Math.pow((this.output-expected),2); //square error
        // heres the change, now we have to use the square error derivative also
        this.derivative = this.output * (1-this.output) * (this.output - expected);
        return error;
    },

    // NEW BACKPROP
    backprop: function(input){
        console.log("backproping for a output unit");
        for (var i = 0, lim = this.weights.length; i < lim; i++){
            // This is a change too 
            this.partial_derivative[i] = this.derivative * input[i];
        }
    },

    /* The method called when all errors have been backpropageted and calculated
     * by a network and the current weights are not longer needed. */
    update: function() { 
        for(var j = 0, len = this.weights.length; j < len; j++) {
            this.weights[j] += this.rate * this.output * this.partial_derivative[i];
        }
    }
}
function Layer(num_units,input_dimension,learning_rate){
    // the total group of perceptrons in this layer
    this.units = new Array(num_units);
    for(var j = 0, len = this.units.length; j < len; j++) {
        this.units[j] = new Perceptron(input_dimension, learning_rate);
    }
}
Layer.prototype = {
    constructor:Layer,

    add_units: function(num_to_add){
    },

    delete_units: function(num_to_delete){
    },

    calc: function(){
    },
    backprop: function(){
    },
    update: function(){
    },


function HiddenLayer(num_layers, num_units, input_dimension, learning_rate) {
    this.num_layers = num_layers;
    this.num_units = num_units;
    this.input_dimension = input_dimension;
    this.learning_rate = learning_rate;
    this.layers = new Array(num_layers);
}
HiddenLayer.prototype = {
    constructor:HiddenLayer,

    /* adds new layer */
    new_layer: function(layer_position, input_dimension){
        layer = new 
        this.layers.splice(layer_position,0,
        // copy old layers
    },

    delete_layer: function(layer, ,input_dimension){
    },

    add_units: function(layer, num_to_add){
    },

    delete_units: function(layer, num_to_delete){
    },
    calc: function(){
    },
    backprop: function(){
    },
    update: function(){
    },

}
/*
 * Neural Network
 *
 * Things Learned:
 *      * ALWAYS define loop conditions upper bound on arrays to be that arrays length
 *      property, not the intial number for construction. Just asking for
 *      bugs and unintended errors if done otherwise. 
 *
 *      * Complexity should gradually increase and abstraction should gradually decrease.
 *      Start vague and all encompasing. As progress is made, add the specific and more
 *      specialized pieces as needed.
 */

function MultilayerPerceptron(input_dimension,opts){
    // optional params
    this.input_dimension = input_dimension;

    this.type = typeof opts.type !== 'undefined' ? opts.type : "bernoulli";
    this.output_dimension = 
        typeof opts.output_dimension !== 'undefined' ? opts.output_dimension : 1;

    this.num_hidden = typeof opts.num_hidden !== 'undefined' ? opts.num_hidden : 1;
    this.hidden_size = typeof opts.hidden_size !== 'undefined' ? opts.hidden_size : 2;

    this.learning_rate = typeof opts.learning_rate !== 'undefined' ? opts.learning_rate : -0.2;
    this.momentum = typeof opts.momentum !== 'undefined' ? opts.momentum : 0.1;
    this.debug = typeof opts.debug !== 'undefined' ? opts.debug : true;
    this.delay = typeof opts.delay !== 'undefined' ? opts.delay : 0;

    this.output = 0;
    this.error = 0;

    // initalize the hidden layers
    this.layers = new Array(this.num_hidden+1); //acount for outputunit 
    for(var i = 0, len = this.layers.length; i < len; i++) {
        this.layers[i] = new Array(this.hidden_size); 
    };
    console.log(this.layers);

    // Remember to account for bias input in perceptron and output dimensions

    // first layer must handle input dimensions 
    for(var i = 0, len = this.hidden_size; i < len; i++) {
        this.layers[0][i] = new Perceptron(this.input_dimension+1, this.learning_rate);
    };
    // create hidden layers 
    for(var i = 1, len = this.layers.length-1; i < len; i++) {
        for(var y = 0, len2 = this.hidden_size; y < len; y++) {
            this.layers[i][y] = new Perceptron(this.hidden_size+1, this.learning_rate);
        }
    }
    // create output 
    for(var i = 0, len = this.hidden_size; i < len; i++) {
        this.layers[this.layers.length-1][i] = new OutputUnit(this.hidden_size+1,this.learning_rate);
    }
}

MultilayerPerceptron.prototype =  {
    constructor: MultilayerPerceptron,

    offline_learning: function(all_input_data){
    },

    online_learning: function(input_instance){
    },
    
    // feed to each layers output to next layers input 
    feed_forward: function(input,expected){
        var out= [];
        var out_index = this.layers.length-1;
        // deal with hidden layers
        this.forward_flow(input,0);
        // deal with output unit
        for(var i = 0, len = this.layers[out_index].length; i < len; i++) {
            out[i] = this.layers[out_index][i].calc(this.output,expected);
        }
        //this.output = o['output'];
        //this.error = o['error'];
        console.log(out);
        this.output = out;
        return out;
    },
    forward_flow: function(input,index){
        var upper_bound = this.layers.length-1; // account for output unit
        var output = [];
        // exit condition
        if (index == upper_bound){
            input[input.length] = 1; //bias unit always 1;
            this.output= input; 
        } else {
            input[input.length] = 1; //bias unit always 1;
            for(var i = 0, len = this.layers[index].length; i < len; i++) {
                output[i] = this.layers[index][i].calc(input);
            }
            this.forward_flow(output,++index);
        }
    },
    // give each layer the previous layers output (the backpropagated error)
    // give it this.error to start
    //backprop: function(input, output_units_weight, backprop_errors){
    back_prop: function(input,index){
        var output;
        var out_index = this.layers.length-1;

        for(var i = 0, len = this.layers[out_index].length; i < len; i++) {
            output[i] = this.layers[out_index[i]].backprop(this.output);
        }
        try{
            for(var i = 0, len = this.layers[index].length; i < len; i++) {
                output[i] = this.layers[index][i].backprop(input);
            }
            // its the output unit
        } catch(TypeError){
            output[i] =  this.layers[index].backprop(output);
        }
        this.back_prop(output,--index);
    },

    backward_flow: function(input, output_unit_weights, backprop_errors) {

    },

    // update the weights only after completing both feed_forward and back_prop,
    // or else messes up gradient descent
    update: function(){
        for(var i = 0, len = this.layers.length-1; i < len; i++) {
            for(var y = 0, len2 = this.layers[i].length; y < len2; y++) {
                this.layers[i][y].update();
            };
        };
    },
    improve: function(){
    },

    /** Inference tool **/

    /** graphical tools **/
    layout_chart: function(selection){
    },
    error_chart: function(selection){
    },
    weight_chart: function(selection){
    },
    inference_chart: function(selection){
    },

    /** Helpers **/
    debuging: function () {
        function noopConsole() {
            var konsol = {};
            function noop(){}
            for (var k in window.console) {
                    konsol[k] = noop;
            }
            return konsol;
        }
         console = this.debug ? window.console : noopConsole();
    },

    /** getters and setters **/
    
}

a = new MultilayerPerceptron(2,{});
a.feed_forward([0,0],0);
//a.back_prop(1, a.layers.length-1);
/*a.update();
a.feed_forward([1,0],0);
a.back_prop(1, a.layers.length-1);
a.update();
a.feed_forward([1,1],1);
a.back_prop(1, a.layers.length-1);
a.update();
*/
/*
    var i  = 0 ;
function epochs () {           //  create a loop function
   setTimeout(function () {    //  call a 3s setTimeout when the loop is called
    a.feed_forward([0,0],0);
    a.back_prop(1, a.layers.length-1);
    a.update();
    a.feed_forward([1,0],0);
    a.back_prop(1, a.layers.length-1);
    a.update();
    a.feed_forward([0,1],0);
    a.back_prop(1, a.layers.length-1);
    a.update();
    a.feed_forward([1,1],1);
    a.back_prop(1, a.layers.length-1);
    a.update();
    console.log("ERROR " +a.error);
      i++;                     //  increment the counter
      if (i <20) { 
         epochs();             //  ..  again which will trigger another 
     }
     else{
        console.log("weights");
        for(var t=0; t<a.layers.length-1; t++){
            console.log(a.layers[t].weights);
        }
        a.feed_forward([0,1],0);
        console.log(a.output);
        a.feed_forward([0,1],0);
        console.log(a.output);
        a.feed_forward([0,1],0);
        console.log(a.output);
        a.feed_forward([0,1],0);
        console.log(a.output);

        }
   }, 400)// set timeout
}

epochs();    
*/
console.log(a.layers);
