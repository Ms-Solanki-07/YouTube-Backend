import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!videoId.trim()) {
        throw new ApiError(400, "Video id missing")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existingLike) {
        const unLike = await Like.findOneAndDelete({
            video: videoId,
            likedBy: userId
        })

        if (!unLike) {
            throw new ApiError(500, "Something went wrong while Unliking the video")
        }

        return res.status(200).json(
            new ApiResponse(200, {}, "Video Unliked successfully")
        )
    }

    const newLike = await Like.create({
        likedBy: userId,
        video: videoId
    })

    if (!newLike) {
        throw new ApiError(500, "Something went wrong while liking the video")
    }

    return res.status(200).json(
        new ApiResponse(200, newLike, "Video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    if (!commentId.trim()) {
        throw new ApiError(400, "Comment id missing")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const existingLike = await Like.findOne({
        commenet: commentId,
        likedBy: userId
    })

    if (existingLike) {
        const unLike = await Like.findOneAndDelete({
            commenet: commentId,
            likedBy: userId
        })

        if (!unLike) {
            throw new ApiError(500, "Something went wrong while Unliking the comment")
        }

        return res.status(200).json(
            new ApiResponse(200, {}, "Comment Unliked successfully")
        )
    }

    const newLike = await Like.create({
        likedBy: userId,
        video: videoId
    })

    if (!newLike) {
        throw new ApiError(500, "Something went wrong while liking the commenting")
    }

    return res.status(200).json(
        new ApiResponse(200, newLike, "Comment liked successfully")
    )
})

const toggleCommunityPost = asyncHandler(async (req, res) => {
    const { communityPostId } = req.params
    const userId = req.user._id

    if (!communityPostId.trim()) {
        throw new ApiError(400, "community post id missing")
    }

    if (!isValidObjectId(communityPostId)) {
        throw new ApiError(400, "Invalid community post id")
    }

    const existingLike = await Like.findOne({
        communityPost: communityPostId,
        likedBy: userId
    })

    if (existingLike) {
        const unLike = await Like.findOneAndDelete({
            communityPost: communityPostId,
            likedBy: userId
        })

        if (!unLike) {
            throw new ApiError(500, "Something went wrong while Unliking the community post")
        }

        return res.status(200).json(
            new ApiResponse(200, {}, "Community post Unliked successfully")
        )
    }

    const newLike = await Like.create({
        likedBy: userId,
        communityPost: communityPostId
    })

    if (!newLike) {
        throw new ApiError(500, "Something went wrong while liking the community post")
    }

    return res.status(200).json(
        new ApiResponse(200, newLike, "community post liked successfully")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1, 
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if (!likedVideos) {
        throw new ApiError(500, "Something went wrong while fetching liked videos")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            likedVideos,
            likedVideos.length ? "Liked video fetched successfully" : "User has no liked videos"
        )
    )
})

export {
    toggleCommentLike,
    toggleCommunityPost,
    toggleVideoLike,
    getLikedVideos
}