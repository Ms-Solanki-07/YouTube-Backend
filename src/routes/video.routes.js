import { Router } from "express";

import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideoDetails } from "../controllers/video.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/publish/video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
)

router.route("/").get(getAllVideos)
router.route("/v/:videoid").get(getVideoById)
router.route("/update/video/:videoid").patch(upload.single("thumbnail"), updateVideoDetails)
router.route("/del/video/:videoid").delete(deleteVideo)
router.route("/toggle/publish/:videoid").patch(togglePublishStatus)

export default router