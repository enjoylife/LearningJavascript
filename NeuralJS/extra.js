/*
 * Helpers
 */

Array.prototype.max=function()
{
	if (this.length == 0)
		return {'index':-1};
	var maxIndex = 0;
	for (var i = 1; i<this.length; i++)
		if (this[i]>this[maxIndex]) 
			maxIndex = i;
	return {'index':maxIndex, 'value':this[maxIndex]};
}


/*
* memoize.js
* by @philogb and @addyosmani
* further optimizations by @mathias, @DmitryBaranovsk & @GotNoSugarBaby
* fixes by @AutoSponge
* perf tests: http://bit.ly/q3zpG3
* Released under an MIT license.
*/
(function (global) {
    "use strict";
    global.memoize = global.memoize || (typeof JSON === 'object' && typeof JSON.stringify === 'function' ?
        function (func) {
            var stringifyJson = JSON.stringify,
                cache = {};

            return function () {
                var hash = stringifyJson(arguments);
                return (hash in cache) ? cache[hash] : cache[hash] = func.apply(this, arguments);
            };
        } : function (func) {
            return func;
        });
}(this));



/*

    square_error: function(output, expected) { return .5 * Math.pow((expected -output),2);},
    calc_max: function(input) { return  this.calc(input).max(); }, 
    // if needing a nonlinear output or the posterior probabilites
    calc_posterior: function(input){ return this.sigmoid(this.calc(input)); },

    softmax: function(input) {
        // compute for posteriar probabilties.
        // todo: use look up for second exp loop for speed?
        var sum = 0, output = new Array(input.length);
        for(var i = 0, len = input.length; i < len; i++) {
            sum += Math.exp(input[i]);  
        }
        for(var i = 0, len = input.length; i < len; i++) {
            output[i] = Math.exp(input[i]) / sum;
        }
        return output;
    },

    cross_entropy: function(output, expected) {
       console.log("output: "+ output);
       console.log("expected: "+ expected);
        var sum = 0;
        for(var i = 0, len = this.nodes.length; i < len; i++) {
            sum += expected[i] * Math.log(output[i]);
        }
        return -sum;
    },

OutputUnit.prototype = {
    constructor: OutputUnit,

     /* Params:
     *      input = the array of values returned by prior units it has
     *      connections to. Or the initial outside input.
     *
     *      expected = the true value of the function that is being learned.
    calc: function(input,expected) {
        var risk, class_prop;
        var sum = 0;
        this.input = input;
        this.expected = expected;
        // each case deals with output, weights and derivative differently
        switch(this.type) {
            case "regression":
                return {"output":this.output, "error":this.error};
            case "bernoulli":
                this.derivative = [];
                for (var i = 0, lim = input.length; i < lim; i++){
                    this.error += .5 * Math.pow((expected - input[i]),2); // square_error
                    //this.error += -(expected*Math.log(input[i]))-((1-expected)* Math.log(1-input[i]));// cross_entropy
                    this.output += 1 / (1 + Math.exp(-input[i]));
                    this.derivative[i] = (input[i]*(1-input[i])) * (input[i] - expected);
                    //this.derivative[i]=  input[i]*(1-input[i]) * (-(expected/input[i]) + ((1-expected)* (1 - input[i])));
        // derivative of sigmoid
                    }
                console.log("output "+ this.output);
                console.log("derivative "+ this.derivative);
                console.log("error " + this.error);
                return {"output":this.output, "error":this.error};
                
            // depends on output_dimension
            case "k-class":
                // right side
                sum = [];
                for (var i = 0, lim = this.class_weights.length; i < lim; i++){
                    sum[i] = 0;
                    for(var y = 0, len = this.class_weights[i].length; y < len; y++) {
                        sum[i] + this.class_weights[i][y] * input[y];
                    };
                };
                class_prob = this.softmax(sum);
                // left side
                // error function
                for(var i = 0, lim = class_prob.length; i < lim; i++){
                    this.error += expected[i] * Math.log(class_prob[i]);
                };
                // derivative
                for(var i = 0, lim = class_prob.length; i < lim; i++){
                    this.derivative[i] = input[i] -this.error;
                };
                // returns array
                this.output = class_prob;
                return {"output":this.output, "error":this.error};
        }
    },
    // NEW BACKPROP
    backprop: function(input, backprop_error){
        console.log("backproping for a perceptron");
        var sum = 0, result;
        // we don't back prop to the bias weight 
        // dont propagate to the bias weight
        for (var i = 0, lim = this.weights.length-1; i < lim; i++){
            this.partial_derivative[i] = this.derivative * backprop_error * input[i];
        }
    },
    /** Called when running backpropagation through the network.
     * Params: 
     *      backprop_error = the passed partial derivatives of the units
     *      after it and that are connected to this units output.*/
    backprop: function(backprop_error){
        var n = 0, result=[];
        switch(this.type){
            case "regression": //fall through
            case "bernoulli": 
                return this.derivative;
            case "k-class":
                for (var i = 0, lim = this.class_wieghts.length; i < lim; i++){
                    for (var y = 0, len = this.class_wieghts[i].length; y < len; y++){
                        n += this.class_weights[i][y] * backprop_error[y];
                    }
                    this.partial_derivatives[i] = this.derivative[i] * n;
                }
                return this.partial_derivatives;
        }
        
    },

    /* The method called when all errors have been backpropageted and calculated
     * by a network and the current weights are no longer needed. */
    update: function() {
        switch(this.type){
            case "regression": 
                break;
            case "bernoulli": 
                break;
                for(var j = 0, len = this.weights.length; j < len; j++) {
                    this.weights[j] += this.rate * (this.expected- this.output) *this.input[j];
                }
                break;
            case "k-class":
                break;
                for (var i = 0, lim = this.class_weights.length; i < lim; i++){
                    for (var y = 0, len = this.class_wieghts[i].length; y < len; y++){
                        this.class_weights[i][y] += this.rate * this.output[i] * this.partial_derivatives[i];
                    }
                }
                break;
        }
    },

    softmax: function(input) {
        // compute  posterier probabilties.
        // todo: use look up for second exp loop for speed?
        // it's all interpreted no matter what, still going to be slooooow
        var sum = 0, output = new Array(input.length);
        for(var i = 0, len = input.length; i < len; i++) {
            sum += Math.exp(input[i]);  
        }
        for(var i = 0, len = input.length; i < len; i++) {
            output[i] = Math.exp(input[i]) / sum;
        }
        return output;
    },
}
