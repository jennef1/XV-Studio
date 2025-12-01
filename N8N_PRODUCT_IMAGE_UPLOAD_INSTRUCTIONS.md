# n8n Workflow Update Instructions: Product Image Upload to Supabase

## Overview
Update your "Product Data" n8n workflow to upload scraped product images to Supabase storage instead of storing external URLs.

## New API Endpoint
Your Next.js app now has a new endpoint: `/api/storage/upload-from-url`

**Endpoint:** `https://yourdomain.com/api/storage/upload-from-url` (or `http://localhost:3000/api/storage/upload-from-url` for local development)

**Method:** POST

**Request Body:**
```json
{
  "imageUrl": "https://example.com/product-image.jpg",
  "folder": "product-images"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/business-images/product-images/1234567890-abc123.jpg",
  "path": "product-images/1234567890-abc123.jpg"
}
```

---

## Workflow Changes Required

### Current Flow (BEFORE)
1. Webhook receives `product_url`, `user_id`, `business_id`
2. Scrape product page
3. Extract product data (name, description, images, etc.)
4. Write to `business_products` table with **external image URLs**

### New Flow (AFTER)
1. Webhook receives `product_url`, `user_id`, `business_id`
2. Scrape product page
3. Extract product data (name, description, images, etc.)
4. **FOR EACH scraped image URL:**
   - Call `/api/storage/upload-from-url` endpoint
   - Pass the external image URL
   - Receive back Supabase storage URL
   - Replace external URL with Supabase URL
5. Write to `business_products` table with **Supabase image URLs**

---

## Step-by-Step Implementation

### Step 1: Add Upload API URL Variable
Add a new input parameter or set a variable at the beginning of your workflow:

**Variable Name:** `upload_api_url`
**Value:**
- Development: `http://localhost:3000/api/storage/upload-from-url`
- Production: `https://your-production-domain.com/api/storage/upload-from-url`

### Step 2: After Scraping Images
After your node that scrapes/extracts product images, you should have an array of image URLs.

Example scraped data:
```json
{
  "product_name": "Example Product",
  "product_description": "...",
  "image_urls": [
    "https://cdn.shopify.com/image1.jpg",
    "https://cdn.shopify.com/image2.jpg",
    "https://cdn.shopify.com/image3.jpg"
  ]
}
```

### Step 3: Add Loop Node
Add a **Loop Over Items** or **Split In Batches** node to process each image URL individually.

**Input:** `{{ $json.image_urls }}`

### Step 4: Add HTTP Request Node (Inside Loop)
Add an **HTTP Request** node inside the loop:

**Configuration:**
- **Method:** POST
- **URL:** `{{ $node["Set_Upload_URL"].json["upload_api_url"] }}` (adjust node name as needed)
- **Body Content Type:** JSON
- **Body:**
```json
{
  "imageUrl": "{{ $json.image_url }}",
  "folder": "product-images"
}
```

**Response:**
The node will return:
```json
{
  "success": true,
  "url": "https://...supabase.co/.../product-images/xxx.jpg",
  "path": "product-images/xxx.jpg"
}
```

### Step 5: Collect Uploaded URLs
After the loop completes, you should have an array of Supabase URLs.

Add an **Aggregate** or **Function** node to collect all the `url` values from the HTTP responses:

**Example Expression:**
```javascript
// Collect all uploaded image URLs into an array
{{ $items.map(item => item.json.url) }}
```

This should produce:
```json
[
  "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/business-images/product-images/1234-abc.jpg",
  "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/business-images/product-images/5678-def.jpg"
]
```

### Step 6: Update Database Write Node
Update your node that writes to the `business_products` table:

**Change the `product_images` field from:**
```javascript
{{ $json.image_urls }}  // External URLs
```

**To:**
```javascript
{{ $json.supabase_image_urls }}  // Supabase URLs from Step 5
```

---

## Example Workflow Structure

```
1. Webhook Trigger
   ↓
2. Set Upload API URL (Set Node)
   - upload_api_url = "http://localhost:3000/api/storage/upload-from-url"
   ↓
3. HTTP Request - Scrape Product Page
   ↓
4. Extract Product Data (HTML Extract / Function Node)
   - Extract: product_name, description, image_urls[], etc.
   ↓
5. Split In Batches (Loop over image_urls)
   - Batch Size: 1
   ↓
6. HTTP Request - Upload Image to Supabase
   - POST {{ $node["Set Upload API URL"].json["upload_api_url"] }}
   - Body: { imageUrl: {{ $json }}, folder: "product-images" }
   ↓
7. Aggregate (Collect all uploaded URLs)
   - Expression: {{ $items.map(item => item.json.url) }}
   ↓
8. Set Node - Prepare Final Data
   - Combine product data with supabase_image_urls
   ↓
9. Supabase Node - Insert into business_products table
   - product_name: {{ $json.product_name }}
   - product_description: {{ $json.product_description }}
   - product_images: {{ $json.supabase_image_urls }}  ← Use Supabase URLs
   - key_features: {{ $json.key_features }}
   - etc.
```

---

## Error Handling

### Add Error Handling to HTTP Request Node
Configure the HTTP Request node (Step 6) with error handling:

**On Error:**
- Continue workflow
- Log the failed image URL
- Optionally: Keep original external URL as fallback

**Example Error Handler:**
```javascript
// If upload fails, fall back to external URL
{{ $json.url || $json.original_external_url }}
```

---

## Testing

### Test with Local Development
1. Start your Next.js dev server: `npm run dev`
2. Update n8n workflow with `upload_api_url = "http://localhost:3000/api/storage/upload-from-url"`
3. Trigger the workflow with a test product URL
4. Verify:
   - Images are uploaded to Supabase storage
   - `business_products.product_images` contains Supabase URLs
   - Images display correctly in ProductsView

### Verify Supabase Storage
1. Go to Supabase Dashboard → Storage → `business-images` bucket
2. Check the `product-images/` folder
3. Verify uploaded images are there

---

## Troubleshooting

### "Failed to download image" Error
- Check if the source website blocks automated downloads
- Add appropriate User-Agent header (already included in API)
- Some sites may require authentication or have anti-scraping measures

### "Invalid image type" Error
- API only accepts: jpeg, jpg, png, gif, webp
- If product uses other formats (svg, bmp), you'll need to add them to `ALLOWED_TYPES` in the API

### "File too large" Error
- Maximum file size is 10MB
- For larger images, either:
  - Increase `MAX_FILE_SIZE` in `/app/api/storage/upload-from-url/route.ts`
  - Implement image compression in the API
  - Skip very large images

### Images Not Displaying
- Check browser console for CORS errors
- Verify Supabase storage bucket is public
- Check that Next.js Image domain whitelist includes your Supabase domain

---

## Production Deployment

When deploying to production:

1. Update `upload_api_url` in n8n workflow to your production domain
2. Ensure environment variables are set correctly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
3. Test the workflow in production
4. Monitor Supabase storage usage

---

## Questions?
If you encounter any issues, check:
- Next.js server logs for API errors
- n8n execution logs for HTTP request failures
- Supabase logs for storage upload errors
