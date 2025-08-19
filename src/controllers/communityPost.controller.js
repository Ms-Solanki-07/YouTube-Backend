import { isValidObjectId } from "mongoose"
import { CommunityPost } from "../models/communityPost.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const createCommunityPost = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.user._id

    if (!content) {
        throw new ApiError(400, "Content required to creating community post")
    }

    const communityPost = await CommunityPost.create({
        content,
        owner: userId
    })

    if (!communityPost) {
        throw new ApiError(500, "Something went wrong while creating community post")
    }

    return res.status(200).json(
        new ApiResponse(200, communityPost, "Community post created successfully")
    )
})

const getUserCommunityPost = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId?.trim){
        throw new ApiError(400, "user id missing")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user id")
    }

    const communityPosts = await CommunityPost.find({
        owner: userId
    })

    return res.status(200).json(
        new ApiResponse(
            200, 
            communityPosts?.length ? "Community posts fetched successfully" : "This User has no Community post"
        )
    )
})

const updateCommunityPost = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { communityPostId } = req.params
    const userId = req.user._id

    if (!content) {
        throw new ApiError(400, "Content required to updating community post")
    }

    if (!communityPostId.trim()) {
        throw new ApiError(401, "community post id missing")
    }

    if (!isValidObjectId(communityPostId)) {
        throw new ApiError(403, "Invalid community post id")
    }

    const communityPost = await CommunityPost.findById(communityPostId)

    if (!communityPost) {
        throw new ApiError(404, "Community post not found")
    }

    if (communityPost.owner.toString() !== userId.toString()) {
        throw new ApiError(400, "Unauthorized to update this community post")
    }

    communityPost.content = content
    const updatedCommunityPost = await communityPost.save({ validateBeforeSave: false })


    if (!updatedCommunityPost) {
        throw new ApiError(500, "Something went wrong while updating community post")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedCommunityPost, "Community post updated successfully")
    )
})

const deleteCommunityPost = asyncHandler(async (req, res) => {
    const { communityPostId } = req.params
    const userId = req.user._id

    if (!communityPostId.trim()) {
        throw new ApiError(401, "community post id missing")
    }

    if (!isValidObjectId(communityPostId)) {
        throw new ApiError(403, "Invalid community post id")
    }

    const deletedCommunityPost = await CommunityPost.findOneAndDelete(
        {
            _id: communityPostId,
            owner: userId
        }
    )

    if (!deletedCommunityPost) {
        throw new ApiError(404, "Community post not found or Unauthorized to deleting this community post")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedCommunityPost, "Community post deleted successfully")
    )
})

export {
    createCommunityPost,
    getUserCommunityPost,
    updateCommunityPost,
    deleteCommunityPost
}