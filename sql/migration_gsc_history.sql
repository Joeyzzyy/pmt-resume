-- =====================================================
-- GSC 历史数据表迁移脚本
-- 创建 gsc_history 表用于 SEO 追踪模块
-- 同时优化 gsc_current 表（原 gsc_pages）结构
-- =====================================================

-- =====================================================
-- 1. 创建 GSC 历史数据表
-- 用于保存每次上传的完整数据快照，支持 SEO 效果追踪
-- =====================================================
CREATE TABLE IF NOT EXISTS maidinhk_gsc_history (
    id SERIAL PRIMARY KEY,
    
    -- 上传批次标识（核心字段）
    -- 格式: YYYY-MM-DD-NNN，如 2026-04-03-001
    upload_batch TEXT NOT NULL,
    
    -- 上传日期（用于快速筛选批次）
    upload_date DATE NOT NULL,
    
    -- GSC 原始数据字段
    date DATE NOT NULL,              -- GSC 数据日期
    page TEXT NOT NULL,              -- 页面 URL 或 query:xxx
    clicks INTEGER DEFAULT 0,        -- 点击数
    impressions INTEGER DEFAULT 0,   -- 展示数
    ctr FLOAT DEFAULT 0,             -- 点击率
    position FLOAT DEFAULT 0,        -- 平均排名
    
    -- 元数据
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 数据类型标记：'page' | 'query' | 'summary'
    data_type TEXT DEFAULT 'page'
);

-- =====================================================
-- 2. 创建索引（优化查询性能）
-- =====================================================

-- 按批次查询（最常用）
CREATE INDEX IF NOT EXISTS idx_history_batch 
    ON maidinhk_gsc_history(upload_batch);

-- 按上传日期查询（用于获取最近批次列表）
CREATE INDEX IF NOT EXISTS idx_history_upload_date 
    ON maidinhk_gsc_history(upload_date DESC);

-- 按页面查询（SEO 追踪中对比特定页面）
CREATE INDEX IF NOT EXISTS idx_history_page 
    ON maidinhk_gsc_history(page);

-- 按 GSC 数据日期查询（Performance 模块时间筛选）
CREATE INDEX IF NOT EXISTS idx_history_date 
    ON maidinhk_gsc_history(date DESC);

-- 复合索引：批次 + 页面（用于对比查询）
CREATE INDEX IF NOT EXISTS idx_history_batch_page 
    ON maidinhk_gsc_history(upload_batch, page);

-- =====================================================
-- 3. 重命名现有表（gsc_pages → gsc_current）
-- =====================================================

-- 如果存在旧表，重命名为 current
ALTER TABLE IF EXISTS maidinhk_gsc_pages 
    RENAME TO maidinhk_gsc_current;

-- 如果不存在，创建新表
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
    
    -- 唯一约束：同一日期同一页面只保留一条
    UNIQUE(date, page)
);

-- 为 current 表创建索引
CREATE INDEX IF NOT EXISTS idx_current_date 
    ON maidinhk_gsc_current(date DESC);

CREATE INDEX IF NOT EXISTS idx_current_page 
    ON maidinhk_gsc_current(page);

-- =====================================================
-- 4. 创建查询统计表（用于快速获取批次列表）
-- =====================================================
CREATE TABLE IF NOT EXISTS maidinhk_gsc_upload_log (
    id SERIAL PRIMARY KEY,
    upload_batch TEXT UNIQUE NOT NULL,
    upload_date DATE NOT NULL,
    record_count INTEGER DEFAULT 0,
    date_range_from DATE,
    date_range_to DATE,
    notes TEXT,                      -- 用户备注，如"优化了首页TDK"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_log_date 
    ON maidinhk_gsc_upload_log(upload_date DESC);

-- =====================================================
-- 5. 创建视图：方便查询各批次的统计摘要
-- =====================================================
CREATE OR REPLACE VIEW v_gsc_batch_summary AS
SELECT 
    upload_batch,
    upload_date,
    COUNT(*) as total_records,
    COUNT(DISTINCT page) as unique_pages,
    MIN(date) as data_date_from,
    MAX(date) as data_date_to,
    SUM(clicks) as total_clicks,
    SUM(impressions) as total_impressions,
    AVG(position) as avg_position
FROM maidinhk_gsc_history
GROUP BY upload_batch, upload_date
ORDER BY upload_date DESC;

-- =====================================================
-- 6. 创建函数：获取最近两个批次的对比数据
-- =====================================================
CREATE OR REPLACE FUNCTION get_batch_comparison(
    p_page TEXT,
    p_batch1 TEXT,
    p_batch2 TEXT
)
RETURNS TABLE (
    page TEXT,
    batch1 TEXT,
    batch2 TEXT,
    clicks_before INTEGER,
    clicks_after INTEGER,
    clicks_change INTEGER,
    position_before FLOAT,
    position_after FLOAT,
    position_change FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH batch1_data AS (
        SELECT page, clicks, position
        FROM maidinhk_gsc_history
        WHERE upload_batch = p_batch1 AND page = p_page
    ),
    batch2_data AS (
        SELECT page, clicks, position
        FROM maidinhk_gsc_history
        WHERE upload_batch = p_batch2 AND page = p_page
    )
    SELECT 
        p_page,
        p_batch1,
        p_batch2,
        COALESCE(b1.clicks, 0),
        COALESCE(b2.clicks, 0),
        COALESCE(b2.clicks, 0) - COALESCE(b1.clicks, 0),
        COALESCE(b1.position, 0),
        COALESCE(b2.position, 0),
        COALESCE(b2.position, 0) - COALESCE(b1.position, 0)
    FROM batch1_data b1
    FULL OUTER JOIN batch2_data b2 ON b1.page = b2.page;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. 插入示例数据（可选，用于测试）
-- =====================================================
-- 注意：使用前请确认是否需要在测试环境插入示例数据

/*
INSERT INTO maidinhk_gsc_upload_log (upload_batch, upload_date, record_count, notes)
VALUES 
    ('2026-03-15-001', '2026-03-15', 1000, '初始数据导入'),
    ('2026-03-22-001', '2026-03-22', 1000, '优化了首页标题');
*/

-- =====================================================
-- 8. 验证脚本
-- =====================================================
-- 查看创建的结构
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('maidinhk_gsc_history', 'maidinhk_gsc_current', 'maidinhk_gsc_upload_log')
ORDER BY table_name, ordinal_position;

-- 查看索引
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE tablename IN ('maidinhk_gsc_history', 'maidinhk_gsc_current', 'maidinhk_gsc_upload_log')
ORDER BY tablename, indexname;

-- 成功提示
SELECT 'Migration completed successfully!' as status;
