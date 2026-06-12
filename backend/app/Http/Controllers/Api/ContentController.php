<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
{
    public function pageBySlug(string $slug): JsonResponse
    {
        $page = CmsPage::query()
            ->with('sections')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
                'updated_at' => $page->updated_at?->toIso8601String(),
                'sections' => $page->sections->map(fn ($section) => [
                    'id' => $section->id,
                    'type' => $section->type,
                    'title' => $section->title,
                    'content' => $section->content,
                    'sort_order' => $section->sort_order,
                ])->values(),
            ],
        ]);
    }

    public function posts(): JsonResponse
    {
        $posts = BlogPost::query()
            ->with(['author:id,name', 'categories:id,name,slug'])
            ->where('status', 'published')
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $posts->map(fn (BlogPost $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'cover_image' => $post->cover_image,
                'published_at' => $post->published_at?->toIso8601String(),
                'author' => $post->author?->name,
                'categories' => $post->categories->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ])->values(),
            ])->values(),
        ]);
    }

    public function postBySlug(string $slug): JsonResponse
    {
        $post = BlogPost::query()
            ->with(['author:id,name', 'categories:id,name,slug'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'cover_image' => $post->cover_image,
                'seo_title' => $post->seo_title,
                'seo_description' => $post->seo_description,
                'published_at' => $post->published_at?->toIso8601String(),
                'updated_at' => $post->updated_at?->toIso8601String(),
                'author' => $post->author?->name,
                'categories' => $post->categories->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ])->values(),
            ],
        ]);
    }
}
