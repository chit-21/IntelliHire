import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold mb-4">Interview generation</h3>

      <Agent
        userName={user?.name || "You"}
        userId={user?.id}
        type="generate"
      />
    </div>
  );
};

export default Page;
