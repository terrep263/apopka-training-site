'use client';

import { useState } from 'react';

export default function ShowPassword({ targetId = 'password' }) {
  const [shown, setShown] = useState(false);

  function toggle(e) {
    const checked = e.target.checked;
    setShown(checked);
    const el = document.getElementById(targetId);
    if (el) el.type = checked ? 'text' : 'password';
  }

  return (
    <div className="showpw">
      <input type="checkbox" id="showpw" checked={shown} onChange={toggle} />
      <label htmlFor="showpw">Show password</label>
    </div>
  );
}
