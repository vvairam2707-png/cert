export default function CategoryBadge({ category }) {
    const config = {
        sports: { cls: 'badge cat-sports', icon: '🏆', label: 'Sports' },
        hackathon: { cls: 'badge cat-hackathon', icon: '💻', label: 'Hackathon' },
        workshop: { cls: 'badge cat-workshop', icon: '🔧', label: 'Workshop' },
        online: { cls: 'badge cat-online', icon: '📚', label: 'Online Course' },
    };
    const { cls, icon, label } = config[category] || { cls: 'badge', icon: '📄', label: category };
    return (
        <span className={cls}>
            {icon} {label}
        </span>
    );
}
