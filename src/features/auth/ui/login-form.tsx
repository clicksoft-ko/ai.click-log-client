import { BrandMark } from "@/widgets/brand";
import { useAuth } from "../model/use-auth";

const fieldClass =
  "h-10 w-full rounded-md border border-line-strong bg-white px-3 text-sm text-ink placeholder:text-[#6B7486] focus:border-[#2E5BDB] focus:outline-none focus:ring-[3px] focus:ring-[#2E5BDB]/20";

export const LoginForm = () => {
  const { loginForm, isPending, setLoginForm, handleLogin } = useAuth();

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-5">
      <div className="flex items-center gap-3">
        <BrandMark size={40} />
        <div className="flex flex-col leading-tight">
          <span className="text-[17px] font-bold">ClickSoft</span>
          <span className="text-[13px] text-ink-2">로그 모니터</span>
        </div>
      </div>

      <form
        className="flex flex-col gap-3.5 rounded-[10px] border border-line bg-white p-6"
        onSubmit={handleLogin}
      >
        <h1 className="mb-0.5 text-lg font-semibold">로그인</h1>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="userId"
            className="text-[12.5px] font-medium text-ink-2"
          >
            아이디
          </label>
          <input
            id="userId"
            type="text"
            required
            autoComplete="username"
            className={fieldClass}
            placeholder="아이디"
            value={loginForm.userId}
            onChange={(e) =>
              setLoginForm({ ...loginForm, userId: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[12.5px] font-medium text-ink-2"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className={fieldClass}
            placeholder="비밀번호"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="mt-1.5 h-10 rounded-md bg-navy text-sm font-semibold text-white hover:bg-navy-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E5BDB] disabled:opacity-60"
        >
          {isPending ? "로그인 중" : "로그인"}
        </button>
      </form>

      <p className="text-[12.5px] leading-relaxed text-ink-2">
        사내 전용 화면입니다. 계정이 필요하면 관리자에게 요청하세요.
      </p>
    </div>
  );
};
