import {
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  Trash2Icon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "../../ui/scroll-area";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Button } from "../../ui/button";
import { Comment } from "./comment";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { AddCommentModal } from "./add-commentmodal";
import { useState } from "react";

const statusLabel = {
  published: "Published",
  hidden: "Hidden",
  "on-hold": "On Hold",
};

export const Overview = ({ selectedPost }) => {
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutateAsync, isPending, data } = useApiMutation({
    url: "/socialPost/followDoctor",
    method: POST,
    invalidateKey: ["post", params.postId],
  });

  const handleClick = async () => {
    await mutateAsync({ targetDoctorId: selectedPost?.doctor?._id });
  };

  const handleCommentModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 min-w-0">
      <Tabs defaultValue="overview" className="h-full flex flex-col">
        <TabsList className="mx-6 mt-4 mb-2">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex-1">
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="flex-1 px-6 pb-6 pt-2 overflow-hidden"
        >
          <ScrollArea className="h-full space-y-4">
            <div className="flex justify-between items-center gap-5">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    {selectedPost.creator?.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">
                    {selectedPost?.creator?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedPost?.creator?.position}
                  </div>
                </div>
              </div>
              <Button
                disabled={isPending}
                onClick={handleClick}
                className=""
                variant={"default"}
              >
                {isPending ? <Spinner /> : "Follow"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              {/* <div className="p-3 rounded-xl border bg-slate-50">
                <div className="text-xs text-slate-500">Category</div>
                <div className="mt-1 font-medium">{selectedPost.category}</div>
              </div> */}
              <div className="p-3 rounded-xl border col-span-2 bg-slate-50">
                <div className="text-xs text-slate-500">Location</div>
                <div className="mt-1 font-medium">
                  {selectedPost?.creator?.location || "Unknown"}
                </div>
              </div>
              <div className="p-3 rounded-xl border flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Views</div>
                  <div className="mt-1 font-medium">
                    {selectedPost?.stats?.views}
                  </div>
                </div>
                <EyeIcon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="p-3 rounded-xl border flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Likes</div>
                  <div className="mt-1 font-medium">
                    {selectedPost?.stats?.likes}
                  </div>
                </div>
                <HeartIcon className="h-4 w-4 text-emerald-500" />
              </div>
            </div>

            <div className="p-3 rounded-xl border flex items-center justify-between mt-3">
              <div>
                <div className="text-xs text-slate-500">Status</div>
                <div className="mt-1">
                  <Badge className="rounded-full text-xs">
                    {statusLabel[selectedPost.status]}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="status-switch"
                  className="text-xs text-slate-500"
                >
                  Published
                </Label>
                <Switch
                  id="status-switch"
                  //   checked={selectedPost.status === "published"}
                  checked={true}
                  //   onCheckedChange={() => handleToggleStatus(selectedPost.id)}
                />
              </div>
            </div>

            {/* <div className="flex gap-2 mt-3">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleDeletePost(selectedPost.id)}
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete Article
              </Button>
            </div> */}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="comments" className="flex-1 px-6 pb-6 pt-2">
          <div className="h-full space-y-3">
            {selectedPost?.comments?.length === 0 && (
              <p className="text-sm text-slate-500 mt-4">
                No comments yet for this article.
              </p>
            )}

            <div className="flex flex-col gap-3 max-h-100 overflow-y-auto">
              {selectedPost?.comments?.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>

            <div className="flex justify-end mt-5">
              <Button onClick={handleCommentModal} className="">
                Add Comment
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <AddCommentModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};
