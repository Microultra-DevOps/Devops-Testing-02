/* const UserActivity = require("../models/UserActivity");
const User = require("../models/User");
const axios = require('axios');

// Enhanced device detection
const detectDeviceInfo = (userAgent) => {
  let deviceType = 'desktop';
  let deviceBrand = 'Unknown';
  let deviceName = 'Unknown';
  
  // Check for mobile devices first
  if (/mobile/i.test(userAgent)) {
    deviceType = 'mobile';
    
    // Detect common mobile brands
    if (/iphone/i.test(userAgent)) {
      deviceBrand = 'Apple';
      const iPhoneMatch = userAgent.match(/iPhone\s*(?:OS\s*)?(\d+[_,]\d+)/i);
      deviceName = iPhoneMatch ? `iPhone ${iPhoneMatch[1].replace('_', '.')}` : 'iPhone';
    } else if (/ipad/i.test(userAgent)) {
      deviceType = 'tablet';
      deviceBrand = 'Apple';
      deviceName = 'iPad';
    } else if (/android/i.test(userAgent)) {
      deviceBrand = 'Android';
      
      // Extract Android device brands
      if (/samsung/i.test(userAgent)) {
        deviceBrand = 'Samsung';
        const samsungMatch = userAgent.match(/SM-[A-Z0-9]+/i);
        deviceName = samsungMatch ? samsungMatch[0] : 'Galaxy Device';
      } else if (/pixel/i.test(userAgent)) {
        deviceBrand = 'Google';
        const pixelMatch = userAgent.match(/Pixel\s*(\d+)/i);
        deviceName = pixelMatch ? `Pixel ${pixelMatch[1]}` : 'Pixel';
      } else if (/oneplus/i.test(userAgent)) {
        deviceBrand = 'OnePlus';
      } else if (/xiaomi/i.test(userAgent)) {
        deviceBrand = 'Xiaomi';
      } else if (/huawei/i.test(userAgent)) {
        deviceBrand = 'Huawei';
      } else {
        const modelMatch = userAgent.match(/Android\s*[\d\.]+;\s*([^;)]+)/i);
        deviceName = modelMatch ? modelMatch[1].trim() : 'Android Device';
      }
    }
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceType = 'tablet';
    if (/ipad/i.test(userAgent)) {
      deviceBrand = 'Apple';
      deviceName = 'iPad';
    } else if (/android/i.test(userAgent)) {
      deviceBrand = 'Android';
      deviceName = 'Android Tablet';

      if (/samsung/i.test(userAgent)) {
        deviceBrand = 'Samsung';
        deviceName = 'Galaxy Tab';
      }
    }
  } else {
    deviceType = 'desktop';
    
    if (/macintosh|mac os x/i.test(userAgent)) {
      deviceBrand = 'Apple';
      deviceName = 'Mac';
      
      if (/mac os x 10[._](\d+)/i.test(userAgent)) {
        const versionMatch = userAgent.match(/mac os x 10[._](\d+)/i);
        if (versionMatch) {
          deviceName = `Mac (macOS ${versionMatch[1]})`;
        }
      }
    } else if (/windows/i.test(userAgent)) {
      deviceBrand = 'Microsoft';
      
      // Get Windows version
      if (/windows nt 10/i.test(userAgent)) {
        deviceName = 'Windows 10/11';
      } else if (/windows nt 6\.3/i.test(userAgent)) {
        deviceName = 'Windows 8.1';
      } else if (/windows nt 6\.2/i.test(userAgent)) {
        deviceName = 'Windows 8';
      } else if (/windows nt 6\.1/i.test(userAgent)) {
        deviceName = 'Windows 7';
      } else {
        deviceName = 'Windows';
      }
    } else if (/linux/i.test(userAgent)) {
      deviceBrand = 'Linux';
      deviceName = 'Linux PC';
    } else {
      deviceBrand = 'Unknown';
      deviceName = 'Desktop';
    }
  }
  
  return { deviceType, deviceBrand, deviceName };
};

// Enhanced browser detection with version
const detectBrowser = (userAgent) => {
  let browser = 'Unknown';
  let version = '';
  
  if (/edge|edg/i.test(userAgent)) {
    browser = 'Edge';
    const match = userAgent.match(/Edge?\/(\d+\.\d+)/i);
    version = match ? match[1] : '';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/i);
    version = match ? match[1] : '';
  } else if (/chrome/i.test(userAgent)) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/i);
    version = match ? match[1] : '';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/i);
    version = match ? match[1] : '';
  } else if (/MSIE|Trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
    const match = userAgent.match(/(?:MSIE |rv:)(\d+\.\d+)/i);
    version = match ? match[1] : '';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
    const match = userAgent.match(/(?:Opera|OPR)\/(\d+\.\d+)/i);
    version = match ? match[1] : '';
  }
  
  return version ? `${browser} ${version}` : browser;
};

// Track user login with enhanced device info
const trackLogin = async (userId, req, status = "Success") => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const { deviceType, deviceBrand, deviceName } = detectDeviceInfo(userAgent);
    
    // Create new activity record
    const loginActivity = new UserActivity({
      userId,
      activityType: "login",
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceType,
      deviceName: `${deviceBrand} ${deviceName}`,
      browser: detectBrowser(userAgent),
      location: "Unknown", // Would need IP geolocation service in production
      status,
      isCurrent: status === "Success",
      additionalInfo: {
        fullUserAgent: userAgent,
        deviceBrand
      }
    });

    await loginActivity.save();
    return loginActivity;
  } catch (error) {
    console.error("Error tracking login:", error);
    return null;
  }
};

// Track password change with enhanced device info
const trackPasswordChange = async (userId, req, method = "direct") => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const { deviceType, deviceBrand, deviceName } = detectDeviceInfo(userAgent);
    
    const passwordActivity = new UserActivity({
      userId,
      activityType: "password_change",
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceType,
      deviceName: `${deviceBrand} ${deviceName}`,
      browser: detectBrowser(userAgent),
      location: "Unknown", 
      method,
      additionalInfo: {
        fullUserAgent: userAgent,
        deviceBrand
      }
    });

    await passwordActivity.save();
    return passwordActivity;
  } catch (error) {
    console.error("Error tracking password change:", error);
    return null;
  }
};

// Get login history for current user
const getLoginHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const loginHistory = await UserActivity.find({
      userId: req.user.id,
      activityType: "login"
    })
    .sort({ timestamp: -1 })
    .limit(20); 
    
    res.json(loginHistory);
  } catch (error) {
    console.error("Error fetching login history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get active login devices for current user
const getLoginDevices = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Get successful logins marked as current
    const loginDevices = await UserActivity.find({
      userId: req.user.id,
      activityType: "login",
      status: "Success",
      isCurrent: true
    })
    .sort({ timestamp: -1 });
    
    // Mark the current device
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { deviceType, deviceBrand, deviceName } = detectDeviceInfo(userAgent);
    const currentDeviceInfo = `${deviceBrand} ${deviceName}`;
    
    const devicesWithCurrentFlag = loginDevices.map(device => {
      const deviceData = device.toObject();
      deviceData.isCurrent = 
        device.ipAddress === ipAddress && 
        device.browser === detectBrowser(userAgent);
      deviceData.lastActive = device.timestamp;
      return deviceData;
    });
    
    res.json(devicesWithCurrentFlag);
  } catch (error) {
    console.error("Error fetching login devices:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get password change history for current user
const getPasswordHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const passwordHistory = await UserActivity.find({
      userId: req.user.id,
      activityType: "password_change"
    })
    .sort({ timestamp: -1 })
    .limit(10); // Limit to last 10 password changes
    
    res.json(passwordHistory);
  } catch (error) {
    console.error("Error fetching password history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Revoke access for a specific device
const revokeDeviceAccess = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const { deviceId } = req.params;
    
    // Find the device to make sure it belongs to the user
    const device = await UserActivity.findOne({
      _id: deviceId,
      userId: req.user.id,
      activityType: "login",
      isCurrent: true
    });
    
    if (!device) {
      return res.status(404).json({ message: "Device not found or already revoked" });
    }
    
    device.isCurrent = false;
    await device.save();
    
    res.json({ message: "Device access revoked successfully" });
  } catch (error) {
    console.error("Error revoking device access:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  trackLogin,
  trackPasswordChange,
  getLoginHistory,
  getLoginDevices,
  getPasswordHistory,
  revokeDeviceAccess
}; */