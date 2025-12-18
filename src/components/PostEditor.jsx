import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../pages/Toast';
import '../css/PostEditor.css';

const PostEditor = ({ post, onSave, onCancel, mode = 'create' }) => {
  const { auth } = useContext(AuthContext);
  const [title, setTitle] = useState(post?.title?.rendered || post?.title || '');
  const [content, setContent] = useState(post?.content?.rendered || post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt?.rendered || post?.excerpt || '');
  const [status, setStatus] = useState(post?.status || 'draft');
  const [featuredMedia, setFeaturedMedia] = useState(post?.featured_media || null);
  
  // Gallery state
  const [imageGallery, setImageGallery] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageCaption, setImageCaption] = useState('');
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const contentRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const formRef = useRef(null);

  // Extract gallery images from existing content when editing
  useEffect(() => {
    if (mode === 'edit' && post?.content) {
      const extractedGallery = extractGalleryFromContent(post.content);
      if (extractedGallery.length > 0) {
        setImageGallery(extractedGallery);
        console.log('Extracted gallery:', extractedGallery); // Debug log
      }
    }
  }, [mode, post]);

  // Improved gallery extraction from HTML content
  const extractGalleryFromContent = (htmlContent) => {
    if (!htmlContent) return [];

    try {
      // Clean up WordPress content
      const cleanContent = htmlContent
        .replace(/<!--.*?-->/g, '') // Remove comments
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ''); // Remove styles

      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanContent, 'text/html');
      
      const galleryItems = [];
      
      // Method 1: Look for image-gallery divs
      const galleryDivs = doc.querySelectorAll('.image-gallery');
      
      galleryDivs.forEach(galleryDiv => {
        const galleryItemDivs = galleryDiv.querySelectorAll('.gallery-item');
        
        galleryItemDivs.forEach(itemDiv => {
          const img = itemDiv.querySelector('img');
          const caption = itemDiv.querySelector('.image-caption');
          
          if (img && img.src) {
            galleryItems.push({
              id: `existing-${Date.now()}-${Math.random()}`,
              url: img.src,
              caption: caption ? caption.textContent.trim() : '',
              fromExisting: true,
              element: 'div' // Mark as from gallery div
            });
          }
        });
      });

      // Method 2: If no gallery divs found, look for img tags with captions
      if (galleryItems.length === 0) {
        const allImages = doc.querySelectorAll('img');
        
        allImages.forEach((img, index) => {
          if (img.src) {
            // Try to find caption - look for next sibling paragraph
            let caption = '';
            let nextSibling = img.nextElementSibling;
            
            // Look for caption in next <p> tag
            while (nextSibling && nextSibling.tagName === 'P') {
              const text = nextSibling.textContent.trim();
              if (text) {
                caption = text;
                break;
              }
              nextSibling = nextSibling.nextElementSibling;
            }
            
            galleryItems.push({
              id: `existing-img-${index}-${Date.now()}`,
              url: img.src,
              caption: caption,
              fromExisting: true,
              element: 'img' // Mark as standalone img
            });
          }
        });
      }

      console.log(`Extracted ${galleryItems.length} gallery items`); // Debug log
      return galleryItems;

    } catch (err) {
      console.error('Error extracting gallery:', err);
      return [];
    }
  };

  // Upload image to WordPress
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    const res = await fetch(`${import.meta.env.VITE_WP_API_URL}/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return await res.json();
  };

  // Handle featured image upload
  const handleFeaturedImageUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file || !auth?.token) return;

    setUploadedFile(file);
    setUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      const media = await uploadImage(file);
      setFeaturedMedia(media.id);
      setSuccess(`✓ Featured image uploaded! ID: ${media.id}`);
    } catch (err) {
      setError(`Featured image upload failed: ${err.message}`);
      setUploadedFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle gallery file selection
  const handleGalleryFileSelect = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload selected gallery image
  const handleUploadGalleryImage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedFile || !auth?.token) {
      setError('Please select an image file first');
      return;
    }

    setUploadingGalleryImage(true);
    setError('');

    try {
      const media = await uploadImage(selectedFile);
      
      // Add to gallery with caption
      const newGalleryItem = {
        id: media.id,
        url: media.source_url,
        caption: imageCaption,
        source_url: media.source_url,
        fromExisting: false // Mark as newly uploaded
      };
      
      setImageGallery(prev => [...prev, newGalleryItem]);
      setSuccess(`✓ Gallery image uploaded! Added to gallery.`);
      
      // Clear form
      setSelectedFile(null);
      setImageCaption('');
      
      // Reset file input
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
      
    } catch (err) {
      setError(`Gallery image upload failed: ${err.message}`);
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  // Remove image from gallery
  const removeGalleryImage = (index) => {
    const updatedGallery = [...imageGallery];
    updatedGallery.splice(index, 1);
    setImageGallery(updatedGallery);
  };

  // Insert gallery into content
  const insertGalleryIntoContent = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (imageGallery.length === 0) {
      setError('No images in gallery to insert');
      return;
    }

    let galleryHtml = '<div class="image-gallery">\n';
    
    imageGallery.forEach((item) => {
      galleryHtml += `  <div class="gallery-item">\n`;
      galleryHtml += `    <img src="${item.url}" alt="Gallery image" />\n`;
      if (item.caption) {
        galleryHtml += `    <p class="image-caption">${item.caption}</p>\n`;
      }
      galleryHtml += `  </div>\n`;
    });
    
    galleryHtml += '</div>\n';

    // Get cursor position
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert gallery HTML at cursor position
      const newContent = content.substring(0, start) + 
                        '\n' + galleryHtml + '\n' + 
                        content.substring(end);
      
      setContent(newContent);
      setSuccess(`✓ Gallery inserted into content! You can now save the post.`);
      
      // Focus back on textarea
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + galleryHtml.length + 2;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }, 10);
    }
  };

  // Clear gallery and content when switching modes
  useEffect(() => {
    if (mode === 'create') {
      setImageGallery([]);
      setContent('');
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth?.token) {
      setError('You must be logged in to save posts');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let mediaId = featuredMedia;
      
      // If there's a file selected but no mediaId yet, upload it now
      if (uploadedFile && !mediaId) {
        setSuccess('Uploading featured image before saving post...');
        const media = await uploadImage(uploadedFile);
        mediaId = media.id;
        setFeaturedMedia(mediaId);
      }

      const postData = {
        title: title,
        content: content,
        excerpt: excerpt,
        status: status,
        featured_media: mediaId || 0
      };

      const url = mode === 'edit' && post?.id 
        ? `${import.meta.env.VITE_WP_API_URL}/wp/v2/posts/${post.id}`
        : `${import.meta.env.VITE_WP_API_URL}/wp/v2/posts`;

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        const savedPost = await res.json();
        const finalMessage = mode === 'edit' ? 'Post updated successfully!' : 'Post created successfully!';
        setSuccess(`${finalMessage} ${mediaId ? '✓ Featured image attached.' : ''}`);
        
        if (onSave) {
          onSave(savedPost);
        } else {
          setTimeout(() => {
            if (mode === 'create') {
              resetForm();
            }
          }, 2000);
        }
        
      } else {
        const errorData = await res.json();
        setError(`Failed to save post: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setTitle('');
    setContent('');
    setExcerpt('');
    setStatus('draft');
    setFeaturedMedia(null);
    setUploadedFile(null);
    setImageGallery([]);
    setImageCaption('');
    setSelectedFile(null);
    
    // Reset file inputs
    const featuredInput = document.getElementById('featured-image');
    if (featuredInput) featuredInput.value = '';
    
    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
    }
  };

  return (
    <div className="post-editor-container">
      {error && <Toast message={error} type="error" />}
      {success && <Toast message={success} type="success" />}
      
      <Card className="post-editor-card">
        <h2 className="editor-title">{mode === 'edit' ? 'Edit Post' : 'Create New Post'}</h2>
        
        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          className="post-editor-form"
        >
          {/* Basic Post Info */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              className="form-input"
              placeholder="Enter post title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={loading}
              className="form-input"
              rows="3"
              placeholder="Brief summary of your post"
            />
          </div>

          {/* Main Content Editor */}
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
              className="form-input content-textarea"
              rows="10"
              placeholder="Write your post content here..."
            />
          </div>

          {/* Image Gallery Section */}
          <div className="gallery-section">
            <h3 className="section-title">Image Gallery</h3>
            <p className="section-description">
              {mode === 'edit' 
                ? `Found ${imageGallery.length} images from existing post` 
                : 'Upload images with captions, then insert them into your content'}
            </p>
            
            <div className="gallery-input-container">
              <div className="gallery-input-form">
                <div className="form-group">
                  <label htmlFor="gallery-image">Upload Image</label>
                  <input
                    type="file"
                    id="gallery-image"
                    ref={galleryFileInputRef}
                    accept="image/*"
                    onChange={handleGalleryFileSelect}
                    disabled={loading || uploadingGalleryImage}
                    className="form-file"
                  />
                  <p className="form-hint">Select an image file (JPEG, PNG, GIF, etc.)</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="image-caption">Image Caption</label>
                  <input
                    type="text"
                    id="image-caption"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    disabled={loading || uploadingGalleryImage}
                    className="form-input"
                    placeholder="Optional: Add a caption"
                  />
                  <p className="form-hint">Optional: Will appear below the image</p>
                </div>
                
                <div className="form-group">
                  <Button
                    type="button"
                    onClick={handleUploadGalleryImage}
                    disabled={!selectedFile || loading || uploadingGalleryImage}
                    variant="secondary"
                    size="medium"
                    className="upload-gallery-btn"
                  >
                    {uploadingGalleryImage ? 'Uploading...' : 'Upload & Add to Gallery'}
                  </Button>
                  <p className="form-hint">
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
                  </p>
                </div>
              </div>
              
              {/* Gallery Preview */}
              <div className="gallery-preview">
                <div className="gallery-header">
                  <h4>Gallery ({imageGallery.length} images)</h4>
                </div>
                
                {imageGallery.length > 0 ? (
                  <>
                    <div className="gallery-items">
                      {imageGallery.map((item, index) => (
                        <div key={item.id || index} className="gallery-item-preview">
                          <div className="image-container">
                            <img 
                              src={item.url} 
                              alt="Gallery image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="remove-image-btn"
                              title="Remove image from gallery"
                              disabled={loading}
                            >
                              ×
                            </button>
                          </div>
                          <div className="image-info">
                            {item.caption ? (
                              <div className="caption-container">
                                <strong>Caption:</strong>
                                <p className="caption">{item.caption}</p>
                              </div>
                            ) : (
                              <div className="no-caption">
                                <p className="no-caption-text">No caption</p>
                              </div>
                            )}
                            {item.fromExisting && (
                              <span className="existing-badge">From existing post</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Insert Gallery Button */}
                    <div className="insert-gallery-action">
                      <Button
                        type="button"
                        onClick={insertGalleryIntoContent}
                        variant="primary"
                        size="medium"
                        disabled={loading}
                        className="insert-gallery-btn"
                      >
                        Insert Gallery into Content
                      </Button>
                      <p className="action-hint">
                        This will insert all gallery images at the cursor position in the content editor
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="empty-gallery">
                    <p>No images added yet</p>
                    <p className="empty-hint">
                      {mode === 'edit' 
                        ? 'No images found in existing content. Upload new images to add to gallery.'
                        : 'Upload images above to add them to your gallery'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Post Settings */}
          <div className="editor-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading || uploadingImage || uploadingGalleryImage}
                className="form-select"
              >
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="featured-image">Featured Image</label>
              <input
                type="file"
                id="featured-image"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                disabled={loading || uploadingImage || uploadingGalleryImage}
                className="form-file"
              />
              
              <div className="upload-status">
                {uploadingImage && (
                  <p className="uploading">⏳ Uploading featured image...</p>
                )}
                {featuredMedia && !uploadingImage && (
                  <p className="success">✓ Featured image ready (ID: {featuredMedia})</p>
                )}
                {!featuredMedia && !uploadingImage && mode === 'create' && (
                  <p className="info">Optional: Select a featured image</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="editor-actions">
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={loading || uploadingImage || uploadingGalleryImage}
            >
              {loading ? 'Saving...' : 
               uploadingImage ? 'Uploading...' : 
               uploadingGalleryImage ? 'Uploading Gallery...' :
               (mode === 'edit' ? 'Update Post' : 'Publish Post')}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || uploadingImage || uploadingGalleryImage}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PostEditor;