import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bell } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';

const StatusNotification = () => {
    const { statusNotification, setStatusNotification } = useMockData();

    return (
        <AnimatePresence>
            {statusNotification && (
                <motion.div
                    initial={{ opacity: 0, y: -80, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -80, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    style={{
                        position: 'fixed',
                        top: '90px',
                        left: 0,
                        right: 0,
                        margin: '0 auto',
                        zIndex: 9999,
                        background: 'var(--surface-elevated, #151515)',
                        border: `2px solid ${statusNotification.newColor || 'var(--primary)'}`,
                        borderRadius: '16px',
                        padding: '16px 24px',
                        minWidth: '320px',
                        maxWidth: '480px',
                        boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${statusNotification.newColor}30`,
                        cursor: 'pointer',
                    }}
                    onClick={() => setStatusNotification(null)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <motion.div
                            animate={{ rotate: [0, -15, 15, -15, 0] }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: `${statusNotification.newColor}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <Bell size={18} style={{ color: statusNotification.newColor }} />
                        </motion.div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Status Updated
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                                Booking {statusNotification.bookingNumber}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                        <span style={{
                            padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)'
                        }}>
                            {statusNotification.oldStatus}
                        </span>
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: 2, duration: 0.4, delay: 0.5 }}
                        >
                            <ArrowRight size={16} style={{ color: statusNotification.newColor }} />
                        </motion.div>
                        <span style={{
                            padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                            background: `${statusNotification.newColor}20`, color: statusNotification.newColor
                        }}>
                            {statusNotification.newStatus}
                        </span>
                    </div>

                    {/* Progress bar auto-dismiss */}
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 6, ease: 'linear' }}
                        style={{
                            height: '3px', borderRadius: '2px', marginTop: '12px',
                            background: statusNotification.newColor, opacity: 0.5
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StatusNotification;
