import React, { useState, useRef } from 'react';
import { detectProductGender } from '../utils/marketplace';
import { generateTryOn } from '../utils/api';

// Accessories/jewelry/eyewear - skip gender mismatch warning for these
const UNISEX_CATEGORIES = [
  'watch', 'watches', 'smartwatch', 'wristwatch',
  'sunglass', 'sunglasses', 'spectacle', 'specs', 'glasses', 'eyeglass', 'eyewear', 'frame', 'aviator', 'wayfarer', 'goggles',
  'necklace', 'chain', 'pendant', 'earring', 'ring', 'bracelet', 'bangle', 'anklet', 'brooch', 'jewellery', 'jewelry', 'choker', 'studs',
  'belt', 'tie', 'scarf', 'stole', 'shawl', 'muffler', 'glove', 'gloves', 'cap', 'hat', 'beanie', 'headband', 'bandana',
  'handbag', 'purse', 'clutch', 'backpack', 'tote', 'crossbody', 'wallet',
  'shoe', 'shoes', 'sneaker', 'sandal', 'boot', 'boots', 'loafer', 'slipper', 'footwear'
];

const isUnisexProduct = (title: string): boolean => {
  const lowerTitle = title.toLowerCase();
  return UNISEX_CATEGORIES.some(keyword => lowerTitle.includes(keyword));
};

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImages: string[];
  productTitle: string;
}

export function TryOnModal({ isOpen, onClose, productImages, productTitle }: TryOnModalProps) {
  const [selectedProductImage, setSelectedProductImage] = useState<string>(productImages[0] || '');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const detectedGender = detectProductGender(productTitle);
  const isUnisex = isUnisexProduct(productTitle);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('📁 Image is too large. Max 10MB.');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!userPhoto || !selectedProductImage || !gender) {
      setError('Please select a product image, upload your photo, and choose gender.');
      return;
    }

    // Gender mismatch warning - skip for unisex products (accessories, jewelry, eyewear, footwear)
    if (detectedGender && detectedGender !== gender && !isUnisex) {
      const proceed = confirm(
        `⚡ Heads up: This appears to be ${detectedGender}'s clothing but you selected ${gender}. Result may not look realistic. Continue anyway?`
      );
      if (!proceed) return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setTryOnResult(null);

    // Animate progress bar while waiting for API
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 1000);

    try {
      const result = await generateTryOn({
        user_photo: userPhoto,
        product_image: selectedProductImage,
        gender: gender as 'male' | 'female',
      });

      if (result.success && result.image) {
        setTryOnResult(result.image);
        setProgress(100);
      } else {
        setError(result.error || '❌ Failed to generate try-on. Please try again.');
      }
    } catch (err) {
      setError('❌ Oops! Something went wrong. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!tryOnResult) return;
    const link = document.createElement('a');
    link.href = tryOnResult;
    link.download = 'tryon-result.png';
    link.click();
  };

  const handleTryAgain = () => {
    setTryOnResult(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="tryon-modal-overlay" onClick={onClose}>
      <div className="tryon-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tryon-modal-close" onClick={onClose}>×</button>
        
        <h2 className="tryon-modal-title">Virtual Try On</h2>
        <p className="tryon-modal-subtitle">{productTitle}</p>

        <div className="tryon-modal-content">
          {/* Three column layout */}
          <div className="tryon-columns">
            {/* User Photo */}
            <div className="tryon-column">
              <h3>Your Photo</h3>
              <div 
                className="tryon-image-box"
                onClick={() => fileInputRef.current?.click()}
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="Your photo" />
                ) : (
                  <div className="tryon-upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Click to upload</span>
                    <span className="tryon-hint">Full body photo, max 10MB</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Product Image */}
            <div className="tryon-column">
              <h3>Outfit</h3>
              <div className="tryon-image-box">
                {selectedProductImage ? (
                  <img src={selectedProductImage} alt="Product" />
                ) : (
                  <div className="tryon-upload-placeholder">No image</div>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="tryon-thumbnails">
                  {productImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Option ${idx + 1}`}
                      className={selectedProductImage === img ? 'selected' : ''}
                      onClick={() => setSelectedProductImage(img)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Result */}
            <div className="tryon-column">
              <h3>Try-On Result</h3>
              <div className="tryon-image-box tryon-result-box">
                {isProcessing ? (
                  <div className="tryon-loading">
                    <div className="tryon-progress-bar">
                      <div className="tryon-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span>Generating... {progress}%</span>
                  </div>
                ) : tryOnResult ? (
                  <img src={tryOnResult} alt="Try-on result" />
                ) : (
                  <div className="tryon-upload-placeholder">
                    <span>Result will appear here</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="tryon-controls">
            <div className="tryon-gender-select">
              <label>Gender:</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="tryon-buttons">
              <button
                className="tryon-btn tryon-btn-primary"
                onClick={handleGenerate}
                disabled={!userPhoto || !selectedProductImage || !gender || isProcessing}
              >
                {isProcessing ? 'Generating...' : 'Generate Try-On'}
              </button>
              
              {tryOnResult && (
                <>
                  <button className="tryon-btn tryon-btn-secondary" onClick={handleDownload}>
                    Download
                  </button>
                  <button className="tryon-btn tryon-btn-secondary" onClick={handleTryAgain}>
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <div className="tryon-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
