# n8n Video Generation Workflow Integration Guide

This document explains how to update the n8n `IMAGES_TO_VIDEO_GENERATION` workflow to work with the new async job pattern.

## Overview

The video generation process has been updated to use an asynchronous job pattern (similar to campaign image generation) to prevent timeout issues. Instead of waiting for the video generation to complete, the API now:

1. Creates a job record in the database
2. Returns a `jobId` immediately to the frontend
3. The frontend polls for job completion
4. n8n updates the database directly when the video is ready

## Changes Required in n8n Workflow

### 1. Update Webhook Trigger

**Previous Setup:**
- Method: `GET`
- Parameters passed via query string

**New Setup:**
- Method: `POST`
- Parameters passed in request body as JSON

### 2. New Request Body Structure

The webhook will now receive the following JSON payload:

```json
{
  "jobId": "uuid-string",
  "userId": "uuid-string",
  "businessId": "uuid-string",
  "productId": "uuid-string-or-empty",
  "prompt": "video generation prompt text",
  "images": ["url1", "url2", "url3"]
}
```

**Key Fields:**
- `jobId` (NEW): UUID of the job record in `campaign_generation_jobs` table
- `userId`: User ID from Supabase auth
- `businessId`: Business ID from `businesses` table
- `productId`: Product ID from `business_products` table (may be empty for manual uploads)
- `prompt`: The video generation prompt/concept
- `images`: Array of image URLs (1-5 images)

### 3. Extract jobId from Request

At the beginning of your workflow, extract the `jobId` from the request body:

```javascript
// In your "Extract Data" node or equivalent
const jobId = $json.jobId;
const userId = $json.userId;
const businessId = $json.businessId;
const productId = $json.productId;
const prompt = $json.prompt;
const images = $json.images;

return {
  jobId,
  userId,
  businessId,
  productId,
  prompt,
  images
};
```

### 4. Update Supabase on Completion

**CRITICAL:** When the video generation completes successfully, update the job record in Supabase:

#### Add a Supabase Node at the END of your workflow (success path)

**Node Type:** Supabase
**Operation:** Update
**Table:** `campaign_generation_jobs`

**Match Condition:**
- Column: `id`
- Operator: `equals`
- Value: `{{ $('Extract Data').item.json.jobId }}`

**Update Fields:**
```json
{
  "status": "completed",
  "result_video_url": "{{ $('Video Generation').item.json.videoUrl }}",
  "updated_at": "{{ $now.toISO() }}"
}
```

**Important Notes:**
- Replace `'Video Generation'` with the actual name of your video generation node
- Replace `videoUrl` with the actual field name that contains the video URL in your response
- The `result_video_url` should be the final, accessible URL of the generated video

### 5. Update Supabase on Failure

**Add an Error Workflow or Error Handler:**

If the video generation fails, you MUST update the job status to failed:

**Node Type:** Supabase
**Operation:** Update
**Table:** `campaign_generation_jobs`

**Match Condition:**
- Column: `id`
- Operator: `equals`
- Value: `{{ $('Extract Data').item.json.jobId }}`

**Update Fields:**
```json
{
  "status": "failed",
  "error_message": "{{ $json.error || 'Video generation failed' }}",
  "updated_at": "{{ $now.toISO() }}"
}
```

### 6. Supabase Connection Configuration

**IMPORTANT:** Use the Supabase **Service Role Key** (not the anon key) for database updates.

**Credentials:**
- Host: Your Supabase project URL (from `NEXT_PUBLIC_SUPABASE_URL`)
- Service Role Key: From `SUPABASE_SERVICE_KEY` environment variable

This is required because:
- Row Level Security (RLS) is enabled on the `campaign_generation_jobs` table
- Only the service role can update job records
- The service role policy allows all operations

### 7. Remove Response to Webhook

**CRITICAL:** Do NOT return a response to the webhook caller (the Next.js API route).

The Next.js API route uses `fetch(...).catch(...)` to call the webhook asynchronously and does NOT wait for a response. Your workflow should:

1. Process the video generation
2. Update the database directly
3. End the workflow without sending a response back

If you need to keep the webhook connection open, return a simple 200 OK immediately at the start, then continue processing asynchronously.

## Updated Database Schema

The `campaign_generation_jobs` table now includes:

