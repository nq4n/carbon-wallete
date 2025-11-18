import React, { useState } from 'react';
import { Send, Loader2, Mail, User, Youtube, Instagram } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        if (!formData.name || !formData.email || !formData.message) {
            setError('يرجى ملء جميع الحقول');
            setIsSubmitting(false);
            return;
        }

        try {
            const { error: insertError } = await supabase.from('contact_submissions').insert([
                { name: formData.name, email: formData.email, message: formData.message },
            ]);

            if (insertError) {
                throw insertError;
            }

            setSuccess(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setError('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
            console.error('Form submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <section style={{ padding: '60px 16px', background: '#f8fafc' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 16px 40px rgba(2,6,23,.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1e293b' }}>تواصل معنا</h2>
                    <p style={{ color: '#64748b', fontSize: 16, marginTop: 8 }}>
                        هل لديك سؤال أو اقتراح؟ نسعد بتواصلك معنا.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>الاسم</label>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                            <input
                                type="text" id="name" name="name"
                                value={formData.name} onChange={handleChange}
                                placeholder="اسمك الكامل"
                                style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>البريد الإلكتروني</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', right: 12, top: 12, width: 16, height: 16, color: '#94a3b8' }} />
                            <input
                                type="email" id="email" name="email"
                                value={formData.email} onChange={handleChange}
                                placeholder="example@squ.edu.om"
                                style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>رسالتك</label>
                        <textarea
                            id="message" name="message"
                            value={formData.message} onChange={handleChange}
                            placeholder="اكتب رسالتك هنا..."
                            rows={5}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    {error && <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{error}</p>}
                    {success && <p style={{ color: '#16a34a', fontSize: 14, margin: 0 }}>تم إرسال رسالتك بنجاح!</p>}

                    <button type="submit" disabled={isSubmitting}
                        style={{
                            width: '100%', padding: '12px 24px', borderRadius: 10, border: 'none',
                            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#10b981 0%, #059669 100%)',
                            color: '#fff', fontWeight: 700, fontSize: 15, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}>
                        {isSubmitting ? (
                            <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> جاري الإرسال...</>
                        ) : (
                            <><Send style={{ width: 16, height: 16 }} /> إرسال</>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#334155', marginBottom: 16 }}>تابعنا على</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                        <a href="https://youtube.com/channel/UCyX9YZA7ZkBOCKYWW00OOlg?si=xUjRvIF8d1QOfe3Q" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Youtube style={{ width: 24, height: 24, color: '#ff0000' }} />
                            <span style={{ fontWeight: 600 }}>يوتيوب</span>
                        </a>
                        <a href="https://www.instagram.com/green_pulse25?igsh=eW56NTdnYmE5MG5n" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Instagram style={{ width: 24, height: 24, color: '#e1306c' }} />
                            <span style={{ fontWeight: 600 }}>انستغرام</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
