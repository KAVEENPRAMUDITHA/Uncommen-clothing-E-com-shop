import { useEffect, useState } from 'react';
import { CreditCard, Save, Check } from 'lucide-react';

export default function AdminPayments() {
    const [settings, setSettings] = useState({ payhere_merchant_id: '', payhere_secret: '', payhere_app_id: '', payhere_app_secret: '', hosted_domain: '', payhere_enabled: 'true', payhere_sandbox: 'false', stripe_key: '', stripe_secret: '', stripe_enabled: 'false', cod_enabled: 'true', currency: 'LKR' });
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

    const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
        <button type="button" onClick={() => onChange(!on)} className={`relative w-11 h-6 rounded-full transition ${on ? 'bg-black' : 'bg-neutral-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all ${on ? 'translate-x-5' : ''}`} />
        </button>
    );

    return (
        <div>
            <div className="mb-6"><h1 className="text-3xl font-black">Payment Gateways</h1><p className="text-neutral-500 text-sm mt-1">Configure payment methods for your store</p></div>
            <form onSubmit={save} className="space-y-6 max-w-2xl">
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><CreditCard size={20} className="text-orange-600" /></div>
                            <div>
                                <h2 className="font-bold">PayHere (Sri Lanka)</h2>
                                <p className="text-xs text-neutral-400">Accept Visa, Mastercard, AMEX, Genie, FriMi, eZ Cash</p>
                            </div>
                        </div>
                        <Toggle on={settings.payhere_enabled === 'true'} onChange={v => setSettings({ ...settings, payhere_enabled: v ? 'true' : 'false' })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1.5">Merchant ID</label><input value={settings.payhere_merchant_id} onChange={e => setSettings({ ...settings, payhere_merchant_id: e.target.value })} placeholder="12XXXXX" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">Merchant Secret</label><input value={settings.payhere_secret} onChange={e => setSettings({ ...settings, payhere_secret: e.target.value })} type="password" placeholder="••••••••" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">App ID</label><input value={settings.payhere_app_id || ''} onChange={e => setSettings({ ...settings, payhere_app_id: e.target.value })} placeholder="4OVzEi2..." className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">App Secret</label><input value={settings.payhere_app_secret || ''} onChange={e => setSettings({ ...settings, payhere_app_secret: e.target.value })} type="password" placeholder="••••••••" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                        <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1.5">Authorized Hosted Domain</label><input value={settings.hosted_domain || ''} onChange={e => setSettings({ ...settings, hosted_domain: e.target.value })} placeholder="https://uncommen-clothing.vercel.app" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                    </div>
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-neutral-800">Sandbox (Test Mode)</span>
                            <p className="text-[11px] text-neutral-400">Enable if using a test/sandbox merchant account before going live</p>
                        </div>
                        <Toggle on={settings.payhere_sandbox === 'true'} onChange={v => setSettings({ ...settings, payhere_sandbox: v ? 'true' : 'false' })} />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><CreditCard size={20} className="text-purple-600" /></div>
                            <div><h2 className="font-bold">Stripe</h2><p className="text-xs text-neutral-400">International cards</p></div>
                        </div>
                        <Toggle on={settings.stripe_enabled === 'true'} onChange={v => setSettings({ ...settings, stripe_enabled: v ? 'true' : 'false' })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1.5">Publishable Key</label><input value={settings.stripe_key} onChange={e => setSettings({ ...settings, stripe_key: e.target.value })} placeholder="pk_live_..." className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                        <div><label className="block text-sm font-medium mb-1.5">Secret Key</label><input value={settings.stripe_secret} onChange={e => setSettings({ ...settings, stripe_secret: e.target.value })} type="password" placeholder="sk_live_..." className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><CreditCard size={20} className="text-green-600" /></div>
                            <div><h2 className="font-bold">Cash on Delivery</h2><p className="text-xs text-neutral-400">Pay when you receive</p></div>
                        </div>
                        <Toggle on={settings.cod_enabled === 'true'} onChange={v => setSettings({ ...settings, cod_enabled: v ? 'true' : 'false' })} />
                    </div>
                </div>
                <div><label className="block text-sm font-medium mb-1.5">Currency</label><input value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="w-40 border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" /></div>
                <button type="submit" disabled={saving} className={`px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${saved ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-neutral-800'}`}>{saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Settings</>}</button>
            </form>
        </div>
    );
}
