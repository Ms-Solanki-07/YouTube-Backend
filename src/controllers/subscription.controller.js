import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = req.user?._id

    if (!channelId?.trim()) {
        throw new ApiError(400, "Missing channel id")
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(401, "Can not subscribed the own channel")
    }

    try {
        const existingSubscription = await Subscription.findOneAndDelete({
            subscriber: subscriberId,
            channel: channelId
        });

        if (!existingSubscription) {
            const newSubscription = await Subscription.create({
                subscriber: subscriberId,
                channel: channelId
            })
            return res.status(200).json(
                new ApiResponse(200, newSubscription, "Subscribed successfully")
            )
        } else {
            return res.status(200).json(
                new ApiResponse(200, null, "UnSubscribed successfully")
            )
        }
    } catch (error) {
        throw new ApiError(500, `Something went wrong while toggle subsription, Error: ${error}`)
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscriber = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId?.trim()) {
        throw new ApiError(400, "channel id missing")
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channel id")
    }

    if (channelId.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "User can see only own subscriber, NOT other")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            _id: 0
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriber" // flatten subscriber array
        },
        {
            $replaceRoot: { newRoot: "$subscriber" } // directly return subscriber objects
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            subscribers.length ? "Subscribers fetched successfully" : "No subscribers found"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId?.trim()) {
        throw new ApiError(400, "subscriber id missing")
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Invalid subscriber id")
    }

    if (subscriberId.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "User can see only own subscribed channel list, NOT other")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
            $unwind: "$channel" // flatten channel array
        },
        {
            $replaceRoot: { newRoot: "$channel" } // directly return channel objects
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            subscribedChannels.length ? "Subscribed channels fetched successfully" : "No subscribed channels found"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels
}