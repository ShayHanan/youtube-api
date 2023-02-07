import { createError } from "../error.js";
import User from "../models/User.js";
import Video from "../models/Video.js";


export const update = async (req, res, next) => {
    if ( req.params.id === req.user.id)
    {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id,{
                $set: req.body
            }, { new: true})
            res.status(200).json(updatedUser)
        } catch (err) {
            next(err)
        }
    }
    else 
    {
        return next(createError(403, "You can update only your account"))
    }
}

export const deleteUser = async (req, res, next) => {
    if ( req.params.id === req.user.id)
    {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("User has been deleted");
        } catch (err) {
            next(err)
        }
    }
    else 
    {
        return next(createError(403, "You can delete only your account"))
    }
}



export const getUser = async (req, res, next) => {
    try {
       const user = await User.findById(req.params.id)
       res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

export const subscribe = async (req, res, next) => {
    try {
        // Find current user and add user to subscribed users array
       await User.findByIdAndUpdate(req.user.id, {
        $push: {subscribedUsers: req.params.id}
       });

       await User.findByIdAndUpdate(req.params.id, {
        $inc: {subscribers: 1}
       });
       res.status(200).json("Subscription Successful");
    } catch (err) {
        next(err);
    }
}

export const unsubscribe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $pull: {subscribedUsers: req.params.id}
           });
    
           await User.findByIdAndUpdate(req.params.id, {
            $inc: {subscribers: -1}
           });
           res.status(200).json("Unsubscription Successful");
    } catch (err) {
        next(err);
    }
}

export const like = async (req, res, next) => {
    const id = req.user.id;
    const videoId = req.params.videoId;
    try {
    const video = await Video.findById(videoId);
    // if first time liking the video, add id to likes array and pull from dislikes, else just remove from likes
    if (!video.likes.includes(id))
    {
        await video.update({
                $addToSet: {likes: id},
                $pull: {dislikes: id}
               });
    }
    else 
    {
        await video.update({
            $pull: {likes: id}  
           });
    }
    // get updated video
    const updated = await Video.findById(videoId);
       res.status(200).json(updated.likes);
    } catch (err) {
        next(err);
    }
}

export const dislike = async (req, res, next) => {
    const id = req.user.id;
    const videoId = req.params.videoId;
    try {
    const video = await Video.findById(videoId);
        
    // if first time disliking the video, add id to likes array and pull from likes, 
    //else just remove from dislikes
    if (!video.dislikes.includes(id))
    {
        await video.update({
                $addToSet: {dislikes: id},
                $pull: {likes: id}
               });
    }
    else 
    {
        await video.update({
            $pull: {dislikes: id}  
           });
    }
    // get the updated video
    const updated = await Video.findById(videoId);
       res.status(200).json(updated.dislikes);
    } catch (err) {
        next(err);
    }
}