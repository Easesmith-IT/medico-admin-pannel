import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Spinner from "./shared/Spinner";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export const VerifyOtpModal = ({ open, onClose, phone, onResend }) => {
  const [timer, setTimer] = useState(30);

  const form = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  console.log("getvalues", form.getValues());

  useEffect(() => {
    if (!open) return;
    setTimer(30);
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, [open]);

  const {
    mutateAsync: verifyOtp,
    isPending,
    data: result,
  } = useApiMutation({
    url: "/admin/verify-login-otp",
    method: POST,
    invalidateKey: ["admin-verify"],
  });

  const handleSubmit = async (data) => {
    await verifyOtp({ phone, otp: data.otp });
  };

  const onError = (error) => {
    console.log("error", error);
  };

  useEffect(() => {
    if (result) {
      console.log("result", result);
      onClose();
    }
  }, [result]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify OTP</DialogTitle>
          <DialogDescription>
            Please enter the 6-digit code sent to your registered number.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onError)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    {/* <Input placeholder="Mansi" {...field} /> */}
                    <InputOTP {...field} maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              {timer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {timer}s
                </p>
              ) : (
                <Button
                  variant="link"
                  type="button"
                  className="px-0 text-sm"
                  onClick={() => {
                    setTimer(30);
                    onResend?.();
                  }}
                >
                  Resend OTP
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="medico"
                type="submit"
                disabled={isPending}
                className="w-full"
              >
                {isPending ? <Spinner /> : "Verify OTP"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
