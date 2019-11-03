/***************************************************
* Helper functions to implement  Linear Regression.  
****************************************************/
// Our hypothesis function( h(w) or output))
function hypothesis(X, w){
    // returns the javascript array instead of matrix object.
    wx = math.evaluate("X * w'", {X, w})
    return sigmoid(wx)
}


// sigmoid function
function sigmoid(z) {
    let g = math.evaluate(`1 ./ (1 + e.^-z)`, {
      z,
    });
  
    return g;
  }

/*********************************************
* It will return the probs of decision surface
* with given(updated) weight vector. 
***********************************************/
function decision_surface_probs(w){
    let probs = math.reshape(hypothesis(grid.xy, w), grid.reshape_size)
    if(log_reg.show_disc_db){
        probs = math.round(probs);
    }

    return probs.toArray()
}

/***************************************************
*  The cost function for the linear regression 
* without regularization  
****************************************************/
function compute_Cost(w, X, y){
    // we use mse( Mean_Squared_Error ) as our cost function.
    // first get the predicted values with current weights.
    h = hypothesis(X, w);
    m = y.length;
    cost = math.evaluate("(1/m) * (-y'*log(h) - (1-y)'*log(1-h))",{m, y, h});
    
    // add Regularizer term for all weights except w_0 (ie., bias or intercept term)
    cost = math.squeeze(cost)  + regularizer_term(m, w); 

    return cost
}

function regularizer_term(m, w){

    let regularizer = 0;
    let bias = w[0]; // we will not include bias term in the regularization.
    let reg_type = log_reg_params.reg;
    
    switch(reg_type){

        case 'L1':
            // add L_1 regularizer term.
            l1_ratio = log_reg_params.l1_ratio;
            l1_norm = math.norm(w) - math.abs(bias);
            regularizer =  math.evaluate('(l1_ratio/m) * l1_norm',{
                l1_norm, l1_ratio, m
            });
            break;

        case 'L2':
            lambda = log_reg_params.lambda;
            // add the L2_regularizer term.
            l2_norm_square = math.evaluate('w*w - bias^2',{w, bias});
            regularizer = math.evaluate('(lambda/m) * l2_norm_square',{
                lambda, m, l2_norm_square
            });
            break;

        
        case 'Elastic':
            // add both regularizers to the cost term.
            l1_ratio = log_reg_params.l1_ratio;
            // add 'L1' regularizer term to the regularizer.
            l1_norm = math.norm(w) - math.abs(bias);
            regularizer =  math.evaluate('(l1_ratio/m) * l1_norm',{
                l1_norm, l1_ratio, m
            });
            
            // Now add 'L2' regularizer.
            l2_norm_square = math.evaluate('w*w - bias^2',{w, bias});
            regularizer += math.evaluate('((1-l1_ratio)/m) * l2_norm_square',{
                l1_ratio, m, l2_norm_square
            });
            break;
    }

    return regularizer;
}

