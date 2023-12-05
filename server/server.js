import app from "./app.js";
import connectDB from "./data/DatabaseConnection.js";
import http from "http";
import { Server } from "socket.io";
import { Notification } from "./models/notificationModel.js";
import { Admin } from "./models/userModel.js";
// import io from "socket.io";

connectDB();

// const server = http.createServer();

const io = new Server(8900, {
  cors: {
    origin: "http://localhost:5000",
  },
});

let users = [];

const addUser = (userId, user_type, socketId) => {
  return (
    !users.some((user) => user.userId === userId) &&
    users.push({ userId, user_type, socketId })
  );
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const getUserByUserType = (user_type) => {
  return users.find((user) => user.user_type === user_type);
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connected.");

  socket.on("addUser", (userId, user_type) => {
    if (userId === null) {
    } else {
      console.log(
        "New client Added->",
        "user",
        userId,
        "user_type",
        user_type,
        "socketId",
        socket.id
      );
      console.log(addUser(userId, user_type, socket.id));
      io.emit("getUsers", users);
    }
  });

  // send and get message
  socket.on(
    "sendMessage",
    async ({ senderId, senderName, receiverId, text }) => {
      const user = getUser(receiverId);
      // console.log(receiverId);
      console.log(user);
      console.log("$$$$");
      console.log(users);
      if (user) {
        io.to(user?.socketId).emit("getMessage", {
          senderId,
          senderName,
          text,
        });
        io.to(user?.socketId).emit("getMessageNotification", {
          senderId,
          senderName,
          text,
        });
      } else {
        const newNotification = new Notification({
          receiverId,
          senderId,
          senderName,
          messageType: "message",
          message: text,
        });

        try {
          const savedNotification = await newNotification.save();
          console.log(savedNotification);
        } catch (error) {
          console.log(error);
        }
      }
    }
  );

  socket.on(
    "newConversation&Message",
    async ({ senderId, senderName, receiverId, text }) => {
      const user = getUser(receiverId);
      // console.log(receiverId);
      // console.log(user);
      // console.log(users);
      if (user) {
        io.to(user?.socketId).emit("receiveNewConversation&Message", {
          senderId,
          senderName,
          text,
        });
        io.to(user?.socketId).emit(
          "receiveNewConversation&MessageNotification",
          {
            senderId,
            senderName,
            text,
          }
        );
      } else {
        const newNotification = new Notification({
          receiverId,
          senderId,
          senderName,
          messageType: "chatMessage",
          message: text,
        });

        try {
          const savedNotification = await newNotification.save();
          console.log(savedNotification);
        } catch (error) {
          console.log(error);
        }
      }
    }
  );

  socket.on(
    "changeBlockedStatus",
    async ({ senderId, senderName, receiverIdArg, blockedStatus }) => {
      const user = getUser(receiverIdArg);
      if (user) {
        io.to(user?.socketId).emit("updateBlockedStatus", {
          senderId,
          senderName,
          blockedStatus,
        });
        io.to(user?.socketId).emit("updateBlockedStatusNotification", {
          senderId,
          senderName,
          blockedStatus,
        });
      } else {
        const newNotification = new Notification({
          receiverIdArg,
          senderId,
          senderName,
          messageType: "blockingUpdate",
          message: `You have been ${blockedStatus ? "blocked" : "unblocked"}.}`,
        });

        try {
          const savedNotification = await newNotification.save();
          console.log(savedNotification);
        } catch (error) {
          console.log(error);
        }
      }
    }
  );

  socket.on(
    "userReported",
    async ({
      reporterId,
      reporterName,
      reportedId,
      reportedName,
      reportedUserType,
      reason,
    }) => {
      const user = getUserByUserType("admin");
      console.log(user);
      console.log(users);
      if (user) {
        console.log("inside userReported");
        io.to(user?.socketId).emit("reportNotificationAdmin", {});
      }
      const result = await Admin.findOne({}).exec();
      if (!result) {
        console.error("Error:", err);
      } else {
        console.log(result[0]);
        const newNotification = new Notification({
          receiverId: result._id.toString(),
          senderId: reporterId,
          senderName: reporterName,
          messageType: "report",
          message: `Reported ${reportedUserType}: ${reportedName}. \n Reason: ${reason}`,
        });

        // receiverId: document._id.toString(),
        // senderId: reporterId,
        // senderName: reporterName,
        // messageType: "report",
        // message: `Reported ${reportedUserType}: ${reportedName}.`,
        // reportedUserId: reportedId,
        // reportingReason: reason,

        try {
          const savedNotification = await newNotification.save();
          // console.log(savedNotification);
        } catch (error) {
          console.log(error);
        }
      }
      const reportedUser = getUser(reportedId);
      console.log("#$#$@#@#@$#$%^*&*", reportedUser);
      if (reportedUser) {
        io.to(reportedUser?.socketId).emit("reportNotificationUser", {});
      }
      console.log("inside reportedUser");
      const newNotification2 = new Notification({
        receiverId: reportedId,
        senderId: reporterId,
        senderName: reporterName,
        messageType: "report",
        message: `You have been reported to Admin.`,
      });

      try {
        const savedNotification2 = await newNotification2.save();
        console.log(savedNotification2);
      } catch (error) {
        console.log(error);
      }
    }
  );

  // when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

try {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.error("Server Error:", error);
}
