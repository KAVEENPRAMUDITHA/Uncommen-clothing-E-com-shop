import { useEffect, useState } from 'react';
import { Mail, Save, Check } from 'lucide-react';

export default function AdminEmail() {
    const [settings, setSettings] = useState({ smtp_host: '', smtp_port: '587', smtp_user: '', smtp_pass: '', from_email: '', from_name: 'Uncommon Clothing', order_confirmation: 'true', newsletter_enabled: 'true' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const token = () => JSON.parse(localStorage.getItem('uc_session') || '{}').token;

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(d => { if (d && Object.keys(d).length) setSettings(s => ({ ...s, ...d })); }).finally(() => setLoading(false));
    }, []);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(settings) });
        setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
    };

    if (loading) return <div className="text-neutral-400">Loading...</div>;

    return (
        <div>
            <div className="mb-6"><h1 className="text-3xl font-black">Email Configuration</h1><p className="text-neutral-500 text-sm mt-1">Configure SMTP settings for order confirmations and newsletters</p></div>
            <form onSubmit={save} className="bg-white rounded-xl border border-neutral-200 p-6 max-w-2xl space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-100"><Mail size={20} className="text-neutral-400" /><h2 className="font-bold">SMTP Settings</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1.5">SMTP Host</label><input value={settings.smtp_host} onChange={e => setSettings({ ...settings, smtp_host: e.target.value })} placeholder="smtp.gmail.com" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                    <div><label className="block text-sm font-medium mb-1.5">SMTP Port</label><input value={settings.smtp_port} onChange={e => setSettings({ ...settings, smtp_port: e.target.value })} placeholder="587" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                    <div><label className="block text-sm font-medium mb-1.5">Username</label><input value={settings.smtp_user} onChange={e => setSettings({ ...settings, smtp_user: e.target.value })} placeholder="your@email.com" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                    <div><label className="block text-sm font-medium mb-1.5">Password</label><input value={settings.smtp_pass} onChange={e => setSettings({ ...settings, smtp_pass: e.target.value })} type="password" placeholder="••••••••" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                    <div><label className="block text-sm font-medium mb-1.5">From Email</label><input value={settings.from_email} onChange={e => setSettings({ ...settings, from_email: e.target.value })} placeholder="orders@uncommonclothing.lk" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                    <div><label className="block text-sm font-medium mb-1.5">From Name</label><input value={settings.from_name} onChange={e => setSettings({ ...settings, from_name: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                </div>
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                    <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={settings.order_confirmation === 'true'} onChange={e => setSettings({ ...settings, order_confirmation: e.target.checked ? 'true' : 'false' })} className="accent-black w-4 h-4" /> Send order confirmation emails</label>
                    <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={settings.newsletter_enabled === 'true'} onChange={e => setSettings({ ...settings, newsletter_enabled: e.target.checked ? 'true' : 'false' })} className="accent-black w-4 h-4" /> Enable newsletter signup</label>
                </div>
                <button type="submit" disabled={saving} className={`px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${saved ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-neutral-800'}`}>{saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Settings</>}</button>
            </form>
        </div>
    );
}
