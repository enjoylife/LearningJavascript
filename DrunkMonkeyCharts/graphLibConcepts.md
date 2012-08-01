#Graphing Library Concepts and Direction

Ideas and thoughts to help direct and provide a reference for my ideas while I code. 
Outlining again the basic principles mentioned in the inital idea,
1. Define basic graphs and the abilities that have
    * Editable 
    * Efficent
    * Customizable
    * Updatable
    * Modular

So in trying to achieve these here the more finer grained details of the implementation

## Indivdual Graphs
* These should be self contained and only expose Customizable options. 
* The exposed api for graphs should be consistant regardless of it's underlying implementation, or to some extent type of graph. 
* The types of options starting from the most universal and going towards the more niche are these, size (ie, width, height), discrete color schemes, different apperances, morphing (ie, transitioning to far more radical apperances), etc.
* A way of thinking about how the pieces fit togther, conforms to this analogy. Think of the scales, and background pieces of the graphs as psudo-immutable. You initally create these graphs, and then you just feed in the data and then they update themselves transparently from the user.
And example is the basic 2 axis time seris graph with axis. This is first initally called, setup with it's default options and, then from this point forward, it is able to recieve data. Then when you want to add data, you call a .add / render function on this graph and it takes care of all the details nessaccary.

## Exposed Graph API
* Common to all, adding additional layers of data, removing additional layers
* Unique calls to more radical graphs... TODO

## Graphing Manager
* The concept of a graphing manager is to provide an abstraction for creating  additional graphs, managing data state for more efficent manipulations, and to provide hook points for more future manipulations on the graph data.
* I Envision a UI directly connected this manager, enabling a dashboard/tiling manager like feel when using multiple graphs.


