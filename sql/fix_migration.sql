-- =====================================================
-- 修复迁移脚本
-- 创建缺失的表并迁移旧数据
-- =====================================================

-- =====================================================
-- 1. 创建 current 表（如果不存在）
-- =====================================================
CREATE TABLE IF NOT EXISTS maidinhk_gsc_current (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    page TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr FLOAT DEFAULT 0,
    position FLOAT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_type TEXT DEFAULT 'page',
    UNIQUE(date, page)
);

-- =====================================================
-- 2. 创建 history 表（如果不存在）
-- =====================================================
CREATE TABLE IF NOT EXISTS maidinhk_gsc_history (
    id SERIAL PRIMARY KEY,
    upload_batch TEXT NOT NULL,
    upload_date DATE NOT NULL,
    date DATE NOT NULL,
    page TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr FLOAT DEFAULT 0,
    position FLOAT DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_type TEXT DEFAULT 'page'
);

-- =====================================================
-- 3. 创建 upload_log 表（如果不存在）
-- =====================================================
CREATE TABLE IF NOT EXISTS maidinhk_gsc_upload_log (
    id SERIAL PRIMARY KEY,
    upload_batch TEXT UNIQUE NOT NULL,
    upload_date DATE NOT NULL,
    record_count INTEGER DEFAULT 0,
    date_range_from DATE,
    date_range_to DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. 迁移旧表数据到 current 表
-- =====================================================
-- 先清空 current 表（避免重复）
DELETE FROM maidinhk_gsc_current;

-- 从旧表导入数据
INSERT INTO maidinhk_gsc_current (date, page, clicks, impressions, ctr, position, data_type, updated_at)
SELECT 
    date,
    page,
    COALESCE(clicks, 0),
    COALESCE(impressions, 0),
    COALESCE(ctr, 0),
    COALESCE(position, 0),
    CASE 
        WHEN page = '_SUMMARY_' THEN 'summary'
        WHEN page LIKE 'http%' THEN 'page'
        ELSE 'query'
    END,
    NOW()
FROM maidinhk_gsc_pages
ON CONFLICT (date, page) DO UPDATE SET
    clicks = EXCLUDED.clicks,
    impressions = EXCLUDED.impressions,
    ctr = EXCLUDED.ctr,
    position = EXCLUDED.position,
    updated_at = NOW();

-- =====================================================
-- 5. 创建索引
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_history_batch ON maidinhk_gsc_history(upload_batch);
CREATE INDEX IF NOT EXISTS idx_history_upload_date ON maidinhk_gsc_history(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_history_page ON maidinhk_gsc_history(page);
CREATE INDEX IF NOT EXISTS idx_history_date ON maidinhk_gsc_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_history_batch_page ON maidinhk_gsc_history(upload_batch, page);

CREATE INDEX IF NOT EXISTS idx_current_date ON maidinhk_gsc_current(date DESC);
CREATE INDEX IF NOT EXISTS idx_current_page ON maidinhk_gsc_current(page);

CREATE INDEX IF NOT EXISTS idx_upload_log_date ON maidinhk_gsc_upload_log(upload_date DESC);

-- =====================================================
-- 6. 刷新 Supabase Schema 缓存
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- 7. 验证结果
-- =====================================================
SELECT 
    'maidinhk_gsc_current' as table_name, 
    COUNT(*) as record_count 
FROM maidinhk_gsc_current
UNION ALL
SELECT 
    'maidinhk_gsc_history', 
    COUNT(*) 
FROM maidinhk_gsc_history
UNION ALL
SELECT 
    'maidinhk_gsc_upload_log', 
    COUNT(*) 
FROM maidinhk_gsc_upload_log
UNION ALL
SELECT 
    'maidinhk_gsc_pages (old)', 
    COUNT(*) 
FROM maidinhk_gsc_pages;
