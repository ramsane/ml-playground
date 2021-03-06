/**
 * @param {*} data : It will saperate both train and test data
 * along with postive and negative classes in each of them.
 X1 
 */
function prepare_data_and_chart_for_logistic_regression(train_data, test_data){
    
    // store the X_1 and X_2 in the lr_train and lr_test objects.
    // lr_train.X_1 = math.evaluate('train_data[:,1]',{train_data});
    lr_train.X_1 = math.column(train_data, 0);
    lr_train.X_2 = math.column(train_data, 1);
    lr_train.y = math.column(train_data, 2);

    lr_test.X_1 = math.column(test_data,0);
    lr_test.X_2 = math.column(test_data,1);
    lr_test.y  = math.column(test_data,2);


    // standardize train and test with train parameters(mean and std_devialtion)
    // find train_x1's and train_x2's mean and std
    let [train_X1_mean, train_X2_mean] = [math.mean(lr_train.X_1), math.mean(lr_train.X_2)]    
    let [train_X1_std, train_X2_std] = [math.std(lr_train.X_1), math.std(lr_train.X_2)]

    // standardize X1 and X2 of train and test
    lr_train.X_1 = lr_train.X_1.map(x => [(x-train_X1_mean)/train_X1_std])
    lr_train.X_2 = lr_train.X_2.map(x => [(x-train_X2_mean)/train_X2_std])

    lr_test.X_1 = lr_test.X_1.map(x => [(x-train_X1_mean)/train_X1_std])
    lr_test.X_2 = lr_test.X_2.map(x => [(x-train_X2_mean)/train_X2_std])

    // build back the train_data and test_data with this normalized data
    train_data = math.concat(lr_train.X_1, lr_train.X_2, lr_train.y, 1)
    // console.log(train_data);
    
    test_data = math.concat(lr_test.X_1, lr_test.X_2, lr_test.y, 1)

    // Update the draw plot function based on the min and max of train and test


    // It will be useful to plot the graph with ease.
    // saperate positive and negative classes for the train data.
    lr_train.pc = train_data.filter(val => { return val[2] == 1; });
    lr_train.nc = train_data.filter(val => { return val[2] == 0; });
    // similarly saperate for test data..
    lr_test.pc = test_data.filter(val => { return val[2] == 1; });
    lr_test.nc = test_data.filter(val => { return val[2] == 0; });

}
/**
 * function to draw the plots and return  the container variable in which the plot 
 * the data.
 *
 * @param {*} data All of the data(csv) in string format.(response text from
 * the JQuery GET Request.)
 * @param {*} chart_container  Dom object of plot in which we have to draw something.
 * @param {*} loss_container Dom object of loss_plot which will plot both train and 
 * test data.
 */
