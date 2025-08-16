import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './ApiError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })

        //file has been uploaded successfully
        // console.log("file has been uploaded on cloudinary", response.url)

        fs.unlinkSync(localFilePath)

        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload opration got failed
        return null
    }
}

const deleteFromCloudinary = async (publicId, resourceType) => {
    try {
        if (!resourceType || !['image', 'video', 'raw'].includes(resourceType)) {
            throw new ApiError(400, "Invalid or missing resourceType for Cloudinary deletion.");
        }

        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        return null
    }
};

export { uploadOnCloudinary, deleteFromCloudinary }