### New Columns:
- `job_type` (TEXT): Either `'campaign_images'` or `'product_video'`
- `result_video_url` (TEXT): URL of the generated video (for video jobs)

### Existing Columns (still used):
- `id` (UUID): Primary key
- `user_id` (UUID): User ID
- `business_id` (UUID): Business ID
- `product_id` (UUID): Product ID
- `status` (TEXT): `'processing'`, `'completed'`, or `'failed'`
- `request_data` (JSONB): Original request data
- `result_images` (TEXT[]): Array of image URLs (for campaign image jobs)
- `error_message` (TEXT): Error message if failed
- `created_at` (TIMESTAMP): Job creation time
- `updated_at` (TIMESTAMP): Last update time

## Example n8n Workflow Structure

```
1. Webhook Trigger (POST)
   ↓
2. Extract Data from Request Body
   - Extract: jobId, userId, businessId, productId, prompt, images
   ↓
3. Video Generation Processing
   - Your existing video generation logic
   - May involve multiple nodes (AI, video APIs, etc.)
   ↓
4. [SUCCESS PATH] Update Supabase - Mark Completed
   - Table: campaign_generation_jobs
   - Update: status='completed', result_video_url='...', updated_at=NOW()
   - Where: id=jobId
   ↓
5. End

[ERROR PATH]
   ↓
4. [ERROR PATH] Update Supabase - Mark Failed
   - Table: campaign_generation_jobs
   - Update: status='failed', error_message='...', updated_at=NOW()
   - Where: id=jobId
   ↓
5. End
```

## Testing the Integration

### 1. Test the Webhook Format

Send a test POST request to your n8n webhook:

```bash
curl -X POST https://your-n8n-instance/webhook/IMAGES_TO_VIDEO_GENERATION \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test-job-id-123",
    "userId": "test-user-id",
    "businessId": "test-business-id",
    "productId": "test-product-id",
    "prompt": "A professional product showcase video",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }'
```

### 2. Verify Database Updates

After running the workflow, check the `campaign_generation_jobs` table:

```sql
SELECT id, job_type, status, result_video_url, error_message, updated_at
FROM campaign_generation_jobs
WHERE id = 'test-job-id-123';
```

Expected result for successful generation:
- `status`: `'completed'`
- `result_video_url`: The video URL
- `error_message`: NULL
- `updated_at`: Recent timestamp

### 3. Test Error Handling

Force an error in your workflow and verify:
- `status`: `'failed'`
- `result_video_url`: NULL
- `error_message`: Error description
- `updated_at`: Recent timestamp

## Troubleshooting

### Issue: "Row Level Security policy violation"

**Solution:** Ensure you're using the Supabase Service Role Key, not the anon key.

### Issue: Job status stays "processing" forever

**Possible Causes:**
1. n8n workflow crashed before updating database
2. Supabase update node is not executing
3. Wrong `jobId` being used in the update

**Debug Steps:**
1. Check n8n execution logs
2. Verify Supabase node is in the workflow path
3. Add logging nodes to track `jobId` throughout the workflow

### Issue: Video URL is null even though status is completed

**Possible Causes:**
1. Wrong field name in the Supabase update
2. Video generation node returns data in different format

**Debug Steps:**
1. Log the output of your video generation node
2. Verify the field path: `{{ $('NodeName').item.json.fieldName }}`
3. Ensure the URL is a valid, accessible string

## Migration Checklist

- [ ] Update webhook trigger from GET to POST
- [ ] Extract `jobId` from request body
- [ ] Add Supabase update node for successful completion
- [ ] Add Supabase update node for error handling
- [ ] Configure Supabase with Service Role Key
- [ ] Update field mappings for video URL
- [ ] Test with sample payload
- [ ] Verify database updates work correctly
- [ ] Test error scenarios
- [ ] Deploy to production

## Support

If you encounter issues:
1. Check n8n execution logs for errors
2. Verify Supabase credentials and permissions
3. Check the Next.js server logs for API route errors
4. Review the browser console for frontend polling errors

## Additional Notes

- The frontend polls every 5 seconds for up to 10 minutes
- Video generation should ideally complete within 5 minutes
- If generation takes longer than 10 minutes, the frontend will timeout
- Users can navigate away and come back - the job will continue processing
- All generated videos should be publicly accessible URLs (signed URLs or public storage)
