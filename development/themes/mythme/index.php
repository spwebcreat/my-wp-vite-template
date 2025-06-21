<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class('p-home'); ?>>

<!-- ヘッダー -->
<header class="l-header">
    <div class="l-header__container">
        <a href="<?php echo home_url(); ?>" class="l-header__logo">
            <?php bloginfo('name'); ?>
        </a>
        
        <?php if (has_nav_menu('primary')): ?>
            <nav class="l-header__nav">
                <div class="l-nav">
                    <?php wp_nav_menu([
                        'theme_location' => 'primary',
                        'menu_class' => 'l-nav__menu',
                        'container' => false,
                        'link_before' => '<span class="l-nav__link">',
                        'link_after' => '</span>',
                    ]); ?>
                </div>
            </nav>
        <?php endif; ?>
        
        <button class="l-header__mobile-toggle js-mobile-toggle">
            ☰
        </button>
    </div>
</header>

<main class="site-main">
    
    <!-- ヒーローセクション -->
    <section class="c-hero">
        <div class="c-hero__overlay"></div>
        <div class="c-hero__content">
            <h1 class="c-hero__title">
                <?php echo get_bloginfo('name'); ?>
            </h1>
            <p class="c-hero__subtitle">
                <?php echo get_bloginfo('description') ?: 'モダンなソリューションで、あなたのビジネスを次のレベルへ'; ?>
            </p>
            <div class="c-hero__cta">
                <a href="#services" class="c-btn c-btn--primary c-btn--lg">サービス紹介</a>
                <a href="#contact" class="c-btn c-btn--ghost c-btn--lg">お問い合わせ</a>
            </div>
        </div>
        <div class="c-hero__scroll">
            <div class="c-hero__scroll__text">Scroll</div>
            <div class="c-hero__scroll__arrow">↓</div>
        </div>
    </section>

    <!-- サービス紹介セクション -->
    <section id="services" class="p-home__section p-home__services">
        <div class="container">
            <div class="p-home__section-title">
                <h2>サービス</h2>
                <p>私たちが提供する価値あるサービスをご紹介します</p>
            </div>
            
            <div class="c-cards-grid c-cards-grid--3">
                <div class="c-service-card">
                    <div class="c-service-card__icon">
                        💼
                    </div>
                    <h3 class="c-service-card__title">コンサルティング</h3>
                    <p class="c-service-card__description">
                        豊富な経験と専門知識を活かし、お客様のビジネス課題を解決します。
                    </p>
                </div>
                
                <div class="c-service-card">
                    <div class="c-service-card__icon">
                        🚀
                    </div>
                    <h3 class="c-service-card__title">システム開発</h3>
                    <p class="c-service-card__description">
                        最新技術を駆使したシステム開発で、効率的な業務をサポートします。
                    </p>
                </div>
                
                <div class="c-service-card">
                    <div class="c-service-card__icon">
                        📊
                    </div>
                    <h3 class="c-service-card__title">データ分析</h3>
                    <p class="c-service-card__description">
                        データドリブンな意思決定を支援し、ビジネスの成長を加速させます。
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- ニュース・お知らせセクション -->
    <section id="news" class="p-home__section p-home__news">
        <div class="container">
            <div class="p-home__section-title">
                <h2>ニュース・お知らせ</h2>
                <p>最新のお知らせや業界動向をお届けします</p>
            </div>
            
            <div class="p-home__news-list">
                <?php
                $news_posts = get_posts([
                    'numberposts' => 5,
                    'post_status' => 'publish'
                ]);
                
                if ($news_posts): ?>
                    <?php foreach ($news_posts as $post): setup_postdata($post); ?>
                        <article class="p-home__news-item">
                            <time class="p-home__news-date">
                                <?php echo get_the_date('Y.m.d'); ?>
                            </time>
                            <span class="p-home__news-category">
                                <?php 
                                $categories = get_the_category();
                                echo $categories ? $categories[0]->name : 'お知らせ'; 
                                ?>
                            </span>
                            <h3 class="p-home__news-title">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_title(); ?>
                                </a>
                            </h3>
                        </article>
                    <?php endforeach; ?>
                    <?php wp_reset_postdata(); ?>
                <?php else: ?>
                    <article class="p-home__news-item">
                        <time class="p-home__news-date">2024.01.01</time>
                        <span class="p-home__news-category">お知らせ</span>
                        <h3 class="p-home__news-title">
                            <a href="#">サンプルニュース記事</a>
                        </h3>
                    </article>
                <?php endif; ?>
            </div>
            
            <div class="text-center mt-4">
                <a href="<?php echo home_url('/news'); ?>" class="c-btn c-btn--secondary">
                    ニュース一覧を見る
                </a>
            </div>
        </div>
    </section>

    <!-- 会社概要セクション -->
    <section id="about" class="p-home__section p-home__about">
        <div class="container">
            <div class="p-home__section-title">
                <h2>会社概要</h2>
                <p>私たちについてご紹介します</p>
            </div>
            
            <div class="p-home__about-content">
                <div class="p-home__about-text">
                    <h3>私たちのミッション</h3>
                    <p>
                        テクノロジーの力でビジネスの可能性を最大化し、
                        お客様と共に持続可能な成長を実現することが私たちの使命です。
                    </p>
                    <p>
                        専門性と創造性を融合させ、常にお客様の期待を超える
                        価値あるソリューションを提供し続けます。
                    </p>
                    <a href="<?php echo home_url('/about'); ?>" class="c-btn c-btn--primary">
                        詳しく見る
                    </a>
                </div>
                
                <div class="p-home__about-image">
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                         alt="オフィス風景" 
                         loading="lazy">
                </div>
            </div>
            
            <div class="p-home__about-stats">
                <div class="p-home__stat">
                    <span class="p-home__stat-number">500+</span>
                    <span class="p-home__stat-label">プロジェクト実績</span>
                </div>
                <div class="p-home__stat">
                    <span class="p-home__stat-number">10年</span>
                    <span class="p-home__stat-label">業界経験</span>
                </div>
                <div class="p-home__stat">
                    <span class="p-home__stat-number">95%</span>
                    <span class="p-home__stat-label">顧客満足度</span>
                </div>
                <div class="p-home__stat">
                    <span class="p-home__stat-number">24/7</span>
                    <span class="p-home__stat-label">サポート体制</span>
                </div>
            </div>
        </div>
    </section>

    <!-- お問い合わせセクション -->
    <section id="contact" class="p-home__section p-home__contact">
        <div class="container">
            <div class="p-home__section-title">
                <h2>お問い合わせ</h2>
                <p>ご質問やご相談がございましたら、お気軽にお問い合わせください</p>
            </div>
            
            <div class="p-home__contact-content">
                <p>
                    専門スタッフがお客様のご要望をお伺いし、
                    最適なソリューションをご提案いたします。
                </p>
                <a href="<?php echo home_url('/contact'); ?>" class="c-btn c-btn--ghost c-btn--xl">
                    お問い合わせフォーム
                </a>
            </div>
        </div>
    </section>

