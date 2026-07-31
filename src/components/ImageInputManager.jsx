import React, { useState } from 'react'

export function ImageInputManager({ label, value, onChange, token, onTokenExpired }) {
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState('url') // 'url' or 'file'
  const [previewError, setPreviewError] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file!')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        const cacheBustedUrl = `${data.url}?v=${Date.now()}`
        onChange(cacheBustedUrl)
        setPreviewError(false)
      } else {
        if (res.status === 401 || res.status === 403 || data.message?.toLowerCase().includes('token')) {
          alert('⚠️ Session expired or invalid token. Please log in again.')
          if (onTokenExpired) onTokenExpired()
        } else {
          alert(data.message || 'Image upload failed!')
        }
      }
    } catch (err) {
      console.error(err)
      alert('Error uploading image file.')
    } finally {
      setUploading(false)
    }
  }

  // Cache bust preview URL
  const previewSrc = value ? (value.includes('?v=') || value.includes('&v=') ? value : `${value}${value.includes('?') ? '&' : '?'}v=${Date.now()}`) : ''

  return (
    <div className="admin-image-input-group">
      <div className="admin-input-header">
        <label className="admin-input-label">{label}</label>
        <div className="admin-toggle-mode-btn">
          <button
            type="button"
            className={`mode-btn ${mode === 'url' ? 'active' : ''}`}
            onClick={() => setMode('url')}
          >
            Paste URL
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'file' ? 'active' : ''}`}
            onClick={() => setMode('file')}
          >
            Upload File
          </button>
        </div>
      </div>

      <div className="admin-image-input-controls">
        {mode === 'url' ? (
          <input
            type="url"
            className="admin-form-input"
            placeholder="Paste image URL (e.g. Unsplash, Pinterest, Cloudinary)"
            value={value || ''}
            onChange={(e) => {
              const freshUrl = e.target.value
              onChange(freshUrl)
              setPreviewError(false)
            }}
          />
        ) : (
          <div className="file-upload-wrapper">
            <input
              type="file"
              accept="image/*"
              className="admin-file-input"
              id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label
              htmlFor={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className="file-upload-button-label"
            >
              {uploading ? (
                <>
                  <span className="spinner-icon mini" /> Uploading...
                </>
              ) : (
                '📁 Choose Image File'
              )}
            </label>
          </div>
        )}
      </div>

      {value && (
        <div className="admin-image-preview-container">
          {!previewError ? (
            <img
              key={previewSrc}
              src={previewSrc}
              alt="Preview"
              className="admin-image-thumb"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="admin-image-fallback">
              <span>Invalid Image URL or Image Unavailable</span>
            </div>
          )}
          <div className="preview-url-text">{value}</div>
        </div>
      )}
    </div>
  )
}
