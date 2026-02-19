from pydantic import BaseModel

class OtpRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class OtpResponse(BaseModel):
    message: str
