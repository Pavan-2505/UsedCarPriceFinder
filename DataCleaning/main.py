# Making env : python -m venv .venv
#Activating : .venv\Scripts\activate.bat
from loadingdata import *

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



if __name__ == "__main__":
    main()