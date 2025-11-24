import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import React from "react";

const UpdatePage = () => {
  return (
    <div>
      <BackLink href="/admin/service-partners">
        <H1>Update Service Provider</H1>
      </BackLink>
    </div>
  );
};

export default UpdatePage;
