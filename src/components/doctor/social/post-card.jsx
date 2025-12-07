import { Actions } from "@/components/shared/actions";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export const PostCard = ({ post, setPosts }) => {
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
    // <Card className="overflow-hidden rounded-2xl shadow-sm">
    <Card className="overflow-hidden rounded-none shadow-none aspect-9/16">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <p className="font-semibold">{post.doctorName}</p>
          <p className="text-xs text-slate-500">
            {post.doctorSpecialization} • {post.city}
          </p>
        </div>

        {/* <MoreVerticalIcon className="h-5 w-5 text-slate-600" /> */}
        <div className="flex gap-2 items-center">
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
        </div>
      </CardHeader>

      {/* Media Preview */}
      <div className="w-full aspect-square bg-slate-200 flex items-center justify-center">
        {post.type === "image" && (
          //   <p className="text-slate-500">🖼 Image Preview</p>
          <Image
            src="/dummy/blog-test.jpg"
            alt="image"
            width={800}
            height={600}
            className="aspect-square object-cover"
          />
        )}
        {post.type === "video" && (
          //   <p className="text-slate-500">🎥 Video Preview</p>
          <video
            src="/dummy/video.mp4"
            controls
            className="aspect-square object-cover"
          />
        )}
        {post.type === "article" && (
          //   <p className="text-slate-500">📄 Article Content</p>
          <Image
            src="/dummy/blog-test.jpg"
            alt="image"
            width={800}
            height={600}
            className="aspect-square object-cover"
          />
        )}
      </div>

      {/* Content */}
      <CardContent className="space-y-2 pt-4">
        <p className="font-semibold text-lg">{post.title}</p>
        <p className="text-sm text-slate-600">{post.description}</p>
      </CardContent>

      {/* Stats */}
      <CardFooter className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="flex items-center gap-1 text-sm">
            <EyeIcon className="h-4 w-4" /> {post.views}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <HeartIcon className="h-4 w-4" /> {post.likes}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <MessageSquareIcon className="h-4 w-4" /> {post.comments.length}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            post.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {post.status}
        </span>
      </CardFooter>

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
    </Card>
  );
};

PostCard.Skeleton = function PostCardSkeleton() {
    return (
      <Card className="overflow-hidden rounded-none shadow-none aspect-9/16">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>

          <div className="flex gap-2 items-center">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </CardHeader>

        {/* Media Preview */}
        <div className="w-full aspect-square bg-slate-100">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content */}
        <CardContent className="space-y-2 pt-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-56" />
        </CardContent>

        {/* Stats + Status */}
        <CardFooter className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-slate-600">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-12" />
          </div>

          <Skeleton className="h-5 w-20 rounded-full" />
        </CardFooter>
      </Card>
    );
}
