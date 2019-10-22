import numpy as np

# import matplotlib
# matplotlib.use('nbagg')
import matplotlib.pyplot as plt

from sklearn.datasets import make_regression

import io

def create_simple_regression_data(n_samples, n_features, outName, bias = 10, noise = 15):
    # create data from sklearn make_regression
    X, y = make_regression(n_samples=n_samples,
                            n_features=n_features,
                            bias=bias,
                            noise=noise,
                            random_state=15)
    # plot the data
    plt.scatter(X, y, s=5)
    plt.title("1D data with 100 points for Regression")
    plt.show()

    # stack the data.. ie., make X and y as single np array.
    data = np.column_stack((X, y))
    
    # # create a IO buffer 
    # buf = io.BytesIO()
    # save the data to the disk as csv file.
    np.savetxt(outName, data, delimiter=',')
    print(" Shape of the data saved :  ", data.shape)


if __name__ =='__main__':
    
    # create and save the regression data.
    create_simple_regression_data(100,1,'data_files/reg_data.csv')

    

