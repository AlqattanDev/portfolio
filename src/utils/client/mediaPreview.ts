/**
 * Media Preview Client Module
 * Handles video previews and image gallery interactions with proper cleanup
 */

interface MediaPreviewManager {
  initializeVideoPreview: (element: HTMLElement) => () => void;
  initializeImageGallery: (element: HTMLElement) => () => void;
  handleVideoHover: (element: HTMLElement) => Promise<void>;
  handleVideoLeave: (element: HTMLElement) => void;
  handleImageClick: (element: HTMLElement, index: number) => void;
}

const MediaPreviewManager: MediaPreviewManager = {
  initializeVideoPreview: (element: HTMLElement) => {
    const videoUrl = element.dataset['videoUrl'];
    if (!videoUrl) return () => {};

    let videoElement: HTMLVideoElement | null = null;
    let isLoaded = false;

    const handleMouseEnter = async () => {
      if (isLoaded || !videoUrl) return;

      element.classList.add('loading');

      try {
        await MediaPreviewManager.handleVideoHover(element);
        isLoaded = true;
      } catch (error) {
        console.error('Video preview error:', error);
        element.classList.add('error');
      } finally {
        element.classList.remove('loading');
      }
    };

    const handleMouseLeave = () => {
      if (isLoaded) {
        MediaPreviewManager.handleVideoLeave(element);
        isLoaded = false;
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Return cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (videoElement) {
        videoElement.remove();
        videoElement = null;
      }
    };
  },

  handleVideoHover: async (element: HTMLElement) => {
    const videoUrl = element.dataset['videoUrl'];
    if (!videoUrl) return;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';

      video.addEventListener('loadeddata', () => {
        element.innerHTML = '';
        element.appendChild(video);
        resolve();
      });

      video.addEventListener('error', (error) => {
        reject(new Error(`Failed to load video: ${error}`));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Video loading timeout'));
      }, 5000);
    });
  },

  handleVideoLeave: (element: HTMLElement) => {
    const video = element.querySelector('video');
    if (video) {
      video.pause();
    }

    element.innerHTML = `
      <div class="video-placeholder">
        <div class="play-icon">▶</div>
        <span class="play-text">Hover to preview</span>
      </div>
    `;
  },

  initializeImageGallery: (element: HTMLElement) => {
    const galleryItems = element.querySelectorAll<HTMLElement>('.gallery-item');

    const cleanupFunctions: (() => void)[] = [];

    galleryItems.forEach((item, index) => {
      const handleClick = () => {
        MediaPreviewManager.handleImageClick(item, index);
      };

      item.addEventListener('click', handleClick);

      cleanupFunctions.push(() => {
        item.removeEventListener('click', handleClick);
      });
    });

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  },

  handleImageClick: (element: HTMLElement, index: number) => {
    const img = element.querySelector('img');
    const fullSrc = img?.dataset['fullSrc'] || img?.src;

    if (!fullSrc) return;

    // TODO: Implement image modal/lightbox
    console.log(`Opening image ${index + 1}:`, fullSrc);

    // For now, open in new tab
    window.open(fullSrc, '_blank');
  },
};

/**
 * Initialize media previews for a given root element
 * @param root - The root element to search for media preview elements
 * @returns Cleanup function
 */
export function initMediaPreviews(
  root: Document | Element = document
): () => void {
  const cleanupFunctions: (() => void)[] = [];

  // Initialize video previews
  const videoPreviews = root.querySelectorAll<HTMLElement>(
    '.video-preview[data-video-url]'
  );
  videoPreviews.forEach((preview) => {
    const cleanup = MediaPreviewManager.initializeVideoPreview(preview);
    cleanupFunctions.push(cleanup);
  });

  // Initialize image galleries
  const imageGalleries = root.querySelectorAll<HTMLElement>('.image-gallery');
  imageGalleries.forEach((gallery) => {
    const cleanup = MediaPreviewManager.initializeImageGallery(gallery);
    cleanupFunctions.push(cleanup);
  });

  // Return combined cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

// Export for potential external use
export { MediaPreviewManager };
