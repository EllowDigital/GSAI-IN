
import React from "react"

const mockPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "State Championship Results Announced",
    excerpt: "Several GSAI students brought home medals at the recent state championships. Congratulations to all participants!",
    date: "2024-06-11",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80",
    title: "Summer Camp Registrations Open!",
    excerpt: "Registrations for our annual summer camp are now open. Secure your spot for a season of learning and fun!",
    date: "2024-05-23",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1519864600265-abb23848c217?auto=format&fit=crop&w=400&q=80",
    title: "Self-Defense Workshop For Women",
    excerpt: "Join our free self-defense workshop open for all women and girls this July at our Main Campus.",
    date: "2024-05-08",
  },
]

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function BlogNewsSection() {
  return (
    <section id="blog" className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-400 text-center">
          📰 Blog &amp; News
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {mockPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:scale-105 hover:shadow-lg transition cursor-pointer group">
              <img
                src={post.image}
                alt={post.title}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
              <div className="flex-1 p-5 flex flex-col">
                <span className="text-xs font-semibold text-yellow-400 mb-2">{formatDate(post.date)}</span>
                <h3 className="text-lg font-bold mb-1 group-hover:text-red-600 transition">{post.title}</h3>
                <p className="text-gray-600">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
