import { useActionState } from 'react';
import { useNavigate } from 'react-router';
import { postsApi } from '../../api/endpoints';
export function CreatePostPage() {
    const navigate = useNavigate();
    const [error, submitAction, isPending] = useActionState(
        async (_prev: string | null, formData: FormData) => {
            const title = formData.get('title') as string;
            const content = formData.get('content') as string;
            try {
                await postsApi.create({ title, content });
                navigate('/');
                return null;
            } catch (e) {
                return e instanceof Error ? e.message : 'Failed to create post';
            }
        },
        null
    );
    return (
        <form action={submitAction}>
            <h1>Create Post</h1>
            {error && <p className="error">{error}</p>}
            <input name="title" placeholder="Title" required />
            <textarea name="content" placeholder="Content" rows={10} required />
            <button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Post'}
            </button>
        </form>
    );
}