import kagglehub
import pandas as pd
from returntypeconv import ReturnTypeConvention

def getMethodOfInput() -> ReturnTypeConvention[str]:
    for i in range(10):
       x = input("Enter data from \n1)Kaggle\n2)CSV\nEnter your choice : ").strip().lower()
       match x:
            case "1" | "kaggle":return {"success": True, "data": "kaggle", "error" : None } 
            case "2" | "csv":return {"success": True, "data": "csv", "error" : None }
            case _:print("Invalid Input use numbers to navigate")
    return {"success": False, "data": None, "error" : "Invalid User Option" }

def getPathForDataset() -> ReturnTypeConvention[str]:
    for i in range(10):
       path = input("Enter Complete Database Path (ending with .csv) : ").strip().lower()
       if(path.endswith(".csv")):
        return {"success": True, "data": path, "error" : None }
    return {"success": False, "data": None, "error" : "Invalid Dataset Path" }

def loadDataViaKaggle(url:str,fileName:str) -> ReturnTypeConvention[str]:
    try:
        print("Url : ",url)
        path = kagglehub.dataset_download(url)
        print("Path : ",path)
        return {"success": True, "data": path+"\\"+fileName, "error" : None }
    except Exception as e:
        return {"success": False, "data": None, "error" : e }

# loadDataViaKaggle func needs only the url not the file name
def splitUrlAndFile(path:str) -> ReturnTypeConvention[list[str]]:
    if(not path.endswith(".csv")):
        return {"success": False, "data": None, "error" : "Path does not contain the file name" }
    if('/' in path):
        pathList = path.split('/')
    else:
        pathList = path.split('\\')
    return {"success": True, "data": ["/".join(pathList[:-1]),pathList[-1]], "error" : None }

# loadDataViaCSV func needs both path and filename
def joinUrlAndFile(path:str,file:str) -> ReturnTypeConvention[str]:
    if(not file.endswith(".csv")):
        return {"success": False, "data": None, "error" : "File does not contain the file name" }
    return {"success": True, "data": path+"\\"+file, "error" : None }

def loadDataViaCSV(path:str) -> ReturnTypeConvention[pd.DataFrame]:
    try:
        return {"success": True, "data": pd.read_csv(path), "error" : None }
    except Exception as e:
        return {"success": False, "data": None, "error" : str(e) }
