# API Documentation

## Overview
This project provides three main APIs for image processing, similarity search, and folder management.

## Endpoints

### 1. Color Palette Extraction

**GET** `/api/color-palette?imageUrl={url}`

Extracts dominant colors from an image using Vibrant.js.

**Parameters:**
- `imageUrl` (query string): The URL of the image to analyze

**Example:**
```bash
curl "https://your-domain.com/api/color-palette?imageUrl=https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
```

**Response:**
```json
{
  "palette": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
}
```

### 2. Similar Images Search

**POST** `/api/find-similar`

Finds similar images using CLIP embeddings or fallback to mock data.

**Request Body:**
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
}
```

**Example:**
```bash
curl -X POST "https://your-domain.com/api/find-similar" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}'
```

**Response:**
```json
{
  "similar": [
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e"
  ],
  "total": 6,
  "query": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  "message": "Found 6 similar images",
  "fallback": true
}
```

### 3. Folder Management

**POST** `/api/folders`

Adds or removes images from user folders.

**Request Body:**
```json
{
  "folderId": "folder_123",
  "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  "userId": "user_123",
  "action": "add"
}
```

**Example:**
```bash
curl -X POST "https://your-domain.com/api/folders" \
  -H "Content-Type: application/json" \
  -d '{
    "folderId": "folder_123",
    "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "userId": "user_123",
    "action": "add"
  }'
```

**GET** `/api/folders?userId={userId}`

Retrieves all folders for a user.

**Example:**
```bash
curl "https://your-domain.com/api/folders?userId=user_123"
```

**Response:**
```json
{
  "success": true,
  "folders": [
    {
      "id": "folder_123",
      "name": "My Collection",
      "imageIds": ["img1", "img2"],
      "createdAt": "2025-06-15T03:23:03.000Z"
    }
  ]
}
```

## Environment Variables

### Required
```env
# No environment variables needed for basic functionality
```

### Optional
```env
# CLIP API - will use fallback if unavailable
CLIP_API_URL=https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32

# Hugging Face Token (if using HF Inference API)
HUGGINGFACE_API_KEY=your-token-here
```

## Error Handling

All APIs return structured error responses:

```json
{
  "success": false,
  "error": "Description of the error",
  "message": "User-friendly error message"
}
```

## CORS

All APIs include CORS headers for cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Fallback Behavior

### Color Palette
- Falls back to curated design palettes if Vibrant.js fails
- Always returns valid color array

### Similar Images
- Falls back to mock similar images if CLIP API is unavailable
- Provides consistent user experience even when external services fail

### Folders
- Uses Vercel KV storage with localStorage fallback
- Graceful degradation for offline functionality

## Testing

All endpoints can be tested using curl, Postman, or any HTTP client. The APIs are designed to be robust and handle edge cases gracefully.