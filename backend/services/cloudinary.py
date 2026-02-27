# services/cloudinary_service.py
# services/cloudinary_service.py
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

# Configuration directe (sans .env)
cloudinary.config(
    cloud_name="drtbmhwha",
    api_key="496315655235652",
    api_secret="K8aj-WJgWynOlCjaAElLACf3szw",
    secure=True
)

def upload_image(file: UploadFile, folder="techniciens"):
    """
    Upload an image file to Cloudinary
    """
    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        resource_type="image"
    )
    return result.get("secure_url")