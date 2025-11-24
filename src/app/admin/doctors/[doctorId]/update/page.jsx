import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";

const UpdateDoctor = () => {
  return (
    <div>
      <BackLink href="/admin/doctors">
        <H1>Update Doctor</H1>
      </BackLink>
    </div>
  );
};

export default UpdateDoctor;
