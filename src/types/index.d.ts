import jwt from "jsonwebtoken";

declare global {
  interface IRoom {
    roomID: string;
    roomName: string;
    roomPic: string;
  }

  interface IUser {
    userID: string;
    username: string;
  }

  interface IUserRoom {
    userID: string;
    rooms: string[];
  }

  interface IMessage {
    userID: string;
    username: string;
    time: string;
    message: string;
  }

  interface IMessageDatabase {
    roomID: string;
    messages: IMessage[];
  }

  interface IJwtToken {
    userID: string;
    role: string[];
  }
}

declare module "express" {
  interface Request {
    decodedToken?: IJwtToken;
  }
}
