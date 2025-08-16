import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all video based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    //TODO: get video, upload cloudinary, create video

    //validation for title
    if (!(title && description)) {
        throw new ApiError(400, "Title and description field are required")
    }

    //check for video and thumbnail
    const videoFileLocalPath = Array.isArray(req.files?.videoFile) && (req.files.videoFile.length > 0) ? req.files.videoFile[0].path : null;
    const thumbnailFileLocalPath = Array.isArray(req.files?.thumbnail) && (req.files.thumbnail.length > 0) ? req.files.thumbnail[0].path : null;

    //validation for video and thumnail
    if (!(videoFileLocalPath && thumbnailFileLocalPath)) {
        throw new ApiError(400, "Video file and thumbnail file are required")
    }

    //upload on cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath)

    if (!(videoFile && thumbnail)) {
        throw new ApiError(400, "video file and thumbnail file are required")
    }

    //create video object, create entry in db
    const video = await Video.create(
        {
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: videoFile.duration,
            owner: req.user._id
        }
    )

    if (!video) {
        throw new ApiError(500, "Something Went wrong while uploading video")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video uploaded successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoid } = req.params
    //TODO: get video by id

    if (!videoid?.trim()) {
        throw new ApiError(400, "videoId is missing")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoid)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                views: 1,
                isPublished: 1,
                duration: 1,
                updatedAt: 1,
                owner: 1
            }
        }
    ])

    if (!video?.length) {
        throw new ApiError(404, "Video does not exist")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video[0],
            "Video fetch successfully"
        )
    )
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    // TODO: update details of video - title, description and thumbnail
    const { videoid } = req.params
    const { title, description } = req.body
    const userId = req.user._id
    const thumbnailFileLocalPath = req.file?.path ? req.file?.path : null;

    if (!videoid?.trim()) {
        throw new ApiError(401, "Video id missing")
    }

    if (!title && !description && !thumbnailFileLocalPath) {
        throw new ApiError(401, "atleast one field required")
    }

    const video = await Video.findByIdAndUpdate(videoid)

    if(!video){
        throw new ApiError(401, `video is not found with this id: ${videoid}`)
    }

    if(video.owner.toString() != userId.toString()){
        throw new ApiError(400, "Unauthorized to update this video")
    }

    video.title = title ? title : video.title
    video.description = description ? description : video.description

    if (thumbnailFileLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath)
        if (!thumbnail) {
            throw new ApiError(500, "something went wrong while uploading thumbnail")
        }

        const isDeletedThumbnail = await deleteFromCloudinary(video.thumbnail, "image")

        video.thumbnail = thumbnail.url
        await video.save({validateBeforeSave:false})
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video details Updated successfully"
        )
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails
}