import React from "react";
import styles from "@/app/shared/css/page.module.css";
import { FaSearch } from "react-icons/fa";

export default function ActivityNotFound() {
    return (
        <div className={styles.notFoundFullWidth}>
            <div className={styles.notFoundContainerCentered}>
                <div className={styles.notFoundIcon}><FaSearch size={48} /></div>
                <h2 className={styles.notFoundTitle}>No Activities Found</h2>
                <p className={styles.notFoundText}>
                    Sorry, we couldn't find any activities matching your search or filter criteria.
                </p>
            </div>
        </div>
    );
}
