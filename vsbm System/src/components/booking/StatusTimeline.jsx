import React from 'react';
import { CheckCircle, Clock, Circle, ArrowRight } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import styles from './StatusTimeline.module.css';

const StatusTimeline = ({ bookingId, currentStatus }) => {
    const { getStatusHistoryByBookingId, bookingStatuses, getStatusInfo } = useMockData();
    const history = getStatusHistoryByBookingId(bookingId);

    // Build the ordered flow
    const mainFlow = bookingStatuses
        .filter(s => s.order > 0)
        .sort((a, b) => a.order - b.order);

    const currentStatusInfo = getStatusInfo(currentStatus);
    const currentOrder = currentStatusInfo?.order || 0;

    // Calculate progress percentage
    const maxOrder = Math.max(...mainFlow.map(s => s.order), 1);
    const progressPercent = maxOrder > 0 ? Math.round((currentOrder / maxOrder) * 100) : 0;

    // Determine which statuses to show (simplified flow)
    const keyStatuses = ['PENDING', 'ACCEPTED', 'INSPECTION', 'WORK_IN_PROGRESS', 'QUALITY_CHECK', 'READY_FOR_DELIVERY', 'COMPLETED'];
    const displayStatuses = mainFlow.filter(s => keyStatuses.includes(s.code));

    return (
        <div className={styles.timeline}>
            <div className={styles.progressBar}>
                <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className={styles.progressLabel}>{progressPercent}% Complete</span>
            </div>

            <div className={styles.steps}>
                {displayStatuses.map((status, i) => {
                    const historyEntry = history.find(h => (h.status_to || h.status) === status.code);
                    const isDone = status.order < currentOrder;
                    const isCurrent = status.code === currentStatus;

                    return (
                        <div key={status.code} className={`${styles.step} ${isDone ? styles.done : ''} ${isCurrent ? styles.current : ''}`}>
                            <div className={styles.dot} style={isCurrent ? { borderColor: status.color, boxShadow: `0 0 10px ${status.color}40` } : {}}>
                                {isDone ? <CheckCircle size={14} /> : isCurrent ? <Clock size={14} /> : <Circle size={10} />}
                            </div>
                            <div className={styles.stepInfo}>
                                <span className={styles.stepLabel}>{status.name}</span>
                                {historyEntry && (
                                    <span className={styles.stepTime}>
                                        {new Date(historyEntry.created_at || historyEntry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;
