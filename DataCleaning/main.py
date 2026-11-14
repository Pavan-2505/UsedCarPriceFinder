from loadingdata import *

def main():
    methodRes = getMethodOfInput()
    if(not methodRes["success"]):
        print("Error : ",methodRes)
        return methodRes
    
    if(methodRes["data"] == "kaggle"):
        loadDataViaKaggle()

if __name__ == "__main__":
    main()