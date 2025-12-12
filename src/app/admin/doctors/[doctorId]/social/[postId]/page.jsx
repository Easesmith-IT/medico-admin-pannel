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
import { useApiQuery } from "@/hooks/useApiQuery";
import { ImageOffIcon } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const statusLabel = {
  published: "Published",
  hidden: "Hidden",
  "on-hold": "On Hold",
};

const PostDetails = () => {
  const params = useParams();
  const [error, setError] = useState(false);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const { data, isLoading } = useApiQuery({
    url: `/socialPost/getPostById/${params.postId}`,
    queryKeys: ["post", params.postId],
  });

  console.log("data", data);
  const selectedPost = data;

  return (
    <div className="space-y-6">
      <BackLink href={`/admin/doctors/${params.doctorId}/social`}></BackLink>
      <div className="bg-white">
        {selectedPost && (
          <div className="flex flex-col h-full">
            <div className="px-6 pt-6 pb-3 border-b">
              {/* {selectedPost.type === "GALLERY" && (
                <Image
                  src="/dummy/blog-test.jpg"
                  alt="image"
                  width={800}
                  height={600}
                  className="aspect-video w-[60%]"
                />
              )} */}

              {selectedPost?.type === "GALLERY" && (
                <>
                  <Carousel setApi={setApi} className="w-full max-w-xs ml-10">
                    <CarouselContent>
                      {selectedPost?.mediaUrls.map((img, index) => (
                        <CarouselItem key={index}>
                          <div>
                            {!error && (
                              <Image
                                src={
                                  img?.includes("https")
                                    ? img
                                    : `${process.env.NEXT_PUBLIC_IMAGE_URL}${img}`
                                }
                                alt="image"
                                width={800}
                                height={600}
                                className="aspect-square object-cover"
                                onError={() => setError(true)}
                              />
                            )}
                            {error && (
                              <div className="flex items-center justify-center aspect-video w-[60%] bg-gray-200 rounded">
                                <ImageOffIcon className="w-10 h-10 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </>
              )}

              {selectedPost.type === "REEL" && (
                <div className="relative w-full max-w-sm mx-auto h-[80vh] overflow-hidden rounded-xl bg-black">
                  <video
                    src="/dummy/video.mp4"
                    controls
                    className="h-full w-full object-cover"
                    playsInline
                  />
                </div>
              )}

              {/* <H3 className="text-lg mt-5">{selectedPost.title}</H3> */}
              {/* <div>
                <p className="text-sm text-slate-600">
                  {selectedPost.content}
                </p>
              </div> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[65%_33%] gap-[2%] bg-white">
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
                      {/* {selectedPost.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="rounded-full text-xs border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          #{tag}
                        </Badge>
                      ))} */}
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