function gradient_descent(){

    // get train and test data from the 
    let sample_x = lr_train.X;
    let sample_y = math.flatten(lr_train.y);
    
    let shape = lr_train.X.size()
    let m = shape[0]; // no of training samples

    let x_test = lr_test.X;
    let y_test = lr_test.y;

    if(log_reg_params.is_stochastic){
        
        // update the sample_x and sample_y
        let ind_range = math.range(0,m);
        let sample_ind = math.pickRandom(ind_range, log_reg_params.batch_size);

        // update the train data with the sampled one
        dims = math.range(0, shape[1]); // ie., list of indices of each dimension.
        sample_x = math.subset(sample_x, math.index(sample_ind, dims));
        sample_y = math.subset(sample_y, math.index(sample_ind));
        // update the number of samples (m)
        // shape = math.size(lr_train.X)
        m = log_reg_params.batch_size;
    }

    // get the weight accordingly. (ie., Resuming or Start with initial weights..)
    let w = log_reg.w_updated ? log_reg.w_updated : log_reg.w_init;

    // update the weights with gradient descent.
    let y_pred = hypothesis(sample_x, w);
    delta_w = math.evaluate("((y_pred - sample_y) * sample_x) * (1/m)",{
        sample_x, sample_y, y_pred, m
    }).toArray();
    
    // ************** Truncated GD ************** 
    let l_rate = log_reg_params.l_rate;
    // l_rate = l_rate + Math.log10(log_reg.epoch_no*l_rate+1);
    // print(l_rate);

    w = math.evaluate("w - l_rate*delta_w",{
        w, l_rate, delta_w
    });


    // ***********************************************
    // handle regularization term to the weight update..
    let l1_ratio = log_reg_params.l1_ratio;
    let lambda = log_reg_params.lambda;
    switch(log_reg_params.reg){
        case 'L1':
            // get the l1_ratio and add the regularization term.
            // remove regularization for intercept term.
            w_0 = w[0]
            w = math.evaluate('w - l_rate*(l1_ratio/m)',{
                w, l1_ratio, m, l_rate
            });
            w[0] = w_0;

            // perform truncated graient descent. for 'L1';
            w = w.map(function(weight){
                // if weight is lessthan theta...
                if(weight > 0 && weight <= 0.05){
                    // print(l_rate*gi)
                    //bring it close to zero..
                    return Math.max(0, weight - l_rate*l1_ratio)
                }
                if(weight >= -0.05 && weight < 0){
                    // print(l_rate*gi)
                    // bring it close to zero.
                return Math.min(0, weight + l_rate*l1_ratio)
                }
                return weight
            });
            break;

        case 'L2':
            // get lambda and do the rest.
            // remove regularization for intercept term.
            w_0 = w[0];
            w  = math.evaluate('w - l_rate*(lambda/m)*w',{
                w, l_rate, lambda, m
            });
            w[0] = w_0;

            break;

        case 'Elastic':
            // get the l1_ratio and do the regularization.
            w_0 = w[0];
            w = math.evaluate('w - l_rate*( (l1_ratio/m) - (((1-l1_ratio)/m)*w) )',{
                w, l_rate, m, l1_ratio
            });
            w[0] = w_0;

            // perform truncated SGD to it.
            // perform truncated graient descent. for 'L1';
            w = w.map(function(weight){
                // if weight is lessthan theta...
                if(weight <= 0.06 && weight >= 0){
                    // print(l_rate*gi)
                    //bring it close to zero..
                    return Math.max(0, weight - l_rate*l1_ratio)
                }
                if(weight <= 0 && weight >= -0.06){
                    // print(l_rate*gi)
                    // bring it close to zero.
                    print(weight)
                    return Math.min(0, weight + l_rate*l1_ratio)
                }
                return weight
            });
            break;
    }




    // update the updated_weight in log_reg.w_updated.
    log_reg.w_updated = w;
    index = 0;
    $("#feature_weights > .weight-item").each(function(){
        // update the weights accordingly.
        $(':last-child', this).html(math.round(w[index], 6))
        index += 1;
    });
    
    // COMPUTE COSTS of both train and test.
    train_cost = math.squeeze(compute_Cost(w, lr_train.X, lr_train.y));
    test_cost = math.squeeze(compute_Cost(w, lr_test.X, lr_test.y));
    
    // add them to the list of costs per epoch.
    log_reg.train_costs.push(train_cost);
    log_reg.test_costs.push(test_cost);


    // UPDATE THE PLOTS.
    // 1. Update the decision boundary of the plot.
    Plotly.restyle(log_reg.chart_container, {
        z : [decision_surface_probs(w)]
        }, [4])
    
    // 2. Update test and train costs line.
    Plotly.extendTraces(log_reg.loss_container, { y : [[train_cost]] }, [0]);
    Plotly.extendTraces(log_reg.loss_container, { y : [[test_cost]] }, [1]);

    // Update the epoch Number in log_reg_status.
    log_reg.epoch_no  = log_reg.epoch_no + 1;
    // update the epoch number in the ui part
    let e = log_reg.epoch_no.toString()
    let epoch_str = math.zeros(6 - e.length).toArray().join('') + e;
    // adding ',' as saperator.
    epoch_str = epoch_str.substr(0,3) + ',' + epoch_str.substr(3);
    // update in the ui element.
    $("#epoch_count #count").text(epoch_str)
    
    // Update the losses in the text label.
    $("#train_loss").html(isNaN(train_cost)?"NaN":math.round(train_cost, 10));
    $("#test_loss").html(isNaN(test_cost)?"NaN":math.round(test_cost, 10));
    
    // calculate test and train accuracy, and update them in the UI.
    let y_train_pred = math.round(hypothesis(lr_train.X, w))
    $("#accuracy_info #train_acc").html(getAccuracy(math.squeeze(lr_train.y), y_train_pred))
    let y_test_pred = math.round(hypothesis(lr_test.X, w)) 
    $("#accuracy_info #test_acc").html(getAccuracy(math.squeeze(lr_test.y),y_test_pred))
    

    // run for next iteration. if the function is not called through step_btn
    if (log_reg.step){
        log_reg.step = false
        return;
    }
    log_reg.reqID = requestAnimationFrame(gradient_descent);
}


// function to find the accuracy of the model.
function getAccuracy(actual, pred){
    // number of samples in the dataset.
    let m_total = math.size(actual)[0];

    // number of points that are correctly classified.
    let m_correct = math.evaluate('sum(equal(actual, pred))',{
        actual, pred
    })

    // return the string foramt for the accuracy to show it in the UI.
    return (m_correct/m_total).toFixed(5) + '( ' + m_correct + '/' + m_total + ' )';
}