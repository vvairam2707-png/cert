export default function StatusBadge({ status }) {
    const config = {
        pending: { cls: 'badge badge-pending', icon: '⏳', label: 'Pending' },
        approved: { cls: 'badge badge-approved', icon: '✅', label: 'Approved' },
        rejected: { cls: 'badge badge-rejected', icon: '❌', label: 'Rejected' },
    };
    const { cls, icon, label } = config[status] || config.pending;
    return (
        <span className={cls}>
            {icon} {label}
        </span>
    );
}
