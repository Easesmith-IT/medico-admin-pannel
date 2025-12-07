"use client";

import { Overview } from "@/components/doctor/social/overview";
import { BackLink } from "@/components/shared/back-link";
import { H3, P } from "@/components/typography";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPosts } from "@/data/posts";
import Image from "next/image";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const statusLabel = {
  published: "Published",
  hidden: "Hidden",
  "on-hold": "On Hold",
};

const PostDetails = () => {
  const params = useParams();
  const [selectedPost, setSelectedPost] = useState("");

  useEffect(() => {
    if (params.postId) {
      const foundPost = mockPosts.find((post) => post.id === params.postId);
      setSelectedPost(foundPost);
    }
  }, [params.postId]);

  return (
    <div className="space-y-6">
      <BackLink href={`/admin/doctors/${params.doctorId}/social`}></BackLink>
      <div className="bg-white">
        {selectedPost && (
          <div className="flex flex-col h-full">
            <div className="px-6 pt-6 pb-3 border-b">
              {selectedPost.type === "image" && (
                <Image
                  src="/dummy/blog-test.jpg"
                  alt="image"
                  width={800}
                  height={600}
                  className="aspect-video"
                />
              )}
              {selectedPost.type === "video" && (
                <video
                  src="/dummy/video.mp4"
                  controls
                  className="rounded-lg aspect-video"
                />
              )}
              <H3 className="text-lg mt-5">{selectedPost.title}</H3>
              <div>
                <p className="text-sm text-slate-600">
                  {selectedPost.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[70%_30%] gap-5 bg-white">
              {/* Left: content */}
              <div className="flex-[1.4] border-r min-w-0">
                <ScrollArea className="h-full px-6 py-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Content</h3>
                    <p className="text-sm">{selectedPost.content}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="rounded-full text-xs border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Right: overview & comments */}
              <Overview selectedPost={selectedPost} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
