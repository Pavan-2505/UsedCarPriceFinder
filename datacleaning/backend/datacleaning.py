import pandas as pd
from reporter import Reporter
from loadingdata import loadDataViaCSV,splitUrlAndFile,loadDataViaKaggle
import json
from rapidfuzz import process
"""
Agent 1:
- Remove ID Columns V
- Drop Duplicates

Agent 2:
- Categorical Filterring (type correction,capitalization)
- DateType Convertors (string,int,float,boolean,datetime) accounting unit standardization

Agent 3:
- Finding Inconsistency (Correlations,Extreme Values, Dedived Attributes)
- And Quatrile
- Remove Any Columns V

Agent 4:
- Filling these null
- Report
"""

TRUE_VALUES  = {"true", "t", "yes", "y", "1", "on"}
FALSE_VALUES = {"false", "f", "no", "n", "0", "off"}
ALIASES = {
    "int": "int", "integer": "int",
    "float": "float",
    "bool": "bool", "boolean": "bool",
    "str": "string", "string": "string",
    "datetime": "datetime", "date": "datetime",
}

def df_to_json(part):
    return {
        "columns" : list(part.columns),
        "rows" : json.loads(part.to_json(orient="values", date_format="iso")),
    }

def df_info(df):
    return [
            {
                "name" : str(col),
                "dtype" : str(df[col].dtype),
                "unique" : int(df[col].nunique()),
                "non_null" : int(df[col].notna().sum()),
                "nulls" : int(df[col].isna().sum()),
                "kind" : None
            }
            for col in df.columns
        ]
    

def multivalued_question(ques,col,row):
    return {
        "columns" : ques,
        "rows" : col,
        "row_options" : row
    }

async def drop_col(df,metaDF,col):
    metaDF.drop(col,inplace=True)
    df.drop(columns=col,inplace=True)    
    await r.report("progress",progress=f"Deleted {col} successfuly", agent=2)

def fixVal(val,validList):
    if pd.isna(val):
        return val
    match = process.extractOne(val, valid, score_cutoff=80)
    return match[0] if match else None

def fixCol(df,col,validList):
    df[col] = df[col].apply(fixVal,args=(validList,))
    
def lowerUpperDiscreteVal(val,lower,upper):
    if val >= lower and val <= upper:
        return val
    return None

def lowerUpperDiscreteValCol(df,col,lower,upper):
    df[col] = df[col].apply(lowerUpperDiscreteVal,args=(lower,upper))

def toBool(src):
    if src == "bool":
        return True
    if src in ("int","float"):
        pass

def convertDType(df,col,to):
    if str(df[col].dtype) in 'float64' :
        pass

async def cleaner(r : Reporter, params):
    dataset_path = params["original_name"]
    if(params["method"] == "kaggle"):
        splitRes = splitUrlAndFile(dataset_path)
        if(not splitRes["success"]):
            await r.report("error",progress=splitRes["error"], agent=1)
            return
        pathRes = loadDataViaKaggle(splitRes["data"][0],splitRes["data"][1])
        if(not pathRes["success"]):
            await r.report("error",progress=pathRes["error"], agent=1)
            return
        dataset_path=pathRes["data"]
        

    await r.report("progress",progress="Loading the dataset", agent=1)
    loadRes = loadDataViaCSV(dataset_path)
    if(not loadRes["success"]):
        await r.report("error",progress=loadRes["error"], agent=1)
        return
    
    await r.report("progress",progress="Completed Loading the Dataset", agent=1)
    df = loadRes["data"]
    rows,cols = df.shape
    await r.report("progress",progress=f"Dataset has {rows} rows and {cols} columns", agent=1)
    print("Printed the shape of the dataset")
    
    df.columns.str.lower().str.strip()
    await r.report("progress",progress="Column Header converted to lowercase and striped outer whitespaces", agent=1)
    print("Column Header converted to lowercase and striped outer whitespaces")

    await r.report("table",data=df_to_json(df.head()), agent=1)
    print("Printed 5 rows for data understanding")

    metaDF = pd.DataFrame(df_info(df))

    await r.report("table",data=df_to_json(metaDF), agent=2)
    print("Printed the meta data")

    idRows = False
    for meta in list(metaDF[metaDF["unique"] == rows]["name"]):
        print(meta)
        idRes = await r.ask(2,f"Found Identity Column {meta}, should i delete it ?",kind="confirmation" )
        if idRes == "yes":
            idRows = True
            await drop_col(df,metaDF,meta)
            continue
        await r.report("progress",progress=f"Deletion of {col} canceled", agent=2)
    if not idRows:
            await r.report("progress",progress=f"No Identity Column Found", agent=2)

    # deupRows = df.duplicated().sum()
    # if(deupRows > 0):
    #     dupRes = await r.ask(2,f"Found duplicate rows, should i delete it ?",kind="confirmation" )
    #     if dupRes == "yes":
    #         df = df.drop_duplicates().reset_index(drop=True)
    #         await r.report("progress",progress=f"Deleted duplicate rows successfuly", agent=2)
    #         continue
    #     await r.report("progress",progress=f"Deleteion of duplicate rows cancelled", agent=2)
    # else:
    #     await r.report("progress",progress=f"No duplicate rows found", agent=2)

    moreInfoCol = ['Kind Of Data','Delete/Change DataType']
    idRes = await r.ask(2,f"Tell me more about the data", options=multivalued_question(['Columns']+moreInfoCol,list(df.columns),[['Non-Cateogrical','Categorical','Numeric','Discrete'],['No Change','Int','Float','str','Boolean','Datetime','Delete']]) ,kind="table_question" )

    print("Result : ",idRes)

    for moreInfo in idRes.entries():
        if moreInfoCol[1]['Delete/Change DataType' == 'Delete']:
            await drop_col(moreInfo[0])
            continue
        metaDF.loc[df[0]] = moreInfo['Kind_Of_Data']

        if moreInfo[1]['Kind_Of_Data'] == 'Categorical':
            catVal = await r.ask(2,f"For {moreInfo[0]}, Choose the Allowed List of Category",kind="question",options=df[col].unique(), multivalue=True )
            fixCol(df,moreInfo[0])
            await r.report("progress",progress=f"Converted f{moreInfo[0]} to category", agent=2)

        elif moreInfo[1]['Kind_Of_Data'] in ('Discrete','Numeric'):
            boundVal = await r.ask(2,f"For {moreInfo[0]}, The values ranges between {df[moreInfo[0]].min()} to {df[moreInfo[1]].max()}. Set the new lower and upper limits ? ",kind="question",options=df[col].unique(), multivalue=True )
            lowerUpperDiscreteValCol(df,moreInfo[0],boundVal[0],boundVal[1])
            await r.report("progress",progress=f"Filtered f{moreInfo[0]} {moreInfo['Kind_Of_Data']} value", agent=2)
        
        if(moreInfo[1]['Change_DataType'] == 'No Change'):
            continue

        if(moreInfo[1]['Change_DataType'] == 'Int'):
            pass
    # changeDataTypeColumns = input("Which column's datatype should change (seperate the columns with comma) : ").lower().split(',')
    