from passlib.context import CryptContext
import hashlib

# Create a CryptContext
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Create a test password
test_pwd = "test123456"

# Hash it
hashed = pwd_context.hash(test_pwd)
print(f"Hashed password for '{test_pwd}':")
print(hashed)
print()

# Verify it works
ok = pwd_context.verify(test_pwd, hashed)
print(f"Verification: {ok}")
