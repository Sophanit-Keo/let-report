// Add details form: location, product, lot, quantity, hold + hold check, notes, urgent, support, voice note.
import { Field, Icon, Pill, Toggle, TopBar } from '../../components/index.js';
import { tap } from '../../utils/tap.js';
import { inputStyle, areaStyle } from '../../styles/inline.js';

const grid = n => ({ display: 'grid', gridTemplateColumns: 'repeat(' + n + ',minmax(0,1fr))', gap: 8 });

export function AddDetailsScreen({ v }) {
  const t = v.t, dr = v.draft;
  return (
    <div className="page bare">
      <TopBar onBack={v.nav.detail} icon="x" title={t.addDetails} label={t.clear} />
      <div className="details-form" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 640, margin: '0 auto' }}>
        <Field label={t.where}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{v.locs.map((o, i) => <Pill key={i} o={o} />)}</div>
        </Field>
        <Field label={t.ptype}>
          <div style={grid(3)}>{v.ptypes.map((o, i) => <Pill key={i} o={o} px={8} />)}</div>
        </Field>
        {v.hasPtype ? (
          <Field label={t.pname}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{v.pnames.map((o, i) => <Pill key={i} o={o} />)}</div>
            {v.pnameOther ? <input value={dr.pnameText || ''} onChange={v.onPnameText} placeholder={t.pname} style={inputStyle} /> : null}
          </Field>
        ) : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
          <Field label={t.lot}><input value={dr.lot || ''} onChange={v.onLot} placeholder="U260926-02" autoCapitalize="characters" style={inputStyle} /></Field>
          <Field label={t.qty}><input value={dr.qty || ''} onChange={v.onQty} placeholder="0" inputMode="decimal" style={inputStyle} /></Field>
        </div>
        <div style={{ ...grid(3), marginTop: -10 }}>{v.units.map((o, i) => <Pill key={i} o={o} px={8} />)}</div>
        <Toggle o={v.holdT} icon="circle-pause" title={t.hold} sub={t.holdSub} />
        {dr.hold ? (
          <div style={{ marginTop: -10, background: '#fff', border: '1.5px solid var(--navy-900)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: 14, display: 'flex', flexDirection: 'column', gap: 14, animation: 'lrFade 160ms' }}>
            <Field label={t.hcType}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{v.hcTypes.map((o, i) => <Pill key={i} o={o} h={36} px={12} />)}</div></Field>
            <Field label={t.hcRemind}>
              <div style={{ ...grid(3), gap: 6 }}>{v.hcDaysL.map((o, i) => <Pill key={i} o={o} h={36} px={8} />)}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="bell-ring" size={14} color="var(--gray-500)" />{v.hcDueText}</div>
            </Field>
            <Field label={t.hcWho}><div style={{ ...grid(2), gap: 6 }}>{v.hcOwners.map((o, i) => <Pill key={i} o={o} h={36} px={8} />)}</div></Field>
          </div>
        ) : null}
        <Field label={t.whatSaw}><textarea value={dr.desc || ''} onChange={v.onDesc} placeholder={t.troublePh} rows={3} style={areaStyle} /></Field>
        <Field label={t.whatDid}><textarea value={dr.action || ''} onChange={v.onAction} placeholder={t.actionPh} rows={3} style={areaStyle} /></Field>
        <Field label={t.suggestion}><textarea value={dr.suggestion || ''} onChange={v.onSuggestion} placeholder={t.suggestionPh} rows={3} style={areaStyle} /></Field>
        <Toggle o={v.urgentT} icon="siren" title={t.urgent} sub={t.urgentSub} />
        <Field label={t.support}><div style={grid(3)}>{v.supports.map((o, i) => <Pill key={i} o={o} px={8} />)}</div></Field>
        <Field label={t.voice}>
          <div {...tap(v.toggleVoice)} style={{ height: 56, borderRadius: 14, border: '1.5px solid ' + v.voice.bd, background: v.voice.bg, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: v.voice.btn, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: v.voice.anim, flex: 'none' }}>
              <Icon name={v.voice.icon} size={18} color="#fff" />
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: v.voice.fg }}>{v.voice.label}</div>
          </div>
        </Field>
      </div>
    </div>
  );
}
