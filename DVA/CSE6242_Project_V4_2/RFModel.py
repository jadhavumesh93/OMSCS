import pkg_resources
from pkg_resources import DistributionNotFound, VersionConflict
from platform import python_version
import numpy as np
import pandas as pd
import time
import gc
import random
from sklearn.model_selection import cross_val_score, GridSearchCV, cross_validate, train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.svm import SVC
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, normalize
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_squared_error
from sklearn.tree import export_graphviz

class RFModel:
    def __init__(self) -> None:
        pass
    def printName(self):
        return "Umesh"
    
    # Probably to be placed in an Utility class
    def filterTrainingData(self, df, fromdate, todate):
        # Filter Data based on dates received for backtesting
        train_data = df[(df['DATE'] < fromdate)]
        test_data = df[(df['DATE'] >= fromdate) & (df['DATE'] <= todate)]

        return train_data, test_data
    
    def rf_prediction(self, train_data, test_data):
        #print("train data = ", train_data)
        # Define train test split
        x_train = train_data.iloc[:, 1:-1]
        y_train = train_data.iloc[:, -1]
        x_test = test_data.iloc[:, 1:-1]
        y_test = test_data.iloc[:, -1]

        # Perform prediction
        rf_reg = RandomForestRegressor(n_estimators=50, random_state=614, min_samples_leaf=2)
        rf_reg.fit(x_train, y_train)

        y_predict_train_rf = rf_reg.predict(x_train)
        y_predict_test_rf = rf_reg.predict(x_test)

        error_test_x = y_predict_test_rf - y_test
        error_train_x = y_predict_train_rf - y_train

        # Create dataset containing predicted data
        main_data = []
        print("tolist = ", test_data['DATE'].tolist())
        for tt in range(len(test_data['DATE'].tolist())):
            dt = {}
            dt['DATE'] = test_data['DATE'].tolist()[tt]
            print("step 1")
            print("ytesy = ", y_test.values[0])
            dt['y_test'] = y_test.values[tt]
            print("step 2")
            print("y_pred_test = ", y_predict_test_rf)
            dt['y_test_pred'] = y_predict_test_rf[tt]
            print("step 3")
            main_data.append(dt)
        #print("main df = ", main_data)
        #df_main = pd.DataFrame(main_data)
        '''df_main = pd.DataFrame({'DATE' : test_data['DATE'], 'y_yest' : y_test, 'y_test_pred' : y_predict_test_rf})
        df_main.set_index('DATE')'''
        #print("predf = ", df_main)
        #df_main = pd.DataFrame({'DATE' : test_data['DATE'], 'y_test' : y_test, 'y_test_predict' : y_predict_test_rf})

        #return df_main
        return main_data

