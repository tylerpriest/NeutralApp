import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Palette, Globe } from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  const sections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User size={20} />,
      description: 'Manage your account settings and preferences'
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield size={20} />,
      description: 'Configure security settings and privacy options'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell size={20} />,
      description: 'Control how you receive notifications'
      },
      {
        id: 'appearance',
      title: 'Appearance',
      icon: <Palette size={20} />,
      description: 'Customize the look and feel of the application'
    },
    {
      id: 'language',
      title: 'Language',
      icon: <Globe size={20} />,
      description: 'Set your preferred language and region'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: '0 0 24px 0'
            }}>
              Profile Settings
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Display Name
                </label>
            <input
                  type="text"
                  defaultValue="Guest User"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email Address
          </label>
                <input
                  type="email"
                  defaultValue="guest@neutralapp.com"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: '0 0 24px 0'
            }}>
              Security Settings
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1a1a1a',
                    margin: '0 0 4px 0'
                  }}>
                    Two-Factor Authentication
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Enable
                </button>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1a1a1a',
                    margin: '0 0 4px 0'
                  }}>
                    Change Password
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Update your account password
                  </p>
                </div>
                <button style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Change
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: '0 0 24px 0'
            }}>
              Notification Settings
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1a1a1a',
                    margin: '0 0 4px 0'
                  }}>
                    Email Notifications
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Receive notifications via email
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: notifications ? '#1a1a1a' : '#e5e7eb',
                    borderRadius: '12px',
                    transition: '0.3s'
                  }} />
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: notifications ? 'translateX(20px)' : 'translateX(0)'
                  }} />
        </label>
      </div>
      </div>
    </div>
  );

      case 'appearance':
    return (
          <div style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: '0 0 24px 0'
            }}>
              Appearance Settings
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1a1a1a',
                    margin: '0 0 4px 0'
                  }}>
                    Dark Mode
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Switch between light and dark themes
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: darkMode ? '#1a1a1a' : '#e5e7eb',
                    borderRadius: '12px',
                    transition: '0.3s'
                  }} />
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: darkMode ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </label>
              </div>
            </div>
      </div>
    );

      case 'language':
    return (
          <div style={{ padding: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: '0 0 24px 0'
            }}>
              Language Settings
            </h2>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
      </div>
    );

      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      backgroundColor: '#fafafa'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: '24px 0'
      }}>
        <div style={{
          padding: '0 24px 24px 24px',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <h1 className="text-4xl font-bold text-black mb-2">
            Settings
          </h1>
          <p className="text-lg text-gray-500">
            Manage your account preferences
          </p>
        </div>

        <nav>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                backgroundColor: activeSection === section.id ? '#f3f4f6' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                color: activeSection === section.id ? '#1a1a1a' : '#6b7280'
              }}>
                {section.icon}
              </div>
                <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activeSection === section.id ? '#1a1a1a' : '#374151',
                  marginBottom: '2px'
                }}>
                  {section.title}
                  </div>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  {section.description}
                </div>
        </div>
            </button>
          ))}
        </nav>
          </div>

      {/* Content */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff'
      }}>
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default SettingsPage; 