import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import styles from './InvoiceView.module.css';

const InvoiceView = ({ booking, provider, customer, onClose }) => {
    if (!booking) return null;

    const invoiceNumber = booking.booking_number || `INV-${Date.now()}`;
    const invoiceDate = booking.booking_date
        ? new Date(booking.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const serviceName = booking.service_name || booking.services?.[0]?.service_name || 'Vehicle Service';
    const baseAmount = booking.total_amount || 0;
    const gstRate = 18;
    const gstAmount = Math.round(baseAmount * gstRate / (100 + gstRate)); // GST is inclusive
    const subtotal = baseAmount - gstAmount;
    const discountAmount = booking.discount_applied || 0;
    const totalAmount = baseAmount;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.invoiceWrapper} onClick={(e) => e.stopPropagation()}>
                {/* Action Buttons */}
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={handlePrint} title="Print Invoice">
                        <Printer size={18} /> Print
                    </button>
                    <button className={styles.closeBtn} onClick={onClose} title="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Invoice Content */}
                <div className={styles.invoice} id="invoice-print">
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.brandSection}>
                            <div className={styles.logo}>
                                <span className={styles.logoIcon}>🚗</span>
                                <div>
                                    <h1 className={styles.brandName}>Fast<span>On</span>Service</h1>
                                    <p className={styles.brandTagline}>Premium Vehicle Service</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.invoiceMeta}>
                            <h2 className={styles.invoiceTitle}>INVOICE</h2>
                            <div className={styles.metaRow}>
                                <span>Invoice #</span>
                                <strong>{invoiceNumber}</strong>
                            </div>
                            <div className={styles.metaRow}>
                                <span>Date</span>
                                <strong>{invoiceDate}</strong>
                            </div>
                            <div className={styles.metaRow}>
                                <span>Status</span>
                                <span className={`${styles.statusBadge} ${booking.payment_status === 'Paid' ? styles.paid : styles.unpaid}`}>
                                    {booking.payment_status || 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.divider} />

                    {/* Bill To / From */}
                    <div className={styles.parties}>
                        <div className={styles.party}>
                            <h4>Bill To</h4>
                            <p className={styles.partyName}>{customer?.first_name} {customer?.last_name || ''}</p>
                            <p>{customer?.email}</p>
                            <p>{customer?.phone}</p>
                        </div>
                        <div className={styles.party}>
                            <h4>Service Provider</h4>
                            <p className={styles.partyName}>{provider?.company_name || 'Service Center'}</p>
                            <p>{provider?.email}</p>
                            <p>{provider?.address}</p>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    {booking.vehicle_make && (
                        <div className={styles.vehicleInfo}>
                            <h4>Vehicle Details</h4>
                            <div className={styles.vehicleGrid}>
                                <div><span>Make / Model</span><strong>{booking.vehicle_make} {booking.vehicle_model}</strong></div>
                                <div><span>Registration</span><strong>{booking.registration_number}</strong></div>
                                {booking.vehicle_year && <div><span>Year</span><strong>{booking.vehicle_year}</strong></div>}
                            </div>
                        </div>
                    )}

                    <div className={styles.divider} />

                    {/* Line Items Table */}
                    <table className={styles.itemsTable}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', width: '10%' }}>#</th>
                                <th style={{ textAlign: 'left', width: '50%' }}>Description</th>
                                <th style={{ textAlign: 'center', width: '10%' }}>Qty</th>
                                <th style={{ textAlign: 'right', width: '15%' }}>Rate</th>
                                <th style={{ textAlign: 'right', width: '15%' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {booking.services?.length > 0 ? (
                                booking.services.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.service_name}</td>
                                        <td style={{ textAlign: 'center' }}>{item.quantity || 1}</td>
                                        <td style={{ textAlign: 'right' }}>₹{(item.unit_price || item.line_total || 0).toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>₹{(item.line_total || item.unit_price || 0).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td>1</td>
                                    <td>{serviceName}</td>
                                    <td style={{ textAlign: 'center' }}>1</td>
                                    <td style={{ textAlign: 'right' }}>₹{subtotal.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }}>₹{subtotal.toLocaleString()}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className={styles.totalsSection}>
                        <div className={styles.totalsRight}>
                            <div className={styles.totalRow}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>GST ({gstRate}%)</span>
                                <span>₹{gstAmount.toLocaleString()}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className={`${styles.totalRow} ${styles.discount}`}>
                                    <span>Discount</span>
                                    <span>-₹{discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                <span>Total</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.divider} />

                    {/* Footer */}
                    <div className={styles.footer}>
                        <div className={styles.footerNote}>
                            <p><strong>Terms & Conditions:</strong></p>
                            <ul>
                                <li>Payment is due upon completion of service</li>
                                <li>Warranty applies as per service agreement</li>
                                <li>Any additional work requires prior approval</li>
                            </ul>
                        </div>
                        <div className={styles.footerBrand}>
                            <p>Thank you for choosing FastOnService!</p>
                            <p className={styles.footerContact}>support@fastonservice.com | +91 98765 43210</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;
