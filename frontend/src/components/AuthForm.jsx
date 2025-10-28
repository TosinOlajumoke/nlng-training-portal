import React, { useState } from 'react';
export default function AuthForm({ type, onSubmit }){
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const handle = e => setForm({...form, [e.target.name]: e.target.value});
  return (
    <div className="card mx-auto" style={{maxWidth:420, marginTop:60}}>
      <div className="card-body">
        <h3 className="card-title text-center">{type==='login' ? 'Login' : 'Sign up'}</h3>
        <form onSubmit={e=>{e.preventDefault(); onSubmit(form);}}>
          {type==='signup' && (<div className="mb-3"><label className="form-label">Name</label><input name="name" value={form.name} onChange={handle} className="form-control" required/></div>)}
          <div className="mb-3"><label className="form-label">Email</label><input name="email" value={form.email} onChange={handle} type="email" className="form-control" required/></div>
          <div className="mb-3"><label className="form-label">Password</label><input name="password" value={form.password} onChange={handle} type="password" className="form-control" required/></div>
          <button className="btn btn-primary w-100" type="submit">{type==='login'?'Login':'Create account'}</button>
        </form>
      </div>
    </div>
  );
}
