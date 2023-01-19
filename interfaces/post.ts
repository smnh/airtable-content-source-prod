import type Author from './author';
import type Asset from './asset';

interface PostType {
    id: string;
    slug: string;
    title: string;
    date?: string;
    coverImage?: Asset;
    author?: Author;
    excerpt?: string;
    ogImage?: Asset;
    content?: string;
}

export default PostType;
