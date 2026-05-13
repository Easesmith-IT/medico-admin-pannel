"use client";

import { useState } from "react";
import Link from "next/link";

import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PATCH } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";

const ProfileSecurityPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordRotationDays, setPasswordRotationDays] = useState("90");
  const [mfaRequiredForAdmins, setMfaRequiredForAdmins] = useState(false);

  const passwordMutation = useApiMutation({
    url: "/admin/profile/password",
    method: PATCH,
    invalidateKey: ["admin-profile-security"],
  });

  const policyMutation = useApiMutation({
    url: "/admin/security-policy",
    method: PATCH,
    invalidateKey: ["admin-profile-security"],
  });

  const onChangePassword = async () => {
    await passwordMutation.mutateAsync({
      currentPassword,
      newPassword,
    });
    setCurrentPassword("");
    setNewPassword("");
  };

  const onUpdatePolicy = async () => {
    await policyMutation.mutateAsync({
      passwordRotationDays: Number(passwordRotationDays),
      mfaRequiredForAdmins,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <H1>Profile Security</H1>
        <Button asChild variant="outline">
          <Link href="/admin/security/mfa">Open MFA Settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Password Rotation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Current password"
            className="max-w-md"
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            className="max-w-md"
          />
          <Button
            onClick={onChangePassword}
            disabled={passwordMutation.isPending || !currentPassword || !newPassword}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Security Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={passwordRotationDays}
              onChange={(event) => setPasswordRotationDays(event.target.value)}
              placeholder="Password rotation days"
              className="max-w-xs"
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mfaRequiredForAdmins}
                onChange={(event) => setMfaRequiredForAdmins(event.target.checked)}
              />
              Enforce MFA for admins
            </label>
          </div>
          <Button onClick={onUpdatePolicy} disabled={policyMutation.isPending}>
            Save Security Policy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSecurityPage;
