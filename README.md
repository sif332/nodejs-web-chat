# WebChat
[Check out the Website](https://webchat.xaiphersk.com)

[Check out the Frontend GitHub Repo](https://github.com/sif332/web-chat-frontend)

[Check out the Backend GitHub Repo](https://github.com/sif332/nodejs-web-chat)

### Why did I develop this project?
Because I just want to test my full-stack skills, tools, frameworks and my home server infrastructure before starting a new project called "Real-time Menu and Point of Sale System" that will actually have real users.

Therefore, this project will not be huge and missing many feature but the core of chatting features still works.

Additionally, I will list many possible future improvements for this project.

### The project's toolstack includes:
* React.js
* Tailwind
* Redux
* Node.js
* Express.js
* Socketio
* PostgreSQL
* Nginx
* Docker

I used to implement MongoDB to this project, but my mini pc do not support AVX Instruction Set (Intel Celeron J4105 4 cores 10Watt Ram 8GB).
Therefore, I migrated the project to PostgreSQL instead.

### WebChat UI
!["Welcome"](https://i.imgur.com/yTEDNhk.png)

!["Chat"](https://i.imgur.com/44XORD4.png)

### React Functional Components
!["Components"](https://i.imgur.com/mLdpdCO.png)

## Backend

This project's APIs can be classified into 2 types, which are REST and WebSocket.

REST can be divided into 3 types
1. User
2. Room
3. Message

There are 3 User APIs:
1. /user
   method: GET
   headers: Authorization: Bearer JWTtoken
   return:
   ```typescript
    interface IFetchUser {
      userID: string;
      username: string;
      displayName: string;
    }
   ```
   description: retrieve a user data based on their user_id in token and send json back to client.
   .
2. /user/register
   method: POST
   payload: 
    ```typescript
    const axiosPayload = {
      username: username,
      password: password,
      displayName: displayName,
    }
    ```
   description: send register data to the server and insert into the database
   .
3. /user/login
   method: POST
   payload:
   ```typescript
    const axiosPayload = {
      username: username,
      password: password,
    };
    ```
    return: 
    ```typescript
    interface ILogin {
      token: string;
      userID: string;
      username: string;
      displayName: string;
    }
    ```
    description: send login credential to the server and then server send JWT token back to the client.

There are 3 Room APIs:
1. /room/create
   method: POST
   params: roomName
   headers: Authorization: Bearer JWTtoken
   description: create a room
   .
2. /room/belong
   method: GET
   headers: Authorization: Bearer JWTtoken
   return: 
    ```typescript
    //array of this object
    interface IGetRoomListByUserID {
      _id: string;
      room_name: string;
      room_profile_pic: string;
      created_at: string;
    }
    ```
    description: retrieve all room info that the user belong.
    .
3. /room/join
   method: POST
   params: roomID
   headers: Authorization: Bearer JWTtoken
   description: join a room using roomID

There are 2 Message APIs:
1. /message/by-roomid
   method: POST
   params: roomID
   headers: Authorization: Bearer JWTtoken
   payload: 
   ```typescript
    const axiosPayload = {
      message: message,
    };
    ```
    description: send a message to the server and insert into message table in the database.
    .
2. /message/by-roomid
   method: GET
   params: roomID
   headers: Authorization: Bearer JWTtoken
   return:
   ```typescript
    //array of this object
    interface IGetMessageByRoomID {
      user_id: string;
      username: string;
      room_id: string;
      message: string;
      created_at: string;
    }
    ```
    description: retrieve all messages in a room

Web Socket:
1. client: emit "joinRoom" when click on a chat room
   payload: roomID
   server: listen "joinRoom"
   action: join the client to a socket communication room.
   .
2. client: emit "chat" when send a message
   payload: token, roomID, username, message
   server: listen "chat"
   action: check if token is valid then insert message into message table in the database.
   server: emit "chat" to all client socket in the room
   payload:
   ```typescript
    //an object
    interface IGetMessageByRoomID {
      user_id: string;
      username: string;
      room_id: string;
      message: string;
      created_at: string;
    }
    ```
    client: listen "chat"
    action: client receive a message and display the message in the chat room.

### Database
I use PostgreSQL as the database.
user_room is a weak entity that its primary key relied on user_id and room_id (the combination of them is unique).
!["Database"](https://i.imgur.com/13YP1nv.png)

### Future Improvements
1. Infinite Scrolling and Lazy Loading
   Instead of loading all messages at once, backend will send a chunk of messages to the client. When the users scroll to to the end of the chat, the client will fetch new messages from the backend.
   This will improve performance of the backend to not load unnecessary message.
   .
2. Invite to Join a Room
   Currently, If users know a roomID, they can directly join that room even if the members do not want. I will apply send invite to join a room in the form of limited-time link or limited-time Token instead of using only roomID.
   .
3. Edit Profile Picture and Info
4. Responsive UI (Desktop and Mobile versions)
5. End-to-end encryption
   This time, I can see your messages because they are not encrypted. 
   In the future, I will develop a secret room that can join only 2 people. When users join that room, the client side will generate private key and public key. 
   The private key will be stored in local storage of the users browser (there will be export secret key option). The public key will be shared to their interlocutor.
   Before interlocutors send a message to a user, interlocutors will encrypt that message with the user's public key. 
   Now, only user that own private key will be able to decrypt and read that message even if the server wants to !!!