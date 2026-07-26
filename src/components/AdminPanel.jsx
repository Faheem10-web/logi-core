import React, { useState, useEffect } from 'react'
import { ImageInputManager } from './ImageInputManager'

export function AdminPanel({ token, onLogout, onDataUpdated, onCloseAdmin }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Section States
  const [heroData, setHeroData] = useState({
    images: ['', '', ''],
    heading: '',
    subtitle: '',
    overlayOpacity: 0.65,
    imageDuration: 7,
  })

  const [aboutData, setAboutData] = useState({
    bannerImage: '',
    aboutImage: '',
    detailImage: '',
    heading: '',
    description: '',
    experience: '',
    countries: '',
    deliveryRate: '',
  })

  const [servicesData, setServicesData] = useState({
    bannerImage: '',
    services: [
      { id: 'cargo_ship', number: '01', title: '', description: '', image: '' },
      { id: 'cargo_truck', number: '02', title: '', description: '', image: '' },
      { id: 'air_freight', number: '03', title: '', description: '', image: '' },
    ],
  })

  const [testimonialsData, setTestimonialsData] = useState({
    testimonials: [
      { id: 1, name: '', position: '', photo: '', headline: '', review: '' },
      { id: 2, name: '', position: '', photo: '', headline: '', review: '' },
      { id: 3, name: '', position: '', photo: '', headline: '', review: '' },
    ],
  })

  const [contactData, setContactData] = useState({
    bannerImage: '',
    phone: '',
    email: '',
    address: '',
    googleMapLink: '',
    workingHours: '',
  })

  const [settingsData, setSettingsData] = useState({
    logo: '',
    favicon: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    copyright: '',
  })

  // Toast Helper
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Fetch initial section data
  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [heroRes, aboutRes, servicesRes, testRes, contactRes, settingsRes] = await Promise.all([
        fetch('/api/hero'),
        fetch('/api/about'),
        fetch('/api/services'),
        fetch('/api/testimonials'),
        fetch('/api/contact'),
        fetch('/api/settings'),
      ])

      if (heroRes.ok) setHeroData(await heroRes.json())
      if (aboutRes.ok) setAboutData(await aboutRes.json())
      if (servicesRes.ok) setServicesData(await servicesRes.json())
      if (testRes.ok) setTestimonialsData(await testRes.json())
      if (contactRes.ok) setContactData(await contactRes.json())
      if (settingsRes.ok) setSettingsData(await settingsRes.json())
    } catch (err) {
      console.error(err)
      showToast('error', 'Failed to load JSON data from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Generic Save Handler
  const handleSaveSection = async (sectionName, payload) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/${sectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        if (onDataUpdated) {
          await onDataUpdated()
        }
        showToast('success', `✨ ${sectionName.toUpperCase()} saved successfully! Website updated instantly.`)
      } else {
        showToast('error', data.message || `Failed to save ${sectionName}`)
      }
    } catch (err) {
      console.error(err)
      showToast('error', `Server error saving ${sectionName}`)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'home', label: 'Home (Hero)', icon: '🏠' },
    { id: 'about', label: 'About Us', icon: 'ℹ️' },
    { id: 'services', label: 'Services', icon: '🚚' },
    { id: 'testimonials', label: 'Testimonials', icon: '💬' },
    { id: 'contact', label: 'Contact Details', icon: '📞' },
    { id: 'settings', label: 'General Settings', icon: '⚙️' },
  ]

  return (
    <div className="admin-root-layout" data-lenis-prevent="true">
      {/* Toast Notification Container */}
      {toast && (
        <div className={`admin-toast-float ${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="admin-top-bar">
        <div className="admin-bar-left">
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            ☰
          </button>
          <div className="admin-bar-brand">
            <img src="/logo.png" alt="LogiCore Logo" className="admin-bar-logo" />
            <span className="admin-badge">Admin Panel</span>
          </div>
        </div>

        <div className="admin-bar-right">
          <button className="view-website-btn" onClick={onCloseAdmin}>
            👁️ View Live Website
          </button>
          <button className="admin-logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <div className="admin-body-wrapper">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-show' : ''}`}>
          <nav className="admin-nav-menu">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMobileSidebarOpen(false)
                }}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content View */}
        <main className="admin-main-content">
          {loading && (
            <div className="admin-loading-bar">
              <span className="spinner-icon" /> Updating JSON files...
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <h2>📊 Welcome to LogiCore Dashboard</h2>
                <p>Manage your logistics website images, copy, and settings in real time.</p>
              </div>

              <div className="admin-dashboard-cards-grid">
                <div className="dash-card">
                  <div className="dash-card-icon">🏠</div>
                  <h3>Hero Section</h3>
                  <p>3 Background Images, Overlay Opacity, Auto-slider Timing</p>
                  <button className="dash-action-btn" onClick={() => setActiveTab('home')}>Edit Home Hero →</button>
                </div>

                <div className="dash-card">
                  <div className="dash-card-icon">🚚</div>
                  <h3>Services Section</h3>
                  <p>Ocean Freight, Road Transport, and Air Cargo content</p>
                  <button className="dash-action-btn" onClick={() => setActiveTab('services')}>Edit Services →</button>
                </div>

                <div className="dash-card">
                  <div className="dash-card-icon">💬</div>
                  <h3>Testimonials</h3>
                  <p>Customer reviews, avatars, positions & ratings</p>
                  <button className="dash-action-btn" onClick={() => setActiveTab('testimonials')}>Edit Reviews →</button>
                </div>

                <div className="dash-card">
                  <div className="dash-card-icon">⚙️</div>
                  <h3>Site Settings</h3>
                  <p>Logo, Favicon, Social Links, and Copyright details</p>
                  <button className="dash-action-btn" onClick={() => setActiveTab('settings')}>Edit Settings →</button>
                </div>
              </div>
            </div>
          )}

          {/* HOME (HERO) TAB */}
          {activeTab === 'home' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <h2>🏠 Hero Section Configuration</h2>
                <p>Upload or paste image URLs for the background cross-fade slider.</p>
              </div>

              <div className="admin-card-section">
                <h3>Hero Background Slider Images</h3>
                
                <ImageInputManager
                  label="Hero Image 1 (Primary)"
                  value={heroData.images?.[0] || ''}
                  onChange={(val) => {
                    const newImgs = [...(heroData.images || ['', '', ''])]
                    newImgs[0] = val
                    setHeroData({ ...heroData, images: newImgs })
                  }}
                  token={token}
                />

                <ImageInputManager
                  label="Hero Image 2"
                  value={heroData.images?.[1] || ''}
                  onChange={(val) => {
                    const newImgs = [...(heroData.images || ['', '', ''])]
                    newImgs[1] = val
                    setHeroData({ ...heroData, images: newImgs })
                  }}
                  token={token}
                />

                <ImageInputManager
                  label="Hero Image 3"
                  value={heroData.images?.[2] || ''}
                  onChange={(val) => {
                    const newImgs = [...(heroData.images || ['', '', ''])]
                    newImgs[2] = val
                    setHeroData({ ...heroData, images: newImgs })
                  }}
                  token={token}
                />
              </div>

              <div className="admin-card-section">
                <h3>Hero Headline & Timing</h3>
                
                <div className="admin-form-group">
                  <label className="admin-input-label">Hero Main Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={heroData.heading || ''}
                    onChange={(e) => setHeroData({ ...heroData, heading: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-input-label">Hero Subtitle Paragraph</label>
                  <textarea
                    className="admin-form-textarea"
                    rows="3"
                    value={heroData.subtitle || ''}
                    onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  />
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-input-label">Image Slider Duration (Seconds)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={heroData.imageDuration || 7}
                      onChange={(e) => setHeroData({ ...heroData, imageDuration: Number(e.target.value) })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Cinematic Overlay Opacity ({heroData.overlayOpacity || 0.65})</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      className="admin-form-range"
                      value={heroData.overlayOpacity || 0.65}
                      onChange={(e) => setHeroData({ ...heroData, overlayOpacity: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-save-footer">
                <button
                  className="admin-primary-save-btn"
                  onClick={() => handleSaveSection('hero', heroData)}
                  disabled={loading}
                >
                  💾 Save Hero Section
                </button>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <h2>ℹ️ About Page & Overview Section</h2>
                <p>Update company overview details, experience stats, and images.</p>
              </div>

              <div className="admin-card-section">
                <h3>Images</h3>
                <ImageInputManager
                  label="About Page Top Banner Image"
                  value={aboutData.bannerImage || ''}
                  onChange={(val) => setAboutData({ ...aboutData, bannerImage: val })}
                  token={token}
                />

                <ImageInputManager
                  label="Company Overview Main Photo"
                  value={aboutData.aboutImage || ''}
                  onChange={(val) => setAboutData({ ...aboutData, aboutImage: val })}
                  token={token}
                />

                <ImageInputManager
                  label="Overview Floating Inset Photo"
                  value={aboutData.detailImage || ''}
                  onChange={(val) => setAboutData({ ...aboutData, detailImage: val })}
                  token={token}
                />
              </div>

              <div className="admin-card-section">
                <h3>Heading & Content</h3>
                <div className="admin-form-group">
                  <label className="admin-input-label">Section Heading</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={aboutData.heading || ''}
                    onChange={(e) => setAboutData({ ...aboutData, heading: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-input-label">Company Description</label>
                  <textarea
                    className="admin-form-textarea"
                    rows="4"
                    value={aboutData.description || ''}
                    onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-grid-3">
                  <div className="admin-form-group">
                    <label className="admin-input-label">Years Experience</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={aboutData.experience || ''}
                      onChange={(e) => setAboutData({ ...aboutData, experience: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Countries Covered</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={aboutData.countries || ''}
                      onChange={(e) => setAboutData({ ...aboutData, countries: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Delivery Success %</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={aboutData.deliveryRate || ''}
                      onChange={(e) => setAboutData({ ...aboutData, deliveryRate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-save-footer">
                <button
                  className="admin-primary-save-btn"
                  onClick={() => handleSaveSection('about', aboutData)}
                  disabled={loading}
                >
                  💾 Save About Section
                </button>
              </div>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <h2>🚚 Logistics Services Configuration</h2>
                <p>Manage the 3 primary logistics offerings and page banner.</p>
              </div>

              <div className="admin-card-section">
                <h3>Services Page Top Banner</h3>
                <ImageInputManager
                  label="Services Banner Image"
                  value={servicesData.bannerImage || ''}
                  onChange={(val) => setServicesData({ ...servicesData, bannerImage: val })}
                  token={token}
                />
              </div>

              {(servicesData.services || []).map((srv, idx) => (
                <div className="admin-card-section" key={srv.id || idx}>
                  <h3>Service {idx + 1}: {srv.title || `Service ${idx + 1}`}</h3>
                  
                  <ImageInputManager
                    label={`Service ${idx + 1} Image`}
                    value={srv.image || ''}
                    onChange={(val) => {
                      const updated = [...servicesData.services]
                      updated[idx] = { ...updated[idx], image: val }
                      setServicesData({ ...servicesData, services: updated })
                    }}
                    token={token}
                  />

                  <div className="admin-form-group">
                    <label className="admin-input-label">Service Title</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={srv.title || ''}
                      onChange={(e) => {
                        const updated = [...servicesData.services]
                        updated[idx] = { ...updated[idx], title: e.target.value }
                        setServicesData({ ...servicesData, services: updated })
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Service Description</label>
                    <textarea
                      className="admin-form-textarea"
                      rows="3"
                      value={srv.description || ''}
                      onChange={(e) => {
                        const updated = [...servicesData.services]
                        updated[idx] = { ...updated[idx], description: e.target.value }
                        setServicesData({ ...servicesData, services: updated })
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="admin-save-footer">
                <button
                  className="admin-primary-save-btn"
                  onClick={() => handleSaveSection('services', servicesData)}
                  disabled={loading}
                >
                  💾 Save Services Section
                </button>
              </div>
            </div>
          )}

          {/* TESTIMONIALS TAB */}
          {activeTab === 'testimonials' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <h2>💬 Customer Testimonials</h2>
                <p>Manage customer reviews, photos, names, and titles.</p>
              </div>

              {(testimonialsData.testimonials || []).map((t, idx) => (
                <div className="admin-card-section" key={t.id || idx}>
                  <h3>Customer {idx + 1}: {t.name || `Customer ${idx + 1}`}</h3>

                  <ImageInputManager
                    label={`Customer ${idx + 1} Avatar Photo`}
                    value={t.photo || ''}
                    onChange={(val) => {
                      const updated = [...testimonialsData.testimonials]
                      updated[idx] = { ...updated[idx], photo: val }
                      setTestimonialsData({ ...testimonialsData, testimonials: updated })
                    }}
                    token={token}
                  />

                  <div className="admin-form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-input-label">Customer Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={t.name || ''}
                        onChange={(e) => {
                          const updated = [...testimonialsData.testimonials]
                          updated[idx] = { ...updated[idx], name: e.target.value }
                          setTestimonialsData({ ...testimonialsData, testimonials: updated })
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-input-label">Position / Company</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={t.position || ''}
                        onChange={(e) => {
                          const updated = [...testimonialsData.testimonials]
                          updated[idx] = { ...updated[idx], position: e.target.value }
                          setTestimonialsData({ ...testimonialsData, testimonials: updated })
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Highlight Headline</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={t.headline || ''}
                      onChange={(e) => {
                        const updated = [...testimonialsData.testimonials]
                        updated[idx] = { ...updated[idx], headline: e.target.value }
                        setTestimonialsData({ ...testimonialsData, testimonials: updated })
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Review Paragraph</label>
                    <textarea
                      className="admin-form-textarea"
                      rows="3"
                      value={t.review || ''}
                      onChange={(e) => {
                        const updated = [...testimonialsData.testimonials]
                        updated[idx] = { ...updated[idx], review: e.target.value }
                        setTestimonialsData({ ...testimonialsData, testimonials: updated })
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="admin-save-footer">
                <button
                  className="admin-primary-save-btn"
                  onClick={() => handleSaveSection('testimonials', testimonialsData)}
                  disabled={loading}
                >
                  💾 Save Testimonials
                </button>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <h2>📞 Contact Details & Banner</h2>
                <p>Update phone number, email address, physical location, and hours.</p>
              </div>

              <div className="admin-card-section">
                <h3>Contact Page Top Banner</h3>
                <ImageInputManager
                  label="Contact Banner Image"
                  value={contactData.bannerImage || ''}
                  onChange={(val) => setContactData({ ...contactData, bannerImage: val })}
                  token={token}
                />
              </div>

              <div className="admin-card-section">
                <h3>Company Contact Info</h3>
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-input-label">Phone Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={contactData.phone || ''}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Email Address</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      value={contactData.email || ''}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-input-label">Physical Office Address</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={contactData.address || ''}
                    onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                  />
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-input-label">Google Map Embed Link</label>
                    <input
                      type="url"
                      className="admin-form-input"
                      value={contactData.googleMapLink || ''}
                      onChange={(e) => setContactData({ ...contactData, googleMapLink: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Working Hours</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={contactData.workingHours || ''}
                      onChange={(e) => setContactData({ ...contactData, workingHours: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-save-footer">
                <button
                  className="admin-primary-save-btn"
                  onClick={() => handleSaveSection('contact', contactData)}
                  disabled={loading}
                >
                  💾 Save Contact Info
                </button>
              </div>
            </div>
          )}

          {/* GENERAL SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <h2>⚙️ General Branding & Social Links</h2>
                <p>Manage logo image, favicon, social handles, and footer copyright.</p>
              </div>

              <div className="admin-card-section">
                <h3>Branding Images</h3>
                <ImageInputManager
                  label="Website Brand Logo (Navbar & Footer)"
                  value={settingsData.logo || ''}
                  onChange={(val) => setSettingsData({ ...settingsData, logo: val })}
                  token={token}
                />

                <ImageInputManager
                  label="Favicon Image"
                  value={settingsData.favicon || ''}
                  onChange={(val) => setSettingsData({ ...settingsData, favicon: val })}
                  token={token}
                />
              </div>

              <div className="admin-card-section">
                <h3>Social Media Links & Copyright</h3>
                <div className="admin-form-grid-3">
                  <div className="admin-form-group">
                    <label className="admin-input-label">Facebook URL</label>
                    <input
                      type="url"
                      className="admin-form-input"
                      value={settingsData.facebook || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, facebook: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">Instagram URL</label>
                    <input
                      type="url"
                      className="admin-form-input"
                      value={settingsData.instagram || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, instagram: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-input-label">LinkedIn URL</label>
                    <input
                      type="url"
                      className="admin-form-input"
                      value={settingsData.linkedin || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, linkedin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-input-label">Footer Copyright Notice</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={settingsData.copyright || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, copyright: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-save-footer">
                <button
                  className="admin-primary-save-btn"
                  onClick={() => handleSaveSection('settings', settingsData)}
                  disabled={loading}
                >
                  💾 Save General Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
