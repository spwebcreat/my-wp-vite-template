<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<header class="site-header bg-white shadow-sm">
    <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">
                <a href="<?php echo home_url(); ?>" class="hover:text-blue-600">
                    <?php bloginfo('name'); ?>
                </a>
            </h1>
            
            <?php if (has_nav_menu('primary')): ?>
                <nav class="primary-navigation">
                    <?php wp_nav_menu([
                        'theme_location' => 'primary',
                        'menu_class' => 'flex space-x-6',
                        'container' => false,
                    ]); ?>
                </nav>
            <?php endif; ?>
        </div>
    </div>
</header>

<main class="site-main">
    <div class="container mx-auto px-4 py-8">
        
        <?php if (is_home() && !is_front_page()): ?>
            <header class="page-header mb-8">
                <h1 class="text-3xl font-bold text-gray-900">ブログ</h1>
            </header>
        <?php endif; ?>

        <?php if (have_posts()): ?>
            <div class="posts-grid space-y-8">
                <?php while (have_posts()): the_post(); ?>
                    <article class="post bg-white rounded-lg shadow-md p-6">
                        <header class="post-header mb-4">
                            <h2 class="text-xl font-semibold mb-2">
                                <a href="<?php the_permalink(); ?>" class="text-gray-900 hover:text-blue-600">
                                    <?php the_title(); ?>
                                </a>
                            </h2>
                            <div class="post-meta text-sm text-gray-600">
                                <time datetime="<?php echo get_the_date('c'); ?>">
                                    <?php echo get_the_date(); ?>
                                </time>
                                <?php if (get_the_category()): ?>
                                    <span class="mx-2">•</span>
                                    <?php the_category(', '); ?>
                                <?php endif; ?>
                            </div>
                        </header>

                        <div class="post-content">
                            <?php if (is_home() || is_archive()): ?>
                                <?php the_excerpt(); ?>
                                <a href="<?php the_permalink(); ?>" class="inline-block mt-3 text-blue-600 hover:underline">
                                    続きを読む →
                                </a>
                            <?php else: ?>
                                <?php the_content(); ?>
                            <?php endif; ?>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>

            <?php the_posts_pagination([
                'prev_text' => '← 前のページ',
                'next_text' => '次のページ →',
                'class' => 'pagination mt-8 flex justify-center'
            ]); ?>

        <?php else: ?>
            <div class="no-posts text-center py-12">
                <h2 class="text-2xl font-bold text-gray-700 mb-4">投稿が見つかりません</h2>
                <p class="text-gray-600">申し訳ございませんが、該当する投稿がありません。</p>
            </div>
        <?php endif; ?>

    </div>
</main>

<footer class="site-footer bg-gray-800 text-white">
    <div class="container mx-auto px-4 py-8">
        <div class="text-center">
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</p>
            <p class="mt-2 text-sm text-gray-400">
                Powered by <strong>My WP Vite Template</strong> - 
                A modern WordPress development environment
            </p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>