from typing import TypedDict

class ReturnTypeConvention[T](TypedDict):
    success: bool
    error: str | None
    data: T | None