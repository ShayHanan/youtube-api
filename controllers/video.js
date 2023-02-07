import { createError } from "../error.js";
import Video from "../models/Video.js";
import User from "../models/User.js";


export const addVideo = async (req, res, next) => {
const newVideo = new Video({ userId: req.user.id, ...req.body });

try{
    const savedVideo = await newVideo.save();
    res.status(200).json(savedVideo);
} catch(err) {
    next(err)
}
}

export const updateVideo = async (req, res, next) => {
    try{
        const video = await Video.findById(req.params.id);
        if(!video) next(createError(404, "Video not found")); 

        if (req.user.id === video.userId)
        {
            const updatedVideo = await video.findByIdAndUpdate(req.params.id, {
                $set: req.body
            }, { new: true });

            res.status(200).json(updatedVideo);
        } else {
            next(createError(403, "not authorized"))
        }
    } catch(err) {
        next(err)
    }
}

export const deleteVideo = async (req, res, next) => {
    try{
        const video = await Video.findById(req.params.id);
        if(!video) next(createError(404, "Video not found")); 

        if (req.user.id === video.userId)
        {
            await Video.findByIdAndDelete(req.params.id)

            res.status(200).json("Video Deleted");
        } else {
            next(createError(403, "not authorized"))
        }
    } catch(err) {
        next(err)
    }
}

export const getVideo = async (req, res, next) => {
    try{
        const video = await Video.findById(req.params.id)
        res.status(200).json(video);
    } catch(err) {
        next(err)
    }
}

export const addView = async (req, res, next) => {
    try{
        await Video.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 }
        })
        res.status(200).json("increased view");
    } catch(err) {
        next(err)
    }
}

// Get random videos
export const random = async (req, res, next) => {
    try{
        // generate 40 random videos from database
        const videos = await Video.aggregate([{$sample:{size:40}}]);
        res.status(200).json(videos);
    } catch(err) {
        next(err)
    }
}


// Get trending videos
export const trend = async (req, res, next) => {
    try{
        // get videos from database by decreasing view count
        const videos = await Video.find().sort({views: -1});
        res.status(200).json(videos);
    } catch(err) {
        next(err)
    }
}


// Get videos from users the user is subscribed to
export const sub = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        const subscribedChannels = user.subscribedUsers;

        // create a list of all videos from users the user is subed to
        const list = await Promise.all(
            subscribedChannels.map(channelId => {
                return Video.find({userId: channelId});
            })
        )
            // flat to get one array instead of nested, and sort by upload time
        res.status(200).json(list.flat().sort((a,b) => b.createdAt - a.createdAt));
    } catch(err) {
        next(err)
    }
}

// Get videos with the same tag
export const getByTag = async (req, res, next) => {
    const tags = req.query.tags.split(",");
    try{
        // get videos from database by tags
        const videos = await Video.find({tags: {$in: tags}}).limit(20);
        res.status(200).json(videos);
    } catch(err) {
        next(err)
    }
}

// Search videos
export const search = async (req, res, next) => {
    const query = req.query.q;
    try{
        // Get videos that contains the query in thier title, case insensitive
        const videos = await Video.find({title: { $regex: query, $options: "i"}}).limit(40);
        res.status(200).json(videos);
    } catch(err) {
        next(err)
    }
}

export const getByUser = async (req, res, next) => {
    try{
        const videos = await Video.find({userId: req.body.userId});
        res.status(200).json(videos);
    } catch (err){
        next(err);
    }
}