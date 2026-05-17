"use client";

import { useState } from "react";

import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";

const MfaSecurityPage = () => {
  const [otp, setOtp] = useState("");
  const [disableOtp, setDisableOtp] = useState("");
  const [secretPreview, setSecretPreview] = useState(null);

  const setupMutation = useApiMutation({
    url: "/admin/mfa/setup",
    method: POST,
    invalidateKey: ["admin-profile-security"],
  });

  const verifyMutation = useApiMutation({
    url: "/admin/mfa/verify",
    method: POST,
    invalidateKey: ["admin-profile-security"],
  });

  const disableMutation = useApiMutation({
    url: "/admin/mfa/disable",
    method: POST,
    invalidateKey: ["admin-profile-security"],
  });

  const onSetup = async () => {
    try {
      const result = await setupMutation.mutateAsync();
      setSecretPreview(result?.data || null);
    } catch {
      // handled by useApiMutation
    }
  };

  const onVerify = async () => {
    try {
      await verifyMutation.mutateAsync({ otp });
      setOtp("");
    } catch {
      // handled by useApiMutation
    }
  };

  const onDisable = async () => {
    try {
      await disableMutation.mutateAsync({ otp: disableOtp });
      setDisableOtp("");
    } catch {
      // handled by useApiMutation
    }
  };

  return (
    <div className="space-y-6">
      <H1>MFA Security</H1>

      <Card>
        <CardHeader>
          <CardTitle>MFA Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onSetup} disabled={setupMutation.isPending}>
            {setupMutation.isPending ? (
              <>
                <Spinner className="size-4" />
                Generating...
              </>
            ) : (
              "Generate MFA Secret"
            )}
          </Button>

          {secretPreview ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p>
                <span className="font-semibold">Secret:</span> {secretPreview.secret}
              </p>
              <p>
                <span className="font-semibold">Test OTP:</span> {secretPreview.otpPreviewForTesting}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP to enable MFA"
              className="max-w-xs"
            />
            <Button onClick={onVerify} disabled={verifyMutation.isPending || !otp}>
              {verifyMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Verifying...
                </>
              ) : (
                "Verify & Enable MFA"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disable MFA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={disableOtp}
              onChange={(event) => setDisableOtp(event.target.value)}
              placeholder="Enter OTP to disable MFA"
              className="max-w-xs"
            />
            <Button
              variant="destructive"
              onClick={onDisable}
              disabled={disableMutation.isPending || !disableOtp}
            >
              {disableMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Disabling...
                </>
              ) : (
                "Disable MFA"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MfaSecurityPage;
