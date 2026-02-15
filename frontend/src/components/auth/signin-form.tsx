import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// validate
import { z } from "zod"; //
import { useForm } from "react-hook-form"; //
import { zodResolver } from "@hookform/resolvers/zod"; //
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

const signinSchema = z.object({
  userName: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

type signinFormValue = z.infer<typeof signinSchema>;

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<signinFormValue>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: signinFormValue) => {
    console.log("hàm submit được gọi: ", data);

    try {
      const { userName, password } = data;

      await signIn(userName, password);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header  */}
              <div className="flex flex-col items-col item-center text-center gap-2">
                <img
                  src="logo.svg"
                  alt="logo"
                  className="block text-center mx-auto w-fix"
                />
                <h1 className="text-center text-balance text-2xl font-bold">
                  Chào Mừng Quay Lại
                </h1>
                <p className="text-balance">
                  Đăng Nhập vào Tài Khoản DinhCongMinh Của Bạn
                </p>
              </div>
              {/* User Name */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="userName">Tên Đăng nhập</Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="DinhCongMinh"
                    {...register("userName")}
                  />
                  {/* ERROR */}
                  {errors.userName && (
                    <p className="text-destructive">
                      {" "}
                      {errors.userName.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Password */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật Khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                  {/* ERROR */}
                  {errors.password && (
                    <p className="text-destructive">
                      {" "}
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Nút Bấm */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Đăng nhập
                </Button>
              </div>

              {/* Tạo Tài Khoản */}
              <div className="space-y-2 text-center text-sm  text-muted-foreground">
                <span>
                  Bnạ chưa có tài khoản?{" "}
                  <a
                    href="/signup"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Đăng Kí
                  </a>
                </span>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 ">
        Bằng cách nhấp vào tiếp tục, bạn đồng ý với{" "}
        <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật </a> của chúng tôi.
      </div>
    </div>
  );
}
