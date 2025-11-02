import React, { useState } from 'react'; import { useSearchParams, useNavigate } from 'react-router-dom';
export default function Reset(){ const [params] = useSearchParams(); const token = params.get('token'); const email = params.get('email'); const [pw,setPw]=useState(''); const nav = useNavigate();
  const handle=async(e)=>{ e.preventDefault(); const res = await fetch('/api/auth/reset',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ email, token, newPassword: pw })}); if(res.ok){ alert('Password reset'); nav('/login'); } else alert('Reset failed'); };
  return (<div className="container"><h3 className="mt-4">Reset password</h3><form onSubmit={handle}><div className="mb-3"><label>New password</label><input className="form-control" value={pw} onChange={e=>setPw(e.target.value)} required/></div><button className="btn btn-primary">Reset password</button></form></div>);
}
