import pkg_resources
from pkg_resources import DistributionNotFound, VersionConflict
from platform import python_version
import numpy as np
import pandas as pd
import time
from datetime import datetime
import gc
import random
from datetime import timedelta
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

class Ensemble:
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
    
    def ensemble_historic(self, data, rf_weight, rnn_weight, gbm_weight):
        # Create dataset containing predicted data
        main_data = []
        print("tolist = ", data)
        
        for tt in range(len(data['DATE'])):
            dt = {}
            dt['DATE'] = data.iloc[tt, 0]
            dt['Prediction'] = float(data.iloc[tt, 1].replace(',', ''))
            dt["RF"] = data.iloc[tt, 4]
            dt["RNN"] = data.iloc[tt, 3]
            dt["GBM"] = data.iloc[tt, 2]
            dt["MAE"] = data.iloc[tt, 5]
            #print("step 1")
            dt["Ensemble"] = data.iloc[tt, 4] * rf_weight + data.iloc[tt, 3] * rnn_weight + data.iloc[tt, 2] * gbm_weight
            #print("ytesy = ", y_test.values[0])
            '''dt['RF'] = data.iloc[tt, 4] * rf_weight
            print("step 2")
            #print("y_pred_test = ", y_predict_test_rf)
            dt['RNN'] = data.iloc[tt, 3] * rnn_weight
            print("step 3")
            dt['GBM'] = data.iloc[tt, 2] * gbm_weight'''
            main_data.append(dt)
        
        #print("main df = ", main_data)
        #df_main = pd.DataFrame(main_data)
        '''df_main = pd.DataFrame({'DATE' : test_data['DATE'], 'y_yest' : y_test, 'y_test_pred' : y_predict_test_rf})
        df_main.set_index('DATE')'''
        #print("predf = ", df_main)
        #df_main = pd.DataFrame({'DATE' : test_data['DATE'], 'y_test' : y_test, 'y_test_predict' : y_predict_test_rf})

        #return df_main
        return main_data

    def ensemble_predicted(self, data, days):
        # Create dataset containing predicted data
        main_data = []
        #print("tolist = ", data)
        startdate = datetime.strptime(data.iloc[0, 0], '%Y-%m-%d')
        data = data[pd.to_datetime(data['DATE']) <= startdate + timedelta(days=days)]
        print("Before for loop")
        for tt in range(len(data['DATE'])):
            dt = {}
            dt['DATE'] = data.iloc[tt, 0]
            print("After converting date")
            dt['Actual'] = float(data.iloc[tt, 1].replace(',', ''))
            print("After converting Actual")
            '''dt["RF"] = data.iloc[tt, 4]
            dt["RNN"] = data.iloc[tt, 3]
            dt["GBM"] = data.iloc[tt, 2]'''
            #print("step 1")
            dt["Prediction"] = data.iloc[tt, 5]
            print("After converting Prediction")
            #print("ytesy = ", y_test.values[0])
            '''dt['RF'] = data.iloc[tt, 4] * rf_weight
            print("step 2")
            #print("y_pred_test = ", y_predict_test_rf)
            dt['RNN'] = data.iloc[tt, 3] * rnn_weight
            print("step 3")
            dt['GBM'] = data.iloc[tt, 2] * gbm_weight'''
            main_data.append(dt)
        
        #print("main df = ", main_data)
        #df_main = pd.DataFrame(main_data)
        '''df_main = pd.DataFrame({'DATE' : test_data['DATE'], 'y_yest' : y_test, 'y_test_pred' : y_predict_test_rf})
        df_main.set_index('DATE')'''
        #print("predf = ", df_main)
        #df_main = pd.DataFrame({'DATE' : test_data['DATE'], 'y_test' : y_test, 'y_test_predict' : y_predict_test_rf})

        #return df_main
        return main_data

