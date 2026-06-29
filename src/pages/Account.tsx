import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { Button } from "../components/ui/button";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { 
  FaUserCircle, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaCog, 
  FaSignOutAlt, 
  FaChevronRight,
  FaCamera,
  FaEdit,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import { toIconComponent } from "../utils/icons";

const UserCircleIcon = toIconComponent(FaUserCircle);
const MapPinIcon = toIconComponent(FaMapMarkerAlt);
const CreditCardIcon = toIconComponent(FaCreditCard);
const SettingsIcon = toIconComponent(FaCog);
const LogOutIcon = toIconComponent(FaSignOutAlt);
const ChevronRightIcon = toIconComponent(FaChevronRight);
const CameraIcon = toIconComponent(FaCamera);
const EditIcon = toIconComponent(FaEdit);
const CheckIcon = toIconComponent(FaCheck);
const TimesIcon = toIconComponent(FaTimes);

const Account: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  // State for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: null as string | null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep form data in sync with currentUser data when it loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        profileImage: (currentUser as any).profileImage || null
      });
    }
  }, [currentUser]);

  const handleSignOut = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary URL for the uploaded image preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profileImage: imageUrl }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      
      if (selectedFile) {
        submitData.append("profileImage", selectedFile);
      }

      // Safely attempt to get the token, checking common property names
      const authState = useAuthStore.getState() as any;
      const token = authState.token || authState.accessToken || authState.access; 
      
      if (!token) {
        console.error("No token found in Zustand store. Current state:", authState);
        alert("Authentication error: No token found. Please log out and log back in.");
        return;
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        method: "PATCH",
        // Note: Do NOT set 'Content-Type' manually. The browser automatically handles it for FormData.
        headers: {
          "Authorization": `Bearer ${token}` 
        },
        body: submitData
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update the auth store so the rest of the app sees the changes immediately
        useAuthStore.setState({ currentUser: updatedUser });
        
      } else {
        console.error("Failed to update profile:", await response.text());
      }

    } catch (error) {
      console.error("Failed to update profile", error);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Revert form data back to original user data
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        profileImage: (currentUser as any).profileImage || null
      });
    }
    setSelectedFile(null);
    setIsEditing(false);
  };

  const menuItems = [
    { icon: MapPinIcon, label: 'Saved Addresses', description: 'Edit your delivery locations', path: '/addresses' },
    { icon: CreditCardIcon, label: 'Payment Methods', description: 'Manage your payment options', path: '/payments' },
    { icon: SettingsIcon, label: 'Account Settings', description: 'Password, notifications, and preferences', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {!currentUser ? (
            <div className="flex flex-col items-center justify-center p-8 bg-card rounded-3xl shadow-sm border border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <UserCircleIcon className="text-4xl text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Not logged in</h2>
              <p className="text-muted-foreground mb-8">Please log in to view your account details.</p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white font-medium h-12 rounded-xl transition-colors"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border flex flex-col sm:flex-row items-center sm:items-start gap-6">
                
                {/* Avatar Section */}
                <div 
                  onClick={handleImageClick}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden ${isEditing ? 'cursor-pointer group' : ''} ${formData.profileImage ? '' : 'bg-purple-100 text-purple-600'}`}
                >
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : formData.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                  
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CameraIcon className="text-white text-xl" />
                    </div>
                  )}
                  
                  {/* Hidden file input for image upload */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>

                {/* User Details Section */}
                <div className="text-center sm:text-left mt-2 sm:mt-0 flex-grow">
                  {isEditing ? (
                    <div className="space-y-3 max-w-sm">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold">
                        {formData.name || 'My Account'}
                      </h1>
                      <p className="text-muted-foreground mt-1 mb-4">{formData.email}</p>
                      <span className="inline-block bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                        Verified Shopper
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons Section */}
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"
                      >
                        <CheckIcon className="text-sm" /> Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-foreground border border-border hover:bg-muted rounded-xl font-medium transition-colors"
                      >
                        <TimesIcon className="text-sm" /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl font-medium transition-colors"
                      >
                        <EditIcon className="text-sm" /> Edit Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="hidden sm:flex items-center justify-center gap-2 px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
                      >
                        <LogOutIcon className="text-lg" />
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 px-2">Account Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => navigate(item.path)}
                        className="bg-card p-5 rounded-2xl shadow-sm border border-border flex items-center gap-5 hover:border-purple-300 hover:shadow-md transition-all text-left group"
                      >
                        <div className="bg-purple-50 text-purple-600 p-3.5 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Icon className="text-xl" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-foreground">{item.label}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        </div>
                        <ChevronRightIcon className="text-lg text-muted-foreground group-hover:text-purple-600 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Logout */}
              <div className="sm:hidden pt-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-full gap-2 px-6 py-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl font-medium transition-colors"
                >
                  <LogOutIcon className="text-lg" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Account;
