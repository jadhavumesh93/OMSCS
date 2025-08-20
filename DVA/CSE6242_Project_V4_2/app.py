from flask import Flask, Response, Request, render_template, request, json, jsonify
import pandas as pd
import subprocess
import pathlib
import os
import numpy as np
from RNNModel import RNNModel
from RFModel import RFModel
from Ensemble import Ensemble

app = Flask(__name__)

# Create instance of classes
rnnModel = RNNModel()
rfModel =  RFModel()
ensembleModel = Ensemble()
# Define Models here
models = ['RF', 'RNN', 'GBM']
@app.route("/")
# For temp use
def index():
    return render_template('home.html', index=True)

@app.route('/bivariate')
def bivariate():
    return render_template('bivariate2.html')

@app.route('/menupage')
def menupage():
    return render_template('menupage.html', index=True)

@app.route('/backtest')
def backtest():
    #models = ['RNN', 'RF', 'GBM']
    return render_template('backtesting2.html', models = models)

def getStocks():
    stocks = np.array(['T5YIE', 'T10Y2Y'])
    return stocks

@app.route('/performbacktest', methods=['GET', 'POST'])
def performBackTest():
    form = request.form
    modelA = form.get("model1")
    modelB = form.get("model2")
    print("form = ", form)
    fromdate = form.get('fromdate')
    todate = form.get('todate')
    print("modelA = ", modelA, " fromdate = ", fromdate)

    # Reading Dataset STARTS
    dfA = readDataFromCsv(modelA)
    dfB = readDataFromCsv(modelB)
    # ENDS

    # Processing STARTS
    train_data_A, test_data_A, train_data_B, test_data_B = [], [], [], []
    pred_df_A, pred_df_B = [], []
    if(modelA == "RNN" or modelB == "RNN"):
        if(modelA == "RNN"):
            train_data_A, test_data_A = rnnModel.filterTrainingData(dfA, fromdate, todate)
        elif(modelB == "RNN"):
            train_data_B, test_data_B = rnnModel.filterTrainingData(dfB, fromdate, todate)
        else:
            train_data_A, test_data_A = rnnModel.filterTrainingData(dfA, fromdate, todate)
            train_data_B, test_data_B = rnnModel.filterTrainingData(dfB, fromdate, todate)

    elif(modelA == "GBM" or modelB == "GBM"):
        pass
    elif(modelA == "RF" or modelB == "RF"):
        if(modelA == "RF"):
            train_data_A, test_data_A = rfModel.filterTrainingData(dfA, fromdate, todate)
            pred_df_A = rfModel.rf_prediction(train_data_A, test_data_A)
        if(modelB == "RF"):
            train_data_B, test_data_B = rfModel.filterTrainingData(dfB, fromdate, todate)
            pred_df_B = rfModel.rf_prediction(train_data_B, test_data_B)
        '''elif(modelB == "RF"):
            train_data_B, test_data_B = rfModel.filterTrainingData(dfB, fromdate, todate)
            pred_df_B = rfModel.rf_prediction(train_data_B, test_data_B)
        else:
            train_data_A, test_data_A = rfModel.filterTrainingData(dfA, fromdate, todate)
            pred_df_A = rfModel.rf_prediction(train_data_A, test_data_A)
            train_data_B, test_data_B = rfModel.filterTrainingData(dfB, fromdate, todate)
            pred_df_B = rfModel.rf_prediction(train_data_B, test_data_B)
        '''
    # ENDS
    #print("type df = ", pred_df_A.head().to_dict())
    #return render_template('backtesting.html', dfA = pred_df_A.to_json(date_format="iso"), dfB = pred_df_B.to_json(), models = models)
    return render_template('backtesting.html', dfA = pred_df_A, dfB = pred_df_B, models = models)


@app.route('/printN', methods=["GET", "POST"])
def printN():
    data = {'name' : "Hi there"}
    print("request data = ", request.json)    
    #return json.dumps(data)
    js = request.json
    modelA = js["modelA"]
    modelB = js["modelB"]
    #print("form = ", form)
    fromdate = js["fromdate"]
    todate = js["todate"]
    print("modelA = ", modelA, " fromdate = ", fromdate)

    # Reading Dataset STARTS
    dfA = readDataFromCsv(modelA if modelA is not None else "RF")
    dfB = readDataFromCsv(modelB if modelB is not None else "RF")
    # ENDS
    print("got DFs")
    # Processing STARTS
    train_data_A, test_data_A, train_data_B, test_data_B = [], [], [], []
    pred_df_A, pred_df_B = [], []
    if(modelA == "RNN" or modelB == "RNN"):
        if(modelA == "RNN"):
            train_data_A, test_data_A = rnnModel.filterTrainingData(dfA, fromdate, todate)
        elif(modelB == "RNN"):
            train_data_B, test_data_B = rnnModel.filterTrainingData(dfB, fromdate, todate)
        else:
            train_data_A, test_data_A = rnnModel.filterTrainingData(dfA, fromdate, todate)
            train_data_B, test_data_B = rnnModel.filterTrainingData(dfB, fromdate, todate)

    elif(modelA == "GBM" or modelB == "GBM"):
        pass
    elif(modelA == "RF" or modelB == "RF"):
        if(modelA == "RF"):
            train_data_A, test_data_A = rfModel.filterTrainingData(dfA, fromdate, todate)
            pred_df_A = rfModel.rf_prediction(train_data_A, test_data_A)
        if(modelB == "RF"):
            train_data_B, test_data_B = rfModel.filterTrainingData(dfB, fromdate, todate)
            pred_df_B = rfModel.rf_prediction(train_data_B, test_data_B)
        '''elif(modelB == "RF"):
            train_data_B, test_data_B = rfModel.filterTrainingData(dfB, fromdate, todate)
            pred_df_B = rfModel.rf_prediction(train_data_B, test_data_B)
        else:
            train_data_A, test_data_A = rfModel.filterTrainingData(dfA, fromdate, todate)
            pred_df_A = rfModel.rf_prediction(train_data_A, test_data_A)
            train_data_B, test_data_B = rfModel.filterTrainingData(dfB, fromdate, todate)
            pred_df_B = rfModel.rf_prediction(train_data_B, test_data_B)
        '''
    else:
        train_data_A, test_data_A = rfModel.filterTrainingData(dfA, fromdate, todate)
        pred_df_A = rfModel.rf_prediction(train_data_A, test_data_A)
        train_data_B, test_data_B = rfModel.filterTrainingData(dfB, fromdate, todate)
        pred_df_B = rfModel.rf_prediction(train_data_B, test_data_B)
    # ENDS
    response_data = [pred_df_A, pred_df_B]
    
    return json.dumps(response_data)
    #print("type df = ", pred_df_A.head().to_dict())
    #return render_template('backtesting.html', dfA = pred_df_A.to_json(date_format="iso"), dfB = pred_df_B.to_json(), models = models)
    #return render_template('backtesting.html', dfA = pred_df_A, dfB = pred_df_B, models = models)

