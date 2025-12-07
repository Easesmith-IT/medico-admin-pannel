import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

export const Comment = ({ comment }) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const handleDelete = ()=>{}

  return (
    <div className="border rounded-xl p-3 flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {comment.author
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{comment.author}</div>
          <span className="text-[11px] text-slate-400">
            {comment.createdAt}
          </span>
        </div>
        <p className="text-sm text-slate-700 mt-1">{comment.text}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MessageCircleIcon className="h-3 w-3" />
            <span>Comment</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2Icon className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete Comment"
          description="Are you sure you want to delete this comment? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={false}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
