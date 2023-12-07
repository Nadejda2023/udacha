import { DB } from '../setting';
import * as dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose';
import { PostViewDBModel, PostViewModel } from '../models/postsModel';
import {  BlogsViewDBModel } from '../models/blogsModel';
import { UsersModel } from '../models/usersModel';
import { AuthViewModel } from '../models/authModels';
import { DeviceDbModel } from '../models/deviceModel';
import { RateLimitDBModel } from '../models/rateLimitModels';
import { Int32, MongoClient } from 'mongodb';
import { CommentDB } from '../models/commentModels';



const url = process.env.MONGO_URL || "mongodb://0.0.0.0:27017"
if(!url) {
  throw new Error('! Url doesn\'t found')
}


export type blogsType = {
  id:  string,
  name: string,
  description: string,
  websiteUrl: string, 
  createdAt: string,
  isMembership: boolean 
}

export type postsType =
{
  id: string,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string
}

export const client = new MongoClient(url);
///let db = client.db("mongoose-example")
const BlogSchema = new mongoose.Schema<BlogsViewDBModel>({ // схема это просто тип
  id:{type:String, required: true },
  name:  {type: String, required: true}, 
  description: {type: String, required: true}, 
  websiteUrl: {type: String, required: true}, 
  createdAt: {type: String, required: true}, 
  isMembership: {type: Boolean, required: true}, 
});

const PostSchema = new mongoose.Schema<PostViewDBModel>({
  id:{type:String, required: true },
  title: {type: String, required: true},
  shortDescription: {type: String, required: true},
  content: {type: String, required: true},
  blogId: {type: String, required: true},
  blogName: {type: String, required: true},
  createdAt: {type: String, required: true},
}); 

const UserSchema = new mongoose.Schema<UsersModel>({
  id:{type:String, required: true },
  login: {type: String, required: true},
  email: {type: String, required: true},
  createdAt: {type: String, required: true},
  passwordSalt: {type: String, required: true},
  passwordHash: {type: String, required: true},
  recoveryCode: {type: String},
  emailConfirmation : {
    isConfirmed: {type: Boolean, required: true},
    confirmationCode: {type: String, required: true},
    expirationDate: {type: Date, required: true},
  },
  //refreshTokenBlackList: string[]  
});

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None'
}

export type LikeStatusType = {
  myStatus: LikeStatus,
  userId: string,
  createdAt: string
}

const LikeStatusSchema = new mongoose.Schema<LikeStatusType>({
  myStatus: {type: String, required: true}, //, enum:LikeStatus 
  userId: {type:String, required: true},
  createdAt: {type: String, required: true}

})

const CommentSchema = new mongoose.Schema<CommentDB>({
  id:{type:String, required: true },
  content: {type: String, required: true},
  commentatorInfo: {
    userId: {type: String, required: true},
  userLogin: {type: String, required: true}
  },
  createdAt: {type: String, required: true},
  likesInfo: {
    likesCount: {type: Number, required: true},
    dislikesCount: {type: Number, required: true},
    statuses: {type: [LikeStatusSchema], default: []}
    
    
  }

});

const AuthSchema = new mongoose.Schema<AuthViewModel>({
  email: {type: String, required: true},
  login: {type: String, required: true},
  userId: {type: String, required: true},
  
});

const DeviceSchema = new mongoose.Schema<DeviceDbModel>({
  _id: {type: String, required: true},
  ip : {type: String, required: true},
  title : {type: String, required: true},
  lastActiveDate: {type: String, required: true},
  deviceId : {type: String, required: true},
  userId: {type: String, required: true},
});

const RateLimitSchema = new mongoose.Schema<RateLimitDBModel>({
    IP : {type: String, required: true},
    URL: {type: String, required: true},
    date : {type: Date, required: true},
});




export const BlogModel = mongoose.model('blogs', BlogSchema); // подобие коллекции
export const PostModel = mongoose.model('posts', PostSchema);
export const UserModel = mongoose.model('users', UserSchema);
export const CommentModel = mongoose.model('comments', CommentSchema);
export const AuthModel = mongoose.model('auth', AuthSchema);
export const DeviceModel = mongoose.model('security', DeviceSchema);
export const RateLimitModel = mongoose.model('rateLimit', RateLimitSchema);


export async function runDB() {
  try{
    await client.connect();
    await mongoose.connect(url);
    
    console.log("Connected successfully to mongo server");

  } catch {
    console.log("Can't connected to db");
    
    await mongoose.disconnect();
  }
}

export const db : DB = { 
  blogs: [
  {
    id: "string",
    name: "Nadejda",
    description: "string",
    websiteUrl: "string",
    createdAt: "2023-07-13T14:09:36.550Z",
  isMembership: false
    
  },
  //
  {
    id: "string",
    name: "string",
    description: "string",
    websiteUrl: "string",
    createdAt: "2023-07-13T14:09:36.550Z",
  isMembership: false
    }
  ],
  posts: [    
  {
    id: "01",
    title: "First",
    shortDescription: "string",
    content: "string",
    blogId: "0",
    blogName: "string",
    createdAt: "2023-07-13T14:09:36.550Z"
},

  {
    id: "02",
    title: "First",
    shortDescription: "string",
    content: "string",
    blogId: "1",
    blogName: "string",
    createdAt: "2023-07-13T14:09:36.550Z"
  }]
};