function draw_plot(chart_container, loss_container){

    // prepare train and test data.

    // Generate the list of faetures from the list.
    // ********************************************
    // 1. For the train data.
    let X1 = lr_train.X_1;
    let X2 = lr_train.X_2;
    let m = X1.length;
    
    lr_train.X = math.evaluate('concat(ones([m,1]),'+log_reg_params.features.join()+')', {
        X1,
        X2,
        m
    });

    // 2. For the test data.
    X1 = lr_test.X_1;
    X2 = lr_test.X_2;
    m = X1.length;
    lr_test.X = math.evaluate('concat(ones([m,1]),'+log_reg_params.features.join()+')', {
        X1,
        X2,
        m
    });



    /*********************************************************
    * Prepare TRAIN_DATA. (both positive and negative.)
    *********************************************************/
    train_pc = lr_train.pc
    train_pc_trace = {
        x:math.flatten(math.evaluate('train_pc[:,1]',{train_pc})),
        y:math.flatten(math.evaluate('train_pc[:,2]',{train_pc})),
        mode:'markers',
        type: 'scatter',
        name : 'Train ( +ve )',
        opacity : 1,
        hoverinfo : "skip",
        marker : {
            size : 6,
            line : {
                color : 'white',
                width : 1
            }
        },
        legendgroup : "train",
        showlegend : true
    };
    // similarly do it for test data..
    train_nc = lr_train.nc
    train_nc_trace = {
        x:math.flatten(math.evaluate('train_nc[:,1]',{train_nc})),
        y:math.flatten(math.evaluate('train_nc[:,2]',{train_nc})),
        mode:'markers',
        type: 'scatter',
        name : 'Train ( -ve )',
        opacity : 1,
        hoverinfo : "skip",
        marker : {
            size : 6,
            color : '#F59C36',
            line : {
                color : 'white',
                width : 1
            }
        },
        legendgroup : "train",
        showlegend : true
    };

    /*********************************************************
    * plot TEST_DATA ( both positive and negative. )
    *********************************************************/
    test_pc = lr_test.pc
    test_pc_trace = {
        x:math.flatten(math.evaluate('test_pc[:,1]',{test_pc})),
        y:math.flatten(math.evaluate('test_pc[:,2]',{test_pc})),
        mode:'markers',
        type: 'scatter',
        name : 'Test ( +ve )',
        hoverinfo : "skip",
        opacity : 1,
        marker : {
            size : 4,
            color : 'rgb(0, 104, 173)',
            line : {
                color : 'black',
                width : 1
            }
        },
        legendgroup : "test",
        showlegend : true,
        visible : "legendonly"
    };
    // similarly do it for test data..
    test_nc = lr_test.nc
    test_nc_trace = {
        x:math.flatten(math.evaluate('test_nc[:,1]',{test_nc})),
        y:math.flatten(math.evaluate('test_nc[:,2]',{test_nc})),
        mode:'markers',
        type: 'scatter',
        name : 'Test ( -ve )',
        hoverinfo : "skip",
        opacity : 1,
        marker : {
            size : 4,
            color : 'rgb(255, 97, 0)',
            line : {
                color : 'black',
                width : 1
            }
        },
        legendgroup : "test",
        showlegend : true,
        visible : "legendonly"
    };


    // get the min and  max values of 'x' and 'y' for this data
    max_x = math.round(math.max(math.max(lr_train.X_1), math.max(lr_test.X_1)) + 1);
    min_x = math.round(math.min(math.min(lr_train.X_1), math.min(lr_test.X_1)) - 1);

    max_y = math.round(math.max(math.max(lr_train.X_2), math.max(lr_test.X_2)) + 1);
    min_y = math.round(math.min(math.min(lr_train.X_2), math.min(lr_test.X_2)) - 1);


    // calculate step value for heat map.
    step_x = (max_x - min_x) / (chart_container.clientWidth*0.20)
    step_y = (max_y - min_y) / (chart_container.clientHeight*0.20)
    
    // generate some random values of z.
    xx = math.range(min_x, max_x, step_x, true).toArray();
    yy = math.range(min_y, max_y, step_y, true).toArray();

    xy_grid_ = []
    for(i=0 ; i<yy.length; i=i+1){
        for(j=0; j<xx.length; j=j+1){
            xy_grid_.push([xx[j], yy[i]])
        }
    }


    X1 = math.evaluate('xy_grid_[:,1]',{xy_grid_});
    X2 = math.evaluate('xy_grid_[:,2]',{xy_grid_});
    m   = xy_grid_.length;


    // let create the features from the selected features.
    grid.xy = math.evaluate('concat(ones([m,1]),'+log_reg_params.features.join()+')', {
        X1,
        X2,
        m
    });


    // store these grid points in an object.
    // add the shape to be resized.. to the grid object.
    grid.reshape_size = [yy.length, xx.length]
    // zz = decision_surface_probs(w)
    // zz = math.zeros(10, 10).map(x =>
    //      math.round(Math.random()));
    var hm = {
          z:  [],
        //   z : [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
          colorscale: [
            ['0.0', '#F6B871'],
            ['0.5', 'white'],
            ['1.0', '#61A7D3']
          ],
          type: 'heatmap',
          x0 : min_x,  dx : step_x,
          y0 : min_y,  dy : step_y,
          showscale : false,
          hoverinfo : 'z'
        };
    
    // prepare the layout for the plot
    var layout = {
        xaxis : {range : [min_x, max_x],
                 fixedrange : false, visible:true},
        yaxis : {range : [min_y,max_y],
                 fixedrange : false, visible:true},
        margin: {l: 0,r: 20,b: 0,t: 10,pad: 0},
        showlegend : true,
        legend: {
            x: 0.1,
            y: 0,
            orientation : 'h'
          }
    }

    Plotly.newPlot(chart_container,
        [train_pc_trace, train_nc_trace, test_pc_trace, test_nc_trace, hm],
        layout).then(function(){
            $("#algo_update_btn").prop('disabled', false);
            $("#algo_update_btn").html('Update')
        });
    /**
     * 
     * prepare the plot for the loss_function animation.
     * 
     */
    // COMPUTE COSTS of both train and test.
    // train_cost = compute_Cost(w, lr_train.X, lr_train.y);
    // test_cost = compute_Cost(w, lr_test.X, lr_test.y);
    var train_cost_line = {
        y : [],
        mode : 'lines',
        name : "Train_loss",
        marker : {color : "gray"},
        opacity : 1
    }

    var test_cost_line = {
        y : [],
        mode : "lines",
        name : "Test_loss",
        opacity : 1,
        marker : {color : "black"}
    }

    var cost_layout = {
        xaxis : {fixedrange : true, visible:false},
        yaxis : {fixedrange : true, visible:false},
        margin: {l: 10,r: 10,b: 10,t: 10,pad: 0},
        showlegend: true,
        hovermode:false,
        legend: {
            x: 0,
            y: 1.15,
            orientation : 'h'
          }
    }

    Plotly.newPlot(loss_container, [train_cost_line, test_cost_line], cost_layout)
}