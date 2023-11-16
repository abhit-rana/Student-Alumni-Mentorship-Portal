import React, { useEffect, useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Avatar, Input, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import Message from "./Message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import { useConversationContext } from "../context/ConversationContext";
import { useUserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";
import { useChattedUsersContext } from "../context/ChattedUsers";
import axios from "axios";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(1.3),
  "@media all": {
    minHeight: 35,
  },
}));

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const Chatting = () => {
  const [id, setid] = useState("");

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  const [arrivalMessage, setArrivalMessage] = useState(null);

  const { conversation } = useConversationContext();

  const { user } = useUserContext();

  const { socket } = useSocketContext();

  const { chattedUsers } = useChattedUsersContext();

  const scrollRef = useRef();

  useEffect(() => {
    socket?.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      conversation?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, conversation]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        console.log("2");
        await axios
          .get(
            `http://localhost:4000/api/v1/messages/getMessages?conversationId=${conversation?._id}`,
            {
              withCredentials: true,
            }
          )
          .then((response) => {
            console.log(response);
            setMessages(response.data);
          })
          .catch((error) => {
            console.error("API Error:", error);
          });
      } catch (error) {
        console.log(error);
      }
    };
    getMessages();
  }, [conversation?._id]);

  const sendMeesageBtController = async (e) => {
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: conversation._id,
    };

    const receiverId = conversation.members.find(
      (member) => member !== user._id
    );

    socket?.current.emit("sendMessage", {
      senderId: user._id,
      receiverId: receiverId,
      text: newMessage,
    });

    try {
      await axios
        .post(`http://localhost:4000/api/v1/messages/newMessage`, message, {
          withCredentials: true,
        })
        .then((response) => {
          console.log(response);
          setMessages([...messages, response.data]);
          setNewMessage("");
        })
        .catch((error) => {
          console.error("API Error:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chatting">
      <AppBar position="static">
        <StyledToolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 0 }}
          >
            {/* <MenuIcon /> */}
            <Avatar alt="Remy Sharp" src="" sx={{ width: 24, height: 26 }} />
          </IconButton>
          <Typography variant="h6" flexGrow={1} sx={{ pt: 0, ml: 0 }}>
            {
              chattedUsers[conversation?.members.find((m) => m !== user._id)]
                ?.name
            }
          </Typography>
          <IconButton
            size="large"
            aria-label="display more actions"
            edge="end"
            color="inherit"
          >
            <VideoCallIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="display more actions"
            edge="end"
            color="inherit"
          >
            <DownloadIcon />
          </IconButton>
        </StyledToolbar>
      </AppBar>
      {/* <Messages /> */}
      <ReactScrollToBottom className="messages">
        {messages.map((m) => (
          <Message owner={m.sender === user._id} message={m} />
        ))}
      </ReactScrollToBottom>
      <div className="sendMsg">
        <Input
          onKeyPress={(event) =>
            event.key === "Enter" ? sendMeesageBtController(event) : null
          }
          placeholder="Type a message"
          className="input"
          id="chatInput"
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <Button
          variant="contained"
          color="primary"
          className="button"
          onClick={sendMeesageBtController}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chatting;
