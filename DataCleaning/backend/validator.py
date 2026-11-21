from returntypeconv import ReturnTypeConvention
import sys
def validateReturn[T](ret : ReturnTypeConvention[T]):
    if(not ret.success):
        print("Error : ",ret.errror)
        sys.exit(ret.error)
    return ret.data