-- =====================================================
-- 同步脚本：将 current 表的页面数据同步到 history 表
-- 用于修复之前上传时 Pages 数据未写入 history 的问题
-- =====================================================

-- 查看 current 表中的数据分布
SELECT 'Current 表数据分布' as info;
SELECT 
    data_type,
    COUNT(*) as count,
    COUNT(DISTINCT page) as unique_pages
FROM maidinhk_gsc_current
GROUP BY data_type;

-- 查看 history 表中的数据分布
SELECT 'History 表数据分布' as info;
SELECT 
    data_type,
    COUNT(*) as count,
    COUNT(DISTINCT page) as unique_pages
FROM maidinhk_gsc_history
GROUP BY data_type;

-- 获取 current 表中的页面数据（非 _SUMMARY_）
SELECT 'Current 表中的页面数据样本' as info;
SELECT DISTINCT page
FROM maidinhk_gsc_current
WHERE page != '_SUMMARY_'
LIMIT 5;

-- 将 current 表的页面数据同步到 history 表
-- 使用 INSERT OR IGNORE 避免重复
INSERT INTO maidinhk_gsc_history (
    upload_batch,
    upload_date,
    date,
    page,
    clicks,
    impressions,
    ctr,
    position,
    data_type
)
SELECT 
    '2026-03-22-001-sync',  -- 统一使用这个批次号
    '2026-03-22',           -- 使用这个日期
    c.date,
    c.page,
    c.clicks,
    c.impressions,
    c.ctr,
    c.position,
    COALESCE(c.data_type, 'page')
FROM maidinhk_gsc_current c
WHERE c.page != '_SUMMARY_'
AND NOT EXISTS (
    SELECT 1 
    FROM maidinhk_gsc_history h 
    WHERE h.page = c.page 
    AND h.date = c.date
    AND h.upload_batch = '2026-03-22-001-sync'
);

-- 验证同步结果
SELECT '同步后的 History 表数据分布' as info;
SELECT 
    data_type,
    COUNT(*) as count,
    COUNT(DISTINCT page) as unique_pages
FROM maidinhk_gsc_history
GROUP BY data_type;

-- 查看同步后的页面数据
SELECT '同步后的页面样本' as info;
SELECT DISTINCT page
FROM maidinhk_gsc_history
WHERE page != '_SUMMARY_'
LIMIT 5;
