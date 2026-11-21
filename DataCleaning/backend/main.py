# Making env : python -m venv .venv
#Activating : .venv\Scripts\activate.bat
from loadingdata import *
from reporter import Reporter
def main():
    methodRes = getMethodOfInput()
    if(not methodRes["success"]):
        print("Error : ",methodRes["error"])
        return methodRes


    pathRes = getPathForDataset()
    if(not pathRes["success"]):
        print("Error : ",pathRes["error"])
        return pathRes
        
    print("Path res",pathRes)
    if(methodRes["data"] == "kaggle"):
        splitRes = splitUrlAndFile(pathRes["data"])
        if(not splitRes["success"]):
            print("Error : ",splitRes["error"])
            return splitRes
        print("Split res",splitRes)
        pathRes = loadDataViaKaggle(splitRes["data"][0],splitRes["data"][1])
        if(not pathRes["success"]):
            print("Error : ",pathRes["error"])
            return pathRes
        

    print("Before load",pathRes)
    loadRes = loadDataViaCSV(pathRes["data"])
    if(not loadRes["success"]):
        print("Error : ",loadRes["error"])
        return loadRes
    
    print(loadRes["data"])
    report = Reporter()
    report.add("Completed Loading the Dataset Into Python using "+methodRes["data"])
    
    rows,cols = df.shape
    print(f"Data Set has {rows} rows and {cols} columns")
    report.add("Printed the shape of the dataset")

    df = loadRes["data"]
    df.columns.str.lower().str.strip()
    report.add("Column Header convereted to lowercase and striped outer whitespaces")

    print(df.head())
    report.add("Printed 5 rows for data understanding")

    print(df.info())
    report.add("Printed the meta data")

    changeDataTypeColumns = input("Which column's datatype should change (seperate the columns with comma) : ").lower().split(',')

if __name__ == "__main__":
    main()