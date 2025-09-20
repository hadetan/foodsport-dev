import styles from "@/app/shared/css/redeem.module.css";

export default function redeemTitle() {
    return (
        <section className={styles.redeemBg}>
            <div className={styles.overlay}>
                <div className={styles.centerContent}>
                    <span className={styles.line}></span>
                    <h1 className={styles.title}>Redeem</h1>
                    <span className={styles.line}></span>
                </div>
            </div>
        </section>
    );
}
