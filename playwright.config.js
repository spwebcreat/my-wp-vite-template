import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定ファイル
 * WordPressテーマのE2Eテスト用設定
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './development/themes/mythme/tests',
  
  // 並列実行の設定
  fullyParallel: true,
  
  // CI環境でのfail fast
  forbidOnly: !!process.env.CI,
  
  // リトライ設定
  retries: process.env.CI ? 2 : 0,
  
  // 並列実行数
  workers: process.env.CI ? 1 : undefined,
  
  // レポーター設定
  reporter: [
    ['html'],
    ['line'],
    ['junit', { outputFile: 'test-results/junit-results.xml' }]
  ],
  
  // 全テスト共通設定
  use: {
    // ベースURL（WordPressサイトのURL）
    baseURL: 'http://localhost:5173',
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    
    // 動画録画設定
    video: 'retain-on-failure',
    
    // トレース設定
    trace: 'on-first-retry',
  },

  // テストプロジェクト設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // モバイルテスト
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // ローカル開発サーバー設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});