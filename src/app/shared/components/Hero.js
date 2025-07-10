import styles from '@/app/shared/css/Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}>
                <h1 className={styles.title}>FOODSPORT</h1>
            </div>
        </section>
    );
} 