@app.route('/prediction')
def prediction():
    return render_template('prediction.html')

@app.route('/historicweighted', methods=['GET', 'POST'])
def historicweighted():
    
    js = request.json
    rf_weight, rnn_weight, gbm_weight = 0.51, 0.47, 0.02
    print("js = ", js)
    if(js['rf_weight'] is not None):
        rf_weight = float(js['rf_weight'])
    if(js['rnn_weight'] is not None):
        rnn_weight = float(js["rnn_weight"])
    if(js['gbm_weight'] is not None):
        gbm_weight = float(js["gbm_weight"])
    print("weights = ", rf_weight, " == ", rnn_weight, " == ", gbm_weight)

    # Reading Dataset STARTS
    df = readDataFromCsv("ensemble")
    df = ensembleModel.ensemble_historic(df, rf_weight, rnn_weight, gbm_weight)
    # ENDS
    print("got DFs", df)
    # Processing STARTS
    '''pred_df_A = rf_weight * df['RF']
    pred_df_B = rnn_weight * df['RNN']
    pred_df_C = gbm_weight * df['GBM']'''

    # ENDS
    #response_data = [pred_df_A, pred_df_B, pred_df_C]
    response_data = df
    
    return json.dumps(response_data)
    #return response_data.to_json()

@app.route('/predicted', methods=['GET', 'POST'])
def predicted():
    
    js = request.json
    days = 7
    print("js = ", js)
    if(js['days'] is not None):
        days = int(js['days'])
    
    print("days = ", days)

    # Reading Dataset STARTS
    df = readDataFromCsv("ensemble")
    df = ensembleModel.ensemble_predicted(df, days)
    # ENDS
    print("got DFs", df)
    # Processing STARTS
    '''pred_df_A = rf_weight * df['RF']
    pred_df_B = rnn_weight * df['RNN']
    pred_df_C = gbm_weight * df['GBM']'''

    # ENDS
    #response_data = [pred_df_A, pred_df_B, pred_df_C]
    response_data = df
    
    return json.dumps(response_data)
    #return response_data.to_json()

@app.route('/networkgraph')
def networkgraph():
    return render_template('networkgraph.html')

def readDataFromCsv(model):
    csv_file = ""
    if(model == "RNN"):
        csv_file = "sp500_with_features"
    elif(model == "GBM"):
        csv_file = "bivariate_GBM"
    elif(model == "RF"):
        csv_file = "sp500_with_features"
    elif(model == "ensemble"):
        csv_file = "Prediction"
    csv_path = getFilePath(csv_file)

    csv_df = pd.read_csv(csv_path, parse_dates=['DATE'])
    csv_df['DATE'] = pd.to_datetime(csv_df['DATE'], format='mixed')
    csv_df['DATE'] = csv_df['DATE'].dt.strftime("%Y-%m-%d")
    
    return csv_df
#@app.route("/")
def home():
    # Get SP500 data first
    path = getFilePath("SP500")
    df = pd.read_csv(path)
    df["SP500"][df['SP500'] == "."] = np.nan
    df['SP500'] = df['SP500'].astype(float)
    df['SP500'] = df['SP500'].ffill()
    norm_data = getNormalizedData(df, "SP500")

    # Get Data for dependent stocks
    stocks = getStocks()
    for s in stocks:
        path = getFilePath(s)
        df2 = pd.read_csv(path)
        df2[s][df2[s] == "."] = np.nan
        df2[s] = df2[s].astype(float)
        df2[s] = df2[s].ffill()
        norm_data = getNormalizedData(df2, s)
        df = df.merge(norm_data, how='left', on="DATE")
    print(df.head())
    #return Response(df.to_json('stockjson.json', orient='records'), mimetype='application/json')
    return render_template('home.html')

@app.route('/stockdata')
def getStockData():
    return render_template('stockdata.html')

def getNormalizedData(csvdata, stock_sym):
    normalized_data = (csvdata[stock_sym].values - np.min(csvdata[stock_sym].values)) / (np.max(csvdata[stock_sym].values - np.min(csvdata[stock_sym].values)))
    csvdata[stock_sym] = normalized_data
    return csvdata

def getFilePath(stock_name):
    cwd = os.getcwd()
    base_folder = "/static/"
    pt = cwd + base_folder + stock_name + ".csv"
    path = pathlib.Path(pt)
    return path

if __name__ == "__main__":
    app.run(debug=True)