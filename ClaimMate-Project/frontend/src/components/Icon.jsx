// src/components/Icon.jsx
import React from 'react';

/**
 * Component สำหรับ Material Icons Round ที่โหลดผ่าน CSS (index.css)
 * ใช้ชื่อ Icon ที่เป็น Friendly Name (เช่น 'Check', 'Location')
 */
const Icon = ({ name, className = 'w-5 h-5', color = 'text-current' }) => {
  // Mapping ชื่อ Icon ที่เราใช้ใน Component กับชื่อ Material Icon จริงๆ (snake_case)
  const iconNameMap = {
    'Check': 'check_circle',        
    'Clock': 'schedule',          
    'Car': 'directions_car',      
    'Download': 'cloud_download', 
    'Warning': 'report_problem',  
    'Location': 'location_on',    
    'User': 'person',             
    'Building': 'apartment',      
    'Chart': 'bar_chart',         
    'List': 'list_alt',           
    'Plus': 'add_circle',         
    'Close': 'cancel',            
    'Report': 'description',      
    'Money': 'currency_exchange', // ใช้ currency_exchange แทน currency_baht
    'Star': 'star',               
    'Dashboard': 'dashboard',     
    'Edit': 'edit',               
    'Send': 'send',               
    'Upload': 'upload_file',      // สำหรับพนักงานอัปโหลดรายงาน
    'Settings': 'settings',       // สำหรับตั้งค่า
    'Receipt': 'receipt'          // ใบอนุมัติซ่อม
  };
  
  const iconText = iconNameMap[name] || name.toLowerCase().replace(/ /g, '_');
  
  return (
    <span 
      className={`material-icons-round ${className} ${color} leading-none`}
      aria-hidden="true"
      title={`Icon: ${name}`}
    >
      {iconText}
    </span>
  );
};

export default Icon;