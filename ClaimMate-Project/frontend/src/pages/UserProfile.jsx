import React, { useState, useEffect } from 'react';

/**
 * UserProfile - หน้าข้อมูลผู้ใช้ (View Only) แบบ Minimal
 * 
 * แสดงข้อมูลเฉพาะที่จำเป็น:
 * - ชื่อ, นามสกุล, อีเมล
 * - รหัสพนักงาน (Insurance only)
 * - ตำแหน่งงาน (Insurance only)
 * - สถานะบัญชี
 */
const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const stored = localStorage.getItem("claimmate_user");
      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);



      setUser({ ...parsed});
      setLoading(false);
    }, 500);
  }, []);

  // Get role-specific title
  const getRoleTitle = () => {
    switch(user?.role) {
      case 'insurance':
        return 'บริษัทประกันภัย';
      case 'customer':
        return 'ลูกค้า';
      case 'garage':
        return 'อู่ซ่อม';
      default:
        return 'ผู้ใช้';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-icons-round animate-spin text-6xl text-primary-500 mb-4">refresh</span>
          <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-icons-round text-6xl text-neutral-300 mb-4">person_off</span>
          <p className="text-neutral-500">ไม่พบข้อมูลผู้ใช้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-2">ข้อมูลผู้ใช้</h1>
          <p className="text-neutral-500">ข้อมูลส่วนตัวและรายละเอียดบัญชี</p>
        </div>

        {/* Profile Card */}
        <div className="card">
          {/* Avatar & Name Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-neutral-200">
            <div className="w-24 h-24 bg-gradient-secondary rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user?.firstName} ${user?.lastName}`} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <span>{user?.firstName?.charAt(0) || 'U'}</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-neutral-dark mb-2">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-neutral-500 mb-3">{user?.position || getRoleTitle()}</p>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary">
                <span className="material-icons-round text-xs">
                  {user.role === 'insurance' ? 'badge' : user.role === 'customer' ? 'person' : 'build'}
                </span>
                {getRoleTitle()}
              </span>
              <span className="badge badge-success">
                <span className="material-icons-round text-xs">check_circle</span>
                ใช้งานได้
              </span>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-6">
            {/* ชื่อ */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <span className="material-icons-round text-primary-500 text-lg">person</span>
                ชื่อ
              </label>
              <div className="input-field bg-neutral-50 cursor-not-allowed">
                {user?.firstName || '-'}
              </div>
            </div>

            {/* นามสกุล */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <span className="material-icons-round text-primary-500 text-lg">person</span>
                นามสกุล
              </label>
              <div className="input-field bg-neutral-50 cursor-not-allowed">
                {user?.lastName || '-'}
              </div>
            </div>

            {/* อีเมล */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <span className="material-icons-round text-primary-500 text-lg">email</span>
                อีเมล
              </label>
              <div className="input-field bg-neutral-50 cursor-not-allowed">
                {user?.email || '-'}
              </div>
            </div>
            
            {/* Customer Only Fields */}
            {user.role === 'customer' && (
              <>
                {/* เลขบัตรประชาชน */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <span className="material-icons-round text-primary-500 text-lg">person</span>
                    เลขบัตรประชาชน
                  </label>
                  <div className="input-field bg-neutral-50 cursor-not-allowed">
                    {user?.citizenID || '-'}
                  </div>
                </div>
              </>
            )}

            {/* เบอร์โทร */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <span className="material-icons-round text-primary-500 text-lg">phone</span>
                เบอร์โทร
              </label>
              <div className="input-field bg-neutral-50 cursor-not-allowed">
                {user?.phoneNumber || '-'}
              </div>
            </div>


            {/* Insurance Only Fields */}
            {user.role === 'insurance' && (
              <>
                {/* รหัสพนักงาน */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <span className="material-icons-round text-primary-500 text-lg">badge</span>
                    รหัสพนักงาน
                  </label>
                  <div className="input-field bg-primary-50 cursor-not-allowed font-semibold text-primary-600">
                    {user?.employeeId || '-'}
                  </div>
                </div>

                {/* ตำแหน่งงาน */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <span className="material-icons-round text-primary-500 text-lg">work</span>
                    ตำแหน่งงาน
                  </label>
                  <div className="input-field bg-neutral-50 cursor-not-allowed">
                    {user?.position || '-'}
                  </div>
                </div>
              </>
            )}

            {/* สถานะบัญชี */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                <span className="material-icons-round text-primary-500 text-lg">verified_user</span>
                สถานะบัญชี
              </label>
              <div className="flex items-center gap-2">
                <span className="badge badge-success px-4 py-2">
                  <span className="material-icons-round text-sm">check_circle</span>
                  <span className="ml-2">ใช้งานได้</span>
                </span>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="mt-8 p-4 bg-info/10 border border-info/30 rounded-lg flex items-start gap-3">
            <span className="material-icons-round text-info">info</span>
            <div className="flex-1">
              <p className="text-sm text-neutral-700 font-medium mb-1">
                ข้อมูลแสดงผลอย่างเดียว
              </p>
              <p className="text-sm text-neutral-600">
                {user.role === 'insurance' 
                  ? 'หากต้องการแก้ไขข้อมูล กรุณาติดต่อฝ่ายทรัพยากรบุคคล'
                  : user.role === 'customer'
                  ? 'หากต้องการแก้ไขข้อมูล กรุณาติดต่อบริษัทประกันภัย'
                  : 'หากต้องการแก้ไขข้อมูล กรุณาติดต่อบริษัทประกันภัย'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;