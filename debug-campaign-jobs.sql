-- Check the most recent campaign generation jobs
SELECT
  id,
  status,
  result_images,
  array_length(result_images, 1) as image_count,
  error_message,
  created_at,
  updated_at
FROM campaign_generation_jobs
ORDER BY created_at DESC
LIMIT 5;

-- Check if any jobs are stuck in processing
SELECT
  id,
  status,
  created_at,
  updated_at,
  extract(epoch from (now() - updated_at))/60 as minutes_since_update
FROM campaign_generation_jobs
WHERE status = 'processing'
ORDER BY created_at DESC;
