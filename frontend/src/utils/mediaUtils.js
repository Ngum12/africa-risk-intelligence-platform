export const getSafeEmbedCode = (embedCode) => {
  if (!embedCode) return '';
  
  // Very simple sanitization to at least ensure iframe attributes meet expectations
  if (embedCode.includes('<iframe') && 
      embedCode.includes('youtube.com/embed/') || 
      embedCode.includes('player.vimeo.com/')) {
    return embedCode;
  }
  
  // Fallback to a simple YouTube embed with a placeholder
  return '<div class="w-full h-full bg-gray-800 flex items-center justify-center">Video Unavailable</div>';
};