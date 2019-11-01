 // function to print the statement to console
 function print(text){
    console.log(text)
    }

// info about the train data.
var lr_train = {
    X_1 : undefined,
    X_2 : undefined,
    X : undefined,
    y : undefined,
    pc : undefined,
    nc : undefined
};
// info about the test data. 
var lr_test = {
    X_1 : undefined,
    X_2 : undefined,
    X : undefined,
    y : undefined,
    pc : undefined,
    nc : undefined
};

// to store info about the algorithm
var log_reg = {
    running : false,
    step : false,
    reqID : undefined,
    w_init : undefined,
    w_updated : undefined,
    epoch_no : 0,
    weights : [],
    train_costs : [],
    test_costs : [],
    chart_container : undefined,
    loss_container : undefined,
    show_disc_db : false
};

// log_reg params
var log_reg_params = {
    file_name : undefined,
    features : undefined,
    feature_names : undefined,
    l_rate : 0.75,
    is_stochastic : undefined,
    batch_size : undefined,
    lambda : undefined,
    reg : undefined,
    l1_ratio : undefined
}


// to store the info about the 
var grid = {
    xy : undefined,
    reshape_size : undefined
};


$(document).ready(function(){

    // to show materialize select options
    $('select').material_select();
    $('.canvas_img_container').css({
        'background': 'url("./img/brush_128.png") center center / 50% no-repeat',
    })
    
    // initialize sidenav
    $(function(){
        // initialize side nav bar.
        $(".button-collapse").sideNav();
    });
    
    // display toast message for algorithms that are not implemented yet.
    $("nav li:not(.active)").click(function(){
        Materialize.Toast.removeAll();
        let $OKButton = $("<button class='btn-flat toast-action'>OK</button>")
        $OKButton.bind('click',function(){
            Materialize.Toast.removeAll();
        });
        let $toastContent = $('<span>It will be updated soon...</span>').add($OKButton);
       
        Materialize.toast($toastContent, 4000, 'rounded')
    });

    // // display toast message on clicking the draw button
    // $("#draw_btn").click(function(){
    //     Materialize.Toast.removeAll();
    //     let $OKButton = $("<button class='btn-flat toast-action'>OK</button>")
    //     $OKButton.bind('click',function(){
    //         Materialize.Toast.removeAll();
    //     });
    //     let $toastContent = $('<span>With this you can draw your own dataset instead of <br>\
    //         choosing from the available ones. This will be updated soon.</span>').add($OKButton);
       
    //     Materialize.toast($toastContent, 5000, 'rounded')
    // });


    // ****************************************************************
    //  Function to handle the dataset selection from the preview pane
    // ****************************************************************
    
    $(".data-item").click(function(){
        // Remove the previously selected item  
        $(".data-item.selected").toggleClass('selected');
        // highlite the current item as selected one.
        $(this).toggleClass("selected");
    });
    
    $("#choose_btn").click(function(){
        $(".data_select_grid").removeClass("hide");
        $(".canvas_img_container").addClass("hide");
        $(".choose_draw > a").removeClass('active')
        $(this).addClass("active")
    });
    $("#draw_btn").click(function() {
        $(".data_select_grid").addClass("hide");
        $(".canvas_img_container").removeClass("hide");
        $(".choose_draw > a").removeClass('active')
        $(this).addClass("active")
    });


    // display the batch_size value as slider is changed.
    $("#batch").on("input", function(){
        // console.log(this.value);
        $(".bs_val").text(this.value);
    });


    // change the regularization parameter when regl_type is changed.
    $("#choose_regs").on('change', function(){
        $("#regl_param").val("")
        let val = this.value;
        // if it is 'l2' reset the reg_param label..
        switch(val){
            case '0':
                // None :  just disable the regularizaion param text box.
                document.getElementById("regl_param").disabled = true;
                break;
            case '2':
               //reset the reg_param label..
               document.getElementById("regl_param").disabled = false;
               $("#regl_param").siblings('b').html("Regularization parameter");
               $("#regl_param").attr({
                    placeholder : '0 <= lambda <= 100',
                    min         : '0',
                    max         : '100',
                    step        : '0.1'
                })
                break;
            case '3':
            case '1':   // elastic or 'l1'
                document.getElementById("regl_param").disabled = false;
                $("#regl_param").siblings('b').html("l1_ratio");
                $("#regl_param").attr({
                    placeholder :  '(0 <= l1_ratio <= 1)',
                    min         : '0.001',
                    max         : '1',
                    step        : '0.001'
                });
        }
    });



    // *************************************************
    //  Update the data On clicking the submit button.
    // **************************************************
    // $("#algo_update_btn").click(function(event){
    $("#update_params").submit(function(event){
        event.preventDefault()

        // first check for errors in the feature string.
        // get feature names from the 'written_features' text field.
        features_string = $("#written_features").val()
        features1 = features_string.split(',').map(
            x => x.trim()  
        )
        features1 = features1.filter(x => x!="")
        feature_names1 = features1.map(x => x.replace('.', ''))
        // print(features1);
        // print(feature_names1);
        

        // Now check if there is any error in the variables.
        try{
            let X1 = [1,2,3]
            let X2 = [-1, 2,-1]

            features1.map(function(feature){
                math.eval(feature, {X1, X2});
            });
        }catch(err){
            //  Display the toast first.
            Materialize.Toast.removeAll();
            let $OKButton = $("<button class='btn-flat toast-action'>OK</button>")
            $OKButton.bind('click',function(){
                Materialize.Toast.removeAll();
            });
            let $toastContent = $('<span>There is some error wiht the params..</span>').add($OKButton);
            Materialize.toast($toastContent, 4000, 'rounded')

            // add error class to the feature input box for few seconds.
            $("#written_features").addClass('error');
            $("#written_features").css('color', 'orange')
            setTimeout(function(){
                $("#written_features").removeClass('error');
                $("#written_features").css('color', 'black')
            }, 4000);

            return
        }

        // update them if there is no error in the variables.
        log_reg_params.features = features1;
        log_reg_params.feature_names = feature_names1;

        $("#algo_update_btn").prop('disabled', true);
        $("#algo_update_btn").html('updating...')
        // stop all the running animations (if any)
        if(log_reg.reqID){
            cancelAnimationFrame(log_reg.reqID)
        }

        // *************************************************************.
        // get all independent parameters from the multiple select form.
        // ****************get features ********************************.
        // let features = [];
        // let feature_names = [];
        // $("#selected_features :selected").map(function(i, opt){
        //     features.push($(opt).val())
        //     feature_names.push($(opt).html().trim())
        // });
        // // update them in the log_reg_params object.
        // log_reg_params.features = features;
        // log_reg_params.feature_names = feature_names;


        // **************get learning_rate************************
        let l_rate = parseFloat($("#l_rate").val());
        log_reg_params.l_rate = l_rate;
        // Update it in algo_params_info section.
        $("#alg_param_info .l_rate span").html(l_rate)
        
        // ****************isStochastic or not******************** 
        let is_stochastic = $("#use_stochastic").is(':checked');
        log_reg_params.is_stochastic = is_stochastic;
        // update t in algo_params_info section
        $("#alg_param_info .is_sgd span").html(is_stochastic?"Yes":"No")

        // *****************get batch_size if SGD****************
        let batch_size = parseInt($('#batch').val());
        log_reg_params.batch_size = batch_size;
        // Update them in the algo_params_info section.
        $("#alg_param_info .bs span").html(is_stochastic?batch_size:"---")

        // ***************** Regularization ****************
        // regs = [];
        // $("#choose_regs :selected").map(function(i, opt){
        //     let opt_val = $(opt).val();
        //     if(opt_val == 1){
        //         regs.push("L1");
        //     }
        //     if(opt_val == 2 ){
        //         regs.push("L2");
        //     }
        // });
        // log_reg_params.regs = regs;
        // update the reg_name in the log_reg_params..
        log_reg_params.reg = $("#choose_regs :selected").html().trim();
            
        // **************   regularization parameter(s)   *********************
        // update it in UI
        // reg_html = "---"
        // switch(regs.length){
        //     case 0 : reg_html = "None";
        //         break;
        //     case 1 : reg_html = regs[0];
        //         break;
        //     case 2 : reg_html = regs.join();
        //         break;
        // }
        // $("#alg_param_info .is_reg span").html(reg_html);
        $("#alg_param_info .is_reg span").html(log_reg_params.reg);

        
        // get the l1_ratio of lambda from the text a/c to the reg selected.
        switch(log_reg_params.reg){
            case 'Elastic':
                log_reg_params.l1_ratio = parseFloat($('#regl_param').val().trim());
                print("Ad")
            case 'L1':
                log_reg_params.l1_ratio = parseFloat($('#regl_param').val().trim());
                break;
            case 'L2' :
                log_reg_params.lambda = parseFloat($('#regl_param').val().trim());
                break;
        }
        // update it in the UI.
        // $("#alg_param_info .reg_lambda span").html(
        //     regs.length == 0?'---':log_reg_params.lambdas.join()
        // );
        let reg_text = '---'
        if(log_reg_params.reg == 'L1' || log_reg_params.reg == 'Elastic'){
            reg_text = log_reg_params.l1_ratio;
        }else if(log_reg_params.reg == 'L2'){
            reg_text = log_reg_params.lambda;
        }
        $("#alg_param_info .reg_lambda span").html(reg_text);


        // Get the data from canvas or file and then draw the plots.
        is_canvas_plot = false;
        if(is_canvas_plot){
            // prepare x1, x2 and y of train and test and pc and nc to plot the graph
            prepare_train_and_test_from_canvas(canvas_data)
            draw_plot(log_reg.chart_container, log_reg.loss_container);
        }else{
            // prepare_train_and_test_from_canvas([1,2,3])
            // get the data from the selected file and draw the plot.
            log_reg.file_name = $(".data-item.selected").attr('path');
            $.get(log_reg.file_name, function(data){
                // get arrays from csv data(raw string)
                data = math.map($.csv.toArrays(data), parseFloat);
                // It will create X_1 and X_2 and y for both train and test data.
                prepare_train_and_test_from_grid(data);
                // Now that we have the data., plot the data and initilaize the model.
                log_reg.chart_container = document.getElementById("chart_container");
                log_reg.loss_container = document.getElementById("loss_container");

                // draw the data plot and cost plots(empty ones..)
                draw_plot(log_reg.chart_container, log_reg.loss_container);

                // Now initialize the model with some random weights and update 
                // corresponding UI elements.
                reset_algo_status(true, false);

            });
        }

    });

    // This function will call only after the 
    // entire page along with enttire scripts is loaded. 
    $(function() {
        // $("#algo_update_btn").click()
    });

    // function to reset the running algorithm status (all the text and status.)
    function reset_algo_status(shuffle_weights, shuffle_data){
        
        shuffle_weights = shuffle_weights == undefined ? false : shuffle_weights ;
        shuffle_data = shuffle_data == undefined ? false : shuffle_data;
        
        // clear all the existing animations in any.
        if(log_reg.reqID){
            cancelAnimationFrame(log_reg.reqID);
        }

        // make runnning status of the algorithm
        log_reg.running = false;
        $("#play_button i").html("play_arrow");

        // reset the epoch number.
        log_reg.epoch_no = 0;
        $("#epoch_count #count").text('000,000');

        // shuffle initial weights also if asked to.
        if(shuffle_weights){
            log_reg.w_init = math.zeros([lr_train.X.size()[1]]).map(x =>
                (Math.random() * 2) - 1 // between -1 and 1
            );
        }


        // Update the train and test costs in the UI.
        // COMPUTE COSTS of both train and test.
        let w = log_reg.w_init;
        let train_cost = compute_Cost(w, lr_train.X, lr_train.y);
        let test_cost = compute_Cost(w, lr_test.X, lr_test.y);
        // add them to the list of costs per epoch.
        log_reg.train_costs = [train_cost];
        log_reg.test_costs = [test_cost];
        // Update the losses in the text label.
        $("#train_loss").html(math.round(train_cost, 7));
        $("#test_loss").html(math.round(test_cost, 7));
        
        // Update Train and teset accuracy in the UI.
        let y_train_pred = math.round(hypothesis(lr_train.X, w))
        $("#accuracy_info #train_acc").html(getAccuracy(math.squeeze(lr_train.y), y_train_pred))
        let y_test_pred = math.round(hypothesis(lr_test.X, w)) 
        $("#accuracy_info #test_acc").html(getAccuracy(math.squeeze(lr_test.y),y_test_pred))


        // Reset the plot's decision boundary.
        Plotly.restyle(log_reg.chart_container, { 
            z : [decision_surface_probs(log_reg.w_init)] 
        }, [4]);


        // Clear the plot  of train and test loss (log loss)
        Plotly.restyle(log_reg.loss_container, { y : [[train_cost]] }, [0]);
        Plotly.restyle(log_reg.loss_container, { y : [[test_cost]] }, [1]);

        // update the latest updated weight as undefined*.
        log_reg.w_updated = undefined;

        // First delete the old chidren of feature_weights item
        $("#feature_weights").html("<h6><b>Features and their weights</b></h6>")
        // append the "BIAS / INTERCEPT" term to this feature weights.
        let $parent = $("<div><div>").addClass("col s12 weight-item").addClass("bias");
        // append children to this tag.
        $("<div class='col s4'></div>").html(" INTERCEPT ").appendTo($parent);
        $("<div class='col s1'></div>").html(" : ").appendTo($parent);
        $("<div class='col s2'></div>").html(w[0]).appendTo($parent);

        // append this parent item to the feature_weights.
        $("#feature_weights").append($parent);
        // Now append the remaining features to the list.
        feature_names = log_reg_params.feature_names;
        for(i=0;i<feature_names.length;i++){
            // create a weight_item from the element.
            $parent = $("<div><div>").addClass("col s12 weight-item").addClass(feature_names[i]);
            
            // add children to this weight-item parent.
            $("<div class='col s4'></div>").html(feature_names[i]).appendTo($parent);
            $("<div class='col s1'></div>").html(" : ").appendTo($parent);
            $("<div class='col s2'></div>").html(w[i+1]).appendTo($parent);
            
            // add this parent div to feature_weights
            $("#feature_weights").append($parent);

        }

    }



    // ************************************************************************
    // COntrol the Algortihm controls like Play_Pause_reset_shuffle btns.
    // *************************************************************************
    // Controling the play__pause__start button.            *
    $("#play_button").click(function(){
        if(log_reg.running == false){
            // first.., make the running status as true.
            log_reg.running=true;
            $(this).find("i").html('pause');

            // Resume/Start the Gradient from
            gradient_descent()

        }else {
            // It is already running. Stop the process first.
            // ie., stop all the animations..
            if(log_reg.reqID){
                cancelAnimationFrame(log_reg.reqID)
            }
            // change the status and icon appropriately.
            log_reg.running=false;
            $("#play_button i").html('play_arrow');
            // $(this).find("i").html('play_arrow');
        }
    });

    // function to perform single step in gradient descent. *
    $("#next_step").click(function(){
        if (log_reg.running == true){
            $("#play_button").click();
        }
        // run gradient descent for one step.
        log_reg.step = true;
        gradient_descent()
    });

    // function to perform the Reset on clicking the reset button *
    $("#reset_algo").click(function(){
        // Reset all the algo status. without changing initial weights.... 
        reset_algo_status(false)
        
    });


    // update the status of binary Output for decision boundary    *
    $("#disc_db").change(function(){
        // change the status in log_reg object.
        log_reg.show_disc_db = this.checked;
        
        // restyle plot layout decision boundary if alog is paused.
        if(!log_reg.running){
            let w = log_reg.w_updated;
            
            if(w == undefined){
                w = log_reg.w_init;
            }

            Plotly.restyle(log_reg.chart_container, {
                z : [decision_surface_probs(w)]
                }, [4])
        }
    });

    // Re initilaize the weights on clikcing the shuffle button.  *
    $("#shuffle_btn").click(function(){
        // reset the all the relevent UI elements.
        reset_algo_status(true)
    });
}); // end of document.ready() function.