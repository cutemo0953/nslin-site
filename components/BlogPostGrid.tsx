'use client';

import { useState } from 'react';
import { CalendarDaysIcon, TagIcon } from '@heroicons/react/24/outline';
import type { BlogFrontmatter } from '@/lib/blog';

interface PostItem {
  slug: string;
  frontmatter: BlogFrontmatter;
}

export default function BlogPostGrid({
  posts,
  tags,
  locale,
}: {
  posts: PostItem[];
  tags: string[];
  locale: string;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const isZh = locale === 'zh-TW';

  const filtered = activeTag
    ? posts.filter((p) => p.frontmatter.tags.includes(activeTag))
    : posts;

  return (
    <>
      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
              !activeTag
                ? 'bg-steel-600 text-white'
                : 'bg-metal-100 text-metal-600 hover:bg-metal-200'
            }`}
          >
            {isZh ? '全部' : 'All'}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                activeTag === tag
                  ? 'bg-steel-600 text-white'
                  : 'bg-metal-100 text-metal-600 hover:bg-metal-200'
              }`}
            >
              <TagIcon className="h-3.5 w-3.5" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <a
              key={post.slug}
              href={`${isZh ? '/zh-TW' : ''}/blog/${post.slug}`}
              className="group overflow-hidden rounded-xl border border-metal-200 hover:border-steel-300 hover:shadow-lg transition-all"
            >
              {post.frontmatter.coverImage && (
                <div className="aspect-[16/9] overflow-hidden bg-metal-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.frontmatter.coverImage}
                    alt={post.frontmatter.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2 text-xs text-metal-400">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  {post.frontmatter.date}
                </div>
                <h2 className="mb-2 font-semibold text-steel-800 group-hover:text-steel-600 line-clamp-2">
                  {post.frontmatter.title}
                </h2>
                <p className="text-sm text-metal-600 line-clamp-3">
                  {post.frontmatter.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-metal-100 px-2 py-0.5 text-xs text-metal-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-metal-500 italic">
          {isZh ? '尚無文章。' : 'No posts yet.'}
        </p>
      )}
    </>
  );
}
