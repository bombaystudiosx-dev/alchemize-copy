import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const originalSize = file.size;
    const mimeType = file.type;

    // Upload original file first
    const uploadResult = await base44.integrations.Core.UploadFile({ file });
    const originalUrl = uploadResult.file_url;

    // For now, use the original as both thumb and display
    // In production, you'd use sharp or similar for server-side processing
    // This is a simplified implementation that works with Base44's infrastructure
    const imageRecord = await base44.entities.UploadedImage.create({
      source_filename: filename,
      source_mime: mimeType,
      source_size_bytes: originalSize,
      processed_mime: mimeType,
      processed_size_bytes: originalSize,
      thumb_url: originalUrl,
      display_url: originalUrl,
      width: 0,
      height: 0
    });

    return Response.json({
      success: true,
      image: imageRecord,
      display_url: originalUrl,
      thumb_url: originalUrl
    });

  } catch (error) {
    console.error('Image processing error:', error);
    return Response.json({ 
      error: 'Image processing failed', 
      details: error.message 
    }, { status: 500 });
  }
});