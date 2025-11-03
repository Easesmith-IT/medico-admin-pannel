"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AdminLoginSchema } from "@/schemas/AdminLoginShcema";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";
import { setAuthCookies } from "@/lib/cookies";
import Spinner from "@/components/shared/Spinner";
import Image from "next/image";

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: "admin@medico.com",
      password: "Mansi@333",
      rememberMe: false,
    },
  });

  const { reset, handleSubmit, control } = form;

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: "/admin/login",
    method: POST,
    invalidateKey: ["admin-login"],
    // isToast: false,
  });

  const onSubmit = async (values) => {
    await submitForm(values);
    // router.push("/admin/dashboard");
  };

  useEffect(() => {
    if (result) {
      console.log("login result", result);
      
      // const { accessToken, refreshToken, userInfo } = result.cookies;
      // setAuthCookies({
      //   accessToken,
      //   refreshToken,
      //   userInfo: JSON.stringify(userInfo),
      // });
      // login();

      // console.log("userInfo", userInfo);

      reset();
      router.push("/admin/dashboard");
    }
  }, [result]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-main to-para-3 p-4">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-950 rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center space-y-1 p-6 pb-0">
          <Image
            src="/logos/medico-logo.svg"
            width={60}
            height={60}
            className="mx-auto"
            alt="Medico"
          />
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Access your dashboard securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#84818C] h-4 w-4" />
                        <Input
                          placeholder="Enter email address"
                          className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-primary-purple hover:text-primary-purple/80 transition-colors duration-200"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#84818C] h-4 w-4" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Password"
                          className="pl-10 pr-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 cursor-pointer" />
                          ) : (
                            <Eye className="h-4 w-4 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-400 data-[state=checked]:bg-main data-[state=checked]:border-main data-[state=checked]:"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel
                        htmlFor="remember-me"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
                      >
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="medico"
                size="lg"
                className="w-full rounded"
                disabled={isSubmitFormLoading}
              >
                {isSubmitFormLoading ? (
                  <Spinner spinnerClassName="size-6" />
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
