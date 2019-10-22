print("run_linear_gradient is loaded...")
/***************************************************
* Helper functions to implement  Linear Regression.  
****************************************************/
// Our hypothesis function( h(w) or output))
function hypothesis(x, w){
    // add ones in other dimension.
    let X = math.matrix([math.ones(x.length), math.flatten(x)])
    // returns the javascript array instead of matrix object.
    return math.eval('w * X', {w, X}).toArray()
}

/***************************************************
*  The cost function for the linear regression 
* without regularization  
****************************************************/
function compute_Cost(w, x, y){
    // we use mse( Mean_Squared_Error ) as our cost function.
    // first get the predicted values with current weights.
    let y_pred = hypothesis(x, w)
    let error = math.eval('y_pred - y',{y, y_pred})

    // no of training samples.
    let m = y.length
    return math.eval("(1/2)*((error*error')/m)",{error,m})
}
/***************************************************
* Gradient Descent Function. It will run and update 
* the plol at the same time.  
****************************************************/
function run_gradient_descent(x, y, w, iterations, learning_rate, is_stochastic, batch_size){



    //cancel all the previous requestanimation frames..
    cancelAnimationFrame(lr_reg_status.reqID);

    if(reg_data.x == undefined){
        alert("fitst load the data..")
        return;
    }

    // empty the previously trained weights and costs
    reg_data.weights = [];
    reg_data.costs = [];


    let m = y.length;
    let weights = reg_data.weights
    let costs = reg_data.costs
    let chart_container = reg_data.chart_container;
    let loss_container = reg_data.loss_container;

    // restyle the cost plot if the animation is 
    //running from the start
    Plotly.restyle(loss_container, {y : [[]]}, [0])


    // push initial weights and costs to the data.
    weights.push(w)
    let cost = compute_Cost(w, x, y)
    costs.push(cost)
    let extreme_points = [math.min(x), math.max(x)]

    
    // function to run gradient descent for one step.
    iter = 0;
    // it will be useful if we use stochastic gradient descent.
    ind_range = math.range(0,x.length);

    function grad_descenent(){
        if(iter < iterations){
            iter += 1;
            let sample_x = x;
            let sample_y = y;
            
            // change the data if it is stochastic....
            if(is_stochastic){
                let sample_ind = math.pickRandom(ind_range, batch_size);
                // get x and y from these sampled indices
                sample_x = math.subset(x, math.index(sample_ind));
                sample_y = math.subset(y, math.index(sample_ind)); 
            }
            

            // prepare the data for vector multiplication
            var X = math.matrix([math.ones(sample_x.length), math.flatten(sample_x)]);
            
            // update the weights..
            let y_pred = hypothesis(sample_x, w);
            let delta_w = math.eval("(X * (y_pred - sample_y)') * (1/m)",
                                    {X, y_pred, sample_y, m});
            w = math.eval("w - learning_rate*delta_w",{w, learning_rate, delta_w});
            weights.push(w.toArray())

            // compute costs
            cost = compute_Cost(w,x,y)
            costs.push(cost)


            // update the plot with this new regression_Line.
            y_pred_line = hypothesis(extreme_points, w)
            // line_animate(extreme_points, y_pred_line)
            // animate the change in the line.
            Plotly.animate(chart_container, {
                // updated data in second trace(ie., reg_line)
                data :[{x : extreme_points, y : y_pred_line}],
                traces : [1]
            }, {
                // anmation propperties
                transition : {duration : 0, easing:'lnear'}, 
                frame :{duration : 0, redraw:false},
                mode : "immediate"
            });

            // extend the graph of costs line.
            Plotly.extendTraces(loss_container,{y : [[cost]]}, [0]);

            print(iter);
            // call this only if we have other frames to render..
            lr_reg_status.reqID = requestAnimationFrame(grad_descenent);
        }
    }

    reqID = requestAnimationFrame(grad_descenent);
    /***************************************************
     *       Don't write any code below the animation.
     ***************************************************/
}
