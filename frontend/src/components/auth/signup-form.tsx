import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

// zod 1.
const SignUpSchema = z.object({
  firstName: z.string().min(1, "Họ không được để trống"),
  lastName: z.string().min(1, "Tên không được để trống"),
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// zod 2.
// lấy kiểu dữ liệu của SignUpSchema, infer tự sinh ra kiểu
// => từ cái Schema tự sinh ra kiểu của Form
type SignUpFormValues = z.infer<typeof SignUpSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  //

  // zod 3.

  // c1 : nếu 1 form
  const {
    register, //theo giõi gt của form input
    handleSubmit, // khi nhấn nút sẽ chạy
    formState: {
      errors, // chứa lỗi nếu input ko hợp lệ,
      isSubmitting, // cho biết khi nào form đnag trong quá trình nhập liệu
    },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema), // gán cho SignUpSchema
  });

  // c2 : nếu nhiều form
  //
  // const signupForm = useForm<SignUpFormValues>({
  //   resolver: zodResolver(SignUpSchema), // gán cho SignUpSchema
  // });

  // rồi sau đó :  signupForm.handleSubmit(onSignup),
  //            :  {...signupForm.register("firstName")},
  //            :  signupForm.formState.errors.firstName

  const onSubmit = async (data: SignUpFormValues) => {
    console.log("hàm submit được gọi");
    console.log(data);

    const { firstName, lastName, username, email, password } = data;

    try {
      const res = await signUp(username, email, password, lastName, firstName);
      console.log(res);

      navigate("/signIn");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            // onSubmit={handleSubmit((val) => {
            //   console.log("submit");
            //   onSubmit(val);
            // })}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-6">
              {/* header  */}
              <div className="flex flex-col items-col items-center text-center gap-2">
                <img
                  src="/logo.svg"
                  alt="logo"
                  className="block mx-auto w-fix text-center"
                />
                <h1 className="text-2xl font-bold">
                  Tạo Tài Khoản ĐinhCôngMinh
                </h1>
                <p className="  text-balance">
                  Chào mừng bạn! Hãy đăng kí để bắt đầu
                </p>
              </div>
              {/* Họ và Tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <Label htmlFor="firstName">Họ</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Họ"
                    {...register("firstName")}
                  />
                  {/* message ERROR */}

                  {errors.firstName && (
                    <p className="text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input
                    type="text"
                    placeholder="Tên"
                    id="lastName"
                    {...register("lastName")}
                  />
                  {/*  message ERROR */}

                  {errors.lastName && (
                    <p className="text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              {/* User Name */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    type="text"
                    placeholder="Tên đăng nhập"
                    id="username"
                    {...register("username")}
                  />
                  {/* message ERROR */}

                  {errors.username && (
                    <p className="text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Nhập Email"
                    {...register("email")}
                  />
                  {/* message ERROR */}
                  {errors.email && (
                    <p className="text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
              {/* Password */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật Khẩu</Label>
                  <Input
                    type="text"
                    placeholder="Nhập Mật Khẩu"
                    id="password"
                    {...register("password")}
                  />
                  {/*  message ERROR */}
                  {errors.password && (
                    <p className="text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Button */}
              <div className=" space-y-2 flex flex-col items-center justify-center">
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isSubmitting}
                >
                  Đăng kí
                </Button>
                <div className="space-y-2 text-center text-sm  text-muted-foreground">
                  <span className="">
                    Đã có tài khoản?{" "}
                    <a
                      href="/signIn"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Đăng nhập
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2  -translate-y-1/2 object-cover"
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
