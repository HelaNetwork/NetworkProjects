import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import useAuthStore from "../store/authStore";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import SuggestedUsers from "../components/SuggestedUsers";

export default function Home() {
  const { walletAddress } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (p = 1) => {
    try {
      const { data } = await api.get(`/posts/feed/${walletAddress}?page=${p}`);
      if (p === 1) setPosts(data.posts);
      else setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => { fetchFeed(1); }, [fetchFeed]);

  const handleNewPost = (post) => setPosts((prev) => [post, ...prev]);

  const handlePostUpdate = (updatedPost) =>
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));

  const handlePostDelete = (postId) =>
    setPosts((prev) => prev.filter((p) => p._id !== postId));

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(next);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-4">
        <CreatePost onPost={handleNewPost} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-chain-border" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-chain-border rounded w-24" />
                    <div className="h-3 bg-chain-border rounded w-40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-chain-border rounded w-full" />
                  <div className="h-3 bg-chain-border rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🌐</p>
            <p className="font-display text-chain-text mb-1">Your feed is empty</p>
            <p className="text-chain-text-muted text-sm">Follow some users or check the Explore page</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              ))}
            </div>
            {hasMore && (
              <button onClick={loadMore} className="btn-ghost w-full">
                Load more
              </button>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block space-y-4">
        <SuggestedUsers />
      </div>
    </div>
  );
}
