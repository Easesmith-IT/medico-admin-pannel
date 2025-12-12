// const Social = () => {
//     return (
//         <div>Social</div>
//      );
// }

// export default Social;

// app/admin/posts/page.tsx (or any route)
// AdminPostsPage with shadcn/ui + Post Details Drawer

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Trash2,
  Search,
  Heart,
  MessageCircle,
  GridIcon,
  ListIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { useParams } from "next/navigation";
import { Post } from "@/components/doctor/social/post";
import { mockPosts } from "@/data/posts";
import { Profile } from "@/components/doctor/social/profile";
import { PostCard } from "@/components/doctor/social/post-card";
import { useApiQuery } from "@/hooks/useApiQuery";

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

  const params = useParams();

  const { data, isLoading, error } = useApiQuery({
    url: `/socialPost/getPosts`,
    queryKeys: ["post"],
  });

  console.log("data", data);

  useEffect(() => {
    if (data) {
      setPosts(data);
    }
  }, [data]);

  return (
    <div>
      <div className="flex-1 overflow-auto space-y-6">
        <div className="flex justify-between items-center gap-5">
          <BackLink href={`/admin/doctors/${params.doctorId}`}>
            <H1>Social Media</H1>
          </BackLink>
          <Button onClick={() => setIsOpen(true)} variant="medico">
            View Profile
          </Button>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select
              onValueChange={(v) => setStatusFilter(v)}
              value={statusFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Dermatology">Dermatology</SelectItem>
                <SelectItem value="Microbiology">Microbiology</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Kanpur">Kanpur</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* <div className="flex justify-between ml-auto gap-2 w-16 items-center border bg-white p-0.5">
          <Button>
            <GridIcon className="size-5" />
          </Button>
          <buton>
            <ListIcon className="size-5" />
          </buton>
        </div> */}

        {/* Posts table */}
        {/* <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <Post key={post.id} post={post} setPosts={setPosts} />
              ))}
              {filteredPosts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-sm text-slate-500"
                  >
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div> */}

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {!isLoading &&
            posts?.map((post) => (
              <PostCard key={post._id} post={post} setPosts={setPosts} />
            ))}

          {posts?.length === 0 && !isLoading && (
            <p className="text-center text-slate-500 py-10 sm:col-span-2 lg:col-span-3 2xl:col-span-4">
              No posts found.
            </p>
          )}

          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <PostCard.Skeleton key={index} />
            ))}
        </div>

        {isOpen && <Profile isOpen={isOpen} setIsOpen={setIsOpen} />}
      </div>
    </div>
  );
};

export default Social;
