// import Link from "next/link";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  console.log("posts::: ", posts);
  return (
    <main className="">
      Hello! Work in progress!!!
      <div>
        {posts.map((post) => (
          <div key={post.id}>{post.name}</div>
        ))}
      </div>
    </main>
  );
}
