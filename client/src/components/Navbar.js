import React from "react";
import Button from "@mui/material/Button";

import { useNavigate } from "react-router-dom";
import { useReceiverIdContext } from "../context/ReceiverIdContext";
import { useConversationContext } from "../context/ConversationContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { setConversationValue } = useConversationContext();

  const { receiverId, setReceiverIdValue } = useReceiverIdContext();

  const handleBack = () => {
    // setConversationValue(null);
    if (receiverId) {
      setConversationValue(null);
      setReceiverIdValue(null);
    }
    navigate("/");
  };

  return (
    <div className="navbar">
      <Button variant="contained" onClick={handleBack}>
        Back
      </Button>
    </div>
  );
};

export default Navbar;
