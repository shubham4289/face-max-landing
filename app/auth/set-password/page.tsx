import SetPasswordForm from "./SetPasswordForm";

interface PageProps {
  searchParams: { token?: string };
}

export default function SetPasswordPage({ searchParams }: PageProps) {
  const token = searchParams.token ?? "";
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SetPasswordForm token={token} />
    </div>
  );
}
