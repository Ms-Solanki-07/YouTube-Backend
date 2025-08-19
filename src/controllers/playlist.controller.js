import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Playlist } from '../models/playlist.model.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    console.log("req.body: ", req.body)
    const { name, description } = req.body

    if (!name?.trim()) {
        throw new ApiError(400, "Playlist name is required")
    }

    const playlist = await Playlist.create({
        name,
        description: description ? description : "",
        owner: req.user._id
    })

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while creating playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId?.trim()) {
        throw new ApiError("401", "user id is missing")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError("403", "Invalid user id")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError("404", "User NOT exists with this id")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                $and: [
                    {
                        $or: [
                            {
                                isPrivate: false
                            },
                            {
                                owner: new mongoose.Types.ObjectId(req.user?._id)
                            }
                        ]
                    },
                    {
                        owner: new mongoose.Types.ObjectId(userId)
                    }
                ]
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                _id: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,
            playlists,
            playlists.length ? "Playlists fetched successfully" : "User have no playlists"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId?.trim()) {
        throw new ApiError(400, "playlist id missing")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const isPlaylist = await Playlist.findById(playlistId)
    if (!isPlaylist) {
        throw new ApiError(404, "Playlist does NOT exist with this id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                $and: [
                    {
                        _id: new mongoose.Types.ObjectId(playlistId)
                    },
                    {
                        isPrivate: false
                    }
                ]
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
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $match: {
                            isPublished: true
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
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    { $addFields: { owner: { $first: "$owner" } } },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            owner: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            isPublished: 1
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            playlist?.length ? "Playlist fetched successfully" : "This playlist have no video"
        )
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user?._id

    if (!(playlistId?.trim() && videoId?.trim())) {
        throw new ApiError(400, "PlaylistID and videoID both are required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "PlaylistID is invalid")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoID is invalid")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(401, "Playlist not found")
    }

    if (userId?.toString() !== playlist.owner.toString()) {
        throw new ApiError(400, "Unauthorized User")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(401, "Video NOT found")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist")
    }

    playlist.videos.push(videoId)
    const newPlaylist = await playlist.save({ validateBeforeSave: false })

    if (!newPlaylist) {
        throw new ApiError(500, "Something went wrong while adding video to playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, newPlaylist, "video added to playlist successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user?._id

    if (!(playlistId?.trim() && videoId?.trim())) {
        throw new ApiError(400, "PlaylistID and videoID both are required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "PlaylistID is invalid")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoID is invalid")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(401, "Playlist not found")
    }

    if (userId?.toString() !== playlist.owner.toString()) {
        throw new ApiError(400, "Unauthorized to remove video from playlist")
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is not exist in playlist")
    }

    playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId.toString())
    const newPlaylist = await playlist.save({ validateBeforeSave: false })

    if (!newPlaylist) {
        throw new ApiError(500, "Something went wrong while removing video from playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, newPlaylist, "video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user?._id

    if (!playlistId?.trim()) {
        throw new ApiError(400, "PlaylistID are required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "PlaylistID is invalid")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(401, "Playlist not found")
    }

    if (userId?.toString() !== playlist.owner.toString()) {
        throw new ApiError(400, "Unauthorized User")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(500, "Something went wrong while deleting playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, null, "playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    const userId = req.user?._id

    if (!playlistId?.trim()) {
        throw new ApiError(400, "PlaylistID are required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "PlaylistID is invalid")
    }

    if (!(name || description)) {
        throw new ApiError(401, "Atleast one field required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(401, "Playlist not found")
    }

    if (userId?.toString() !== playlist.owner.toString()) {
        throw new ApiError(400, "Unauthorized to update this playlist")
    }

    playlist.name = name ? name : playlist.name
    playlist.description = description ? description : playlist.description

    const updatedPlaylist = await playlist.save({ validateBeforeSave: false })

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while updating playlist details")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Updated playlist details successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}