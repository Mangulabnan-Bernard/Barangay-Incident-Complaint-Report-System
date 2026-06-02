import { redirect } from "next/navigation";

// The root simply forwards into the app; middleware bounces unauthenticated
// visitors to /login.
export default function Home() {
  redirect("/dashboard");
}
