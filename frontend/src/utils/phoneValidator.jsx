export const validateSriLankanMobile = (phoneNumber) => {
    // Remove any spaces, dashes or other separators
    const cleanNumber = phoneNumber.replace(/\s+|-|\(|\)/g, '');
    
    // Check for valid Sri Lankan mobile formats
    
    // Format 1: 07XXXXXXXX (10 digits starting with 07)
    const format1 = /^07\d{8}$/;
    
    // Format 2: +947XXXXXXXX (international format with +94)
    const format2 = /^\+947\d{8}$/;
    
    // Format 3: 947XXXXXXXX (international format without +)
    const format3 = /^947\d{8}$/;
    
    // Check if the number matches any valid format
    const isValid = format1.test(cleanNumber) || format2.test(cleanNumber) || format3.test(cleanNumber);
    
    // Additional validation for specific carrier prefixes
    // Common Sri Lankan carrier prefixes after the "7" digit:
    // Dialog: 0, 1, 2, 5, 6, 7, 8
    // Mobitel: 1, 2, 4, 5, 6, 7, 8
    // Airtel/Bharti: 5, 6, 7, 8
    // Hutch: 0, 1, 2, 3, 4, 5, 6, 7, 8
    // Etisalat: 0, 1, 2, 5, 6, 7, 8
    
    // Extract the prefix for validation if it passes the initial format check
    let carrierPrefix = null;
    let provider = null;
    
    if (isValid) {
      if (format1.test(cleanNumber)) {
        carrierPrefix = cleanNumber.substring(2, 3);
      } else {
        carrierPrefix = cleanNumber.substring(3, 4);
      }
      
      // Identify provider based on prefix
      if (['0', '1', '2', '5', '6', '7', '8'].includes(carrierPrefix)) {
        if (carrierPrefix === '0') {
          provider = 'Dialog/Hutch/Etisalat';
        } else if (['1', '2'].includes(carrierPrefix)) {
          provider = 'Dialog/Mobitel/Hutch/Etisalat';
        } else if (carrierPrefix === '4') {
          provider = 'Mobitel/Hutch';
        } else if (['5', '6', '7', '8'].includes(carrierPrefix)) {
          provider = 'Dialog/Mobitel/Airtel/Hutch/Etisalat';
        } else if (carrierPrefix === '3') {
          provider = 'Hutch';
        }
      } else {
        // If prefix doesn't match known carrier prefixes
        return { isValid: false, error: 'Invalid carrier prefix' };
      }
    }
    
    return {
      isValid,
      originalNumber: phoneNumber, 
      cleanNumber, 
      provider,
      error: isValid ? null : 'Invalid Sri Lankan mobile number format'
    };
  };
  
  // Function to format mobile number for display
  export const formatSriLankanMobile = (phoneNumber) => {
    const validation = validateSriLankanMobile(phoneNumber);
    
    if (!validation.isValid) {
      return phoneNumber; // Return original if invalid
    }
    
    // Format as 07X-XXX XXXX for display
    if (validation.cleanNumber.startsWith('07')) {
      const num = validation.cleanNumber;
      return `${num.substring(0, 3)}-${num.substring(3, 6)} ${num.substring(6)}`;
    }
    
    // Format as +94 7X-XXX XXXX for international numbers
    if (validation.cleanNumber.startsWith('+947') || validation.cleanNumber.startsWith('947')) {
      const withPlus = validation.cleanNumber.startsWith('+') ? 
        validation.cleanNumber : 
        '+' + validation.cleanNumber;
      
      return `${withPlus.substring(0, 4)} ${withPlus.substring(4, 6)}-${withPlus.substring(6, 9)} ${withPlus.substring(9)}`;
    }
    
    return phoneNumber; // Fallback
  };