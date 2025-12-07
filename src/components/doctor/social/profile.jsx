"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Profile = ({ isOpen, setIsOpen }) => {
  const [isActive, setIsActive] = useState(true);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="space-y-6">
        <SheetHeader>
          <SheetTitle>Doctor Profile</SheetTitle>
          <SheetDescription>
            Quick overview & account activation control.
          </SheetDescription>
        </SheetHeader>

        {/* Doctor Info */}
        <div className="flex flex-col justify-center items-center gap-4">
          <Avatar className="rounded-full object-cover size-20">
            <AvatarImage src="https://github.com/shadcn.png" />
            {/* <AvatarImage src="https://github.com/evilrabbit.png" /> */}
            <AvatarFallback>Dr</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-lg font-semibold">Dr. John Doe</h2>
            <p className="text-sm text-muted-foreground">Cardiologist</p>
          </div>
        </div>

        {/* Followers / Following */}
        <div className="flex gap-8 text-center p-4 justify-center -mt-8">
          <div>
            <p className="text-xl font-bold">4.2k</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-xl font-bold">380</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Active / Inactive Toggle */}
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <p className="font-medium">Account Status</p>
            <p className="text-sm text-muted-foreground">
              Toggle to activate or deactivate this doctor
            </p>
          </div>

          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>

          <Button>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
