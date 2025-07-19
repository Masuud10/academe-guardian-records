import React from "react";
import SupportTicketManagement from "../support/SupportTicketManagement";

const FinanceSupportModule = () => {
  return (
    <SupportTicketManagement
      title="My Support Tickets"
      description="Track the status of your support requests here."
      showCreateButton={true}
    />
  );
};

export default FinanceSupportModule;