</main>

<!-- フッター -->
<footer class="l-footer">
    <div class="l-footer__container">
        <div class="l-footer__main">
            <div class="l-footer__column l-footer__company">
                <a href="<?php echo home_url(); ?>" class="l-footer__logo">
                    <?php bloginfo('name'); ?>
                </a>
                <p>
                    <?php echo get_bloginfo('description') ?: 'テクノロジーの力でビジネスの可能性を最大化する'; ?>
                </p>
                <div class="l-footer__social">
                    <a href="#" aria-label="Twitter">📱</a>
                    <a href="#" aria-label="Facebook">📘</a>
                    <a href="#" aria-label="LinkedIn">💼</a>
                    <a href="#" aria-label="Instagram">📷</a>
                </div>
            </div>
            
            <div class="l-footer__column">
                <h3>サービス</h3>
                <ul>
                    <li><a href="#">コンサルティング</a></li>
                    <li><a href="#">システム開発</a></li>
                    <li><a href="#">データ分析</a></li>
                    <li><a href="#">サポート</a></li>
                </ul>
            </div>
            
            <div class="l-footer__column">
                <h3>会社情報</h3>
                <ul>
                    <li><a href="<?php echo home_url('/about'); ?>">会社概要</a></li>
                    <li><a href="<?php echo home_url('/news'); ?>">ニュース</a></li>
                    <li><a href="<?php echo home_url('/careers'); ?>">採用情報</a></li>
                    <li><a href="<?php echo home_url('/contact'); ?>">お問い合わせ</a></li>
                </ul>
            </div>
            
            <div class="l-footer__column">
                <h3>サポート</h3>
                <ul>
                    <li><a href="<?php echo home_url('/faq'); ?>">よくある質問</a></li>
                    <li><a href="<?php echo home_url('/support'); ?>">サポート</a></li>
                    <li><a href="<?php echo home_url('/privacy'); ?>">プライバシーポリシー</a></li>
                    <li><a href="<?php echo home_url('/terms'); ?>">利用規約</a></li>
                </ul>
            </div>
        </div>
        
        <div class="l-footer__bottom">
            <div class="l-footer__copyright">
                &copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.
            </div>
            <div class="l-footer__bottom-links">
                <a href="<?php echo home_url('/privacy'); ?>">プライバシーポリシー</a>
                <a href="<?php echo home_url('/terms'); ?>">利用規約</a>
                <a href="<?php echo home_url('/sitemap'); ?>">サイトマップ</a>
            </div>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>