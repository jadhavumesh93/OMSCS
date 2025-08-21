import pandas as pd
import numpy as np
import datetime
from sklearn.preprocessing import MinMaxScaler
#import torch
#import torch.nn as nn

class RNNModel:
    def __init__(self) -> None:
        pass
    def printName(self):
        return "Umesh"
    
    # Probably to be placed in an Utility class
    def filterTrainingData(self, df, fromdate, todate):
        # Filter Data based on dates received for backtesting
        train_data, test_data = [], []
        print("Reached to filterTrainData")
        if(fromdate is None):
            #mindate = min(df['DATE'])
            #maxdate = max(df['DATE'])
            train_data = df[(df['DATE'] < '2023-04-01')]
            test_data = df[(df['DATE'] >= '2023-04-01') & (df['DATE'] <= '2023-04-30')]
        else:
            train_data = df[(df['DATE'] < fromdate)]
            test_data = df[(df['DATE'] >= fromdate) & (df['DATE'] <= todate)]
        return train_data, test_data