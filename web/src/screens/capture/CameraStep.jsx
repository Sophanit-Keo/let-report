// Step 1: live camera (when the browser allows it) or phone camera / photo picker.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { toSmallJpeg } from '../../utils/image.js';

export function CameraStep({ v }) {
  const t = v.t;
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const shootInput = useRef(null);
  const pickInput = useRef(null);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let off = false;
    const md = navigator.mediaDevices;
    if (!md || !md.getUserMedia || !window.isSecureContext) { setFailed(true); return undefined; }
    md.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(stream => {
        if (off) { stream.getTracks().forEach(tr => tr.stop()); return; }
        streamRef.current = stream;
        const el = videoRef.current;
        if (el) { el.srcObject = stream; const p = el.play(); if (p && p.catch) p.catch(() => {}); }
        setLive(true);
      })
      .catch(() => setFailed(true));
    return () => { off = true; if (streamRef.current) streamRef.current.getTracks().forEach(tr => tr.stop()); };
  }, []);

  const fromFile = e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const url = URL.createObjectURL(f);
    toSmallJpeg(url).then(small => { URL.revokeObjectURL(url); v.onPhoto(small, f.name && f.name.length < 40 ? f.name : null); });
  };

  const shoot = () => {
    const el = videoRef.current;
    if (live && el && el.videoWidth) {
      const k = Math.min(1, 1024 / Math.max(el.videoWidth, el.videoHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(el.videoWidth * k); c.height = Math.round(el.videoHeight * k);
      c.getContext('2d').drawImage(el, 0, 0, c.width, c.height);
      let url = null; try { url = c.toDataURL('image/jpeg', 0.72); } catch (e) { url = null; }
      v.onPhoto(url);
    } else if (shootInput.current) {
      shootInput.current.click();
    }
  };

  const round = { width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 40%,#2A3F5E 0%,#0B1A30 70%)' }} />
      <video ref={videoRef} className="cam-video" playsInline muted autoPlay style={{ opacity: live ? 1 : 0, transition: 'opacity 200ms' }} />
      <input ref={shootInput} type="file" accept="image/*" capture="environment" onChange={fromFile} style={{ display: 'none' }} />
      <input ref={pickInput} type="file" accept="image/*" onChange={fromFile} style={{ display: 'none' }} />

      <div className="cap-top" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <div {...tap(v.nav.home)} aria-label="Close" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={22} color="#fff" />
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{t.pointAt}</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 44px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 300, aspectRatio: '1', maxHeight: '100%' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 36, height: 36, borderLeft: '3px solid #fff', borderTop: '3px solid #fff', borderRadius: '10px 0 0 0' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, width: 36, height: 36, borderRight: '3px solid #fff', borderTop: '3px solid #fff', borderRadius: '0 10px 0 0' }} />
          <div style={{ position: 'absolute', left: 0, bottom: 0, width: 36, height: 36, borderLeft: '3px solid #fff', borderBottom: '3px solid #fff', borderRadius: '0 0 0 10px' }} />
          <div style={{ position: 'absolute', right: 0, bottom: 0, width: 36, height: 36, borderRight: '3px solid #fff', borderBottom: '3px solid #fff', borderRadius: '0 0 10px 0' }} />
          {failed ? <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', color: 'var(--blue-200)', fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>{t.cameraOff}</div> : null}
        </div>
      </div>

      <div className="cap-bottom" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
        <div {...tap(() => pickInput.current && pickInput.current.click())} aria-label={t.gallery} style={round}>
          <Icon name="image" size={22} color="#fff" />
        </div>
        <div {...tap(shoot)} aria-label={t.reportIssue} style={{ width: 78, height: 78, borderRadius: '50%', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 62, height: 62, borderRadius: '50%', background: '#fff' }} />
        </div>
        <div {...tap(v.skipPhoto)} style={{ ...round, color: '#fff', fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{t.skip}</div>
      </div>
    </div>
  );
}
