import { useParams, useRouter } from "next/navigation";
import { Actions } from "../../shared/actions";
import { Badge } from "../../ui/badge";
import { TableCell, TableRow } from "../../ui/table";
import { useState } from "react";
import { ConfirmModal } from "../../shared/confirm-modal";
import { Button } from "../../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const statusLabel = {
  published: "Published",
  hidden: "Hidden",
  "on-hold": "On Hold",
};

export const Post = ({ post, setPosts }) => {
  const router = useRouter();
  const params = useParams();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleViewPost = () => {
    router.push(`/admin/doctors/${params.doctorId}/social/${post.id}`);
  };

  const handleToggleStatus = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              status: p.status === "hidden" ? "published" : "hidden",
            }
          : p
      )
    );
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (selectedPost?.id === postId) {
      setSheetOpen(false);
    }
  };

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  return (
    <>
      <TableRow className="hover:bg-slate-50">
        <TableCell>
          <div className="font-medium text-slate-900">{post.title}</div>
          <div className="text-xs text-slate-500 line-clamp-1">
            {post.description}
          </div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{post.doctorName}</div>
          <div className="text-xs text-slate-500">
            {post.doctorSpecialization}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="rounded-full text-xs">
            {post.category}
          </Badge>
        </TableCell>
        <TableCell>{post.views}</TableCell>
        <TableCell>{post.likes}</TableCell>
        <TableCell>{post.comments.length}</TableCell>
        <TableCell>
          <Badge
            className="rounded-full text-xs"
            variant={post.status === "published" ? "default" : "secondary"}
          >
            {statusLabel[post.status]}
          </Badge>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs"
            onClick={() => handleToggleStatus(post.id)}
          >
            {post.status === "hidden" ? (
              <>
                <EyeIcon className="h-3 w-3 mr-1" /> Unhide
              </>
            ) : (
              <>
                <EyeOffIcon className="h-3 w-3 mr-1" /> Hide
              </>
            )}
          </Button>
          <Actions onView={handleViewPost} onDelete={onDelete} />
        </TableCell>
      </TableRow>

      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete Post"
          description="Are you sure you want to delete this post? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={false}
          onConfirm={handleDeletePost}
        />
      )}
    </>
  );
};
