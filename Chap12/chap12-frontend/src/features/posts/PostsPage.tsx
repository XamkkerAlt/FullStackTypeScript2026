import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { postsApi } from '../../api/endpoints';
import type { Post } from '../../types';
export function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        postsApi.getAll()
            .then((res) => setPosts(res.data))
            .finally(() => setIsLoading(false));
    }, []);
    if (isLoading) {
        return <p>Loading posts...</p>;
    }
    return (
        <div>
            <h1>Posts</h1>
            <Link to="/posts/new">Create Post</Link>
            {posts.map((post) => (
                <article key={post.id}>
                    <Link to={`/posts/${post.id}`}>
                        <h2>{post.title}</h2>
                    </Link>
                    <p>{post.content.slice(0, 150)}...</p>
                </article>
            ))}
        </div>
    );
}