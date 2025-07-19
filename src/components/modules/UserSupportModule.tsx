import React from "react";
import SupportTicketManagement from "../support/SupportTicketManagement";

const UserSupportModule = () => {
  return (
    <SupportTicketManagement
      title="My Support Tickets"
      description="Submit and track your support requests here."
      showCreateButton={true}
    />
  );
};

export default UserSupportModule;
