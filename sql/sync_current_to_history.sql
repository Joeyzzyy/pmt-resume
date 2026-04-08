-- =====================================================
-- 同步 current 表数据到 history 表
-- 用于修复之前上传时 Pages 数据未写入 history 表的问题
-- =====================================================

-- 获取 current 表中的所有数据
DO $$
DECLARE
    current_record RECORD;
    batch_id TEXT;
    upload_date_val DATE;
BEGIN
    -- 为 current 表中的数据创建一个统一的批次号
    batch_id := '2026-03-22-001-sync';
    upload_date_val := '2026-03-22';

    -- 插入 current 表的数据到 history 表
    FOR current_record IN 
        SELECT DISTINCT date, page, clicks, impressions, ctr, position, data_type
        FROM maidinhk_gsc_current
        WHERE page != '_SUMMARY_'
        AND NOT EXISTS (
            SELECT 1 FROM maidinhk_gsc_history h 
            WHERE h.page = maidinhk_gsc_current.page 
            AND h.date = maidinhk_gsc_current.date
            AND h.upload_batch LIKE '2026-03-22%'
        )
    LOOP
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
        ) VALUES (
            batch_id,
            upload_date_val,
            current_record.date,
            current_record.page,
            current_record.clicks,
            current_record.impressions,
            current_record.ctr,
            current_record.position,
            COALESCE(current_record.data_type, 'page')
        );
    END LOOP;

    RAISE NOTICE '数据同步完成';
END $$;

-- 验证结果
SELECT 
    'Current 表页面数' as label,
    COUNT(DISTINCT page) as count
FROM maidinhk_gsc_current
WHERE page != '_SUMMARY_'
UNION ALL
SELECT 
    'History 表页面数',
    COUNT(DISTINCT page)
FROM maidinhk_gsc_history
WHERE page != '_SUMMARY_';
