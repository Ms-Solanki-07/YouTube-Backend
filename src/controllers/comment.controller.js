import mongoose, { connect, isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId.trim()) {
        throw new ApiError(400, "Video id missing")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video id")
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const aggregateOptions = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } },
        {
            $project: {
                _id: 1,
                content: 1,
                owner: 1
            }
        }
    ]

    const comments = await Comment.aggregatePaginate(Comment.aggregate(aggregateOptions), options)

    if (!comments) {
        throw new ApiError(500, "Something went wrong while fetching comments")
    }

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.user?._id
    const { videoId } = req.params

    if (!content) {
        throw new ApiError(400, "Comment content are required")
    }

    if (!videoId?.trim()) {
        throw new ApiError(401, "Video id is missing")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid video id")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    if (!comment) {
        throw new ApiError(500, "Something went wrong while adding comment")
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Adding comment successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.user?._id
    const { commentId } = req.params

    if (!content) {
        throw new ApiError(400, "Comment content are required")
    }

    if (!commentId?.trim()) {
        throw new ApiError(401, "comment id is missing")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(403, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(500, "comment not found")
    }

    if (comment?.owner.toString() !== userId.toString()) {
        throw new ApiError(401, "Unauthorized to update the comment")
    }

    comment.content = content

    const updatedComment = await comment.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { commentId } = req.params

    if (!commentId?.trim()) {
        throw new ApiError(401, "comment id is missing")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(403, "Invalid comment id")
    }

    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: userId
        }
    )

    if (!deletedComment) {
        throw new ApiError(401, "Not found comment or Unauthorized to delete the comment")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}