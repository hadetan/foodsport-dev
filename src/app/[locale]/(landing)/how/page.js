import React from "react";
import Image from "next/image";
import styles from "../css/HowPage.module.css";
import { useTranslations } from "next-intl";

export default function HowPage() {
    const t = useTranslations("HowPage");

    return (
        <main className={styles.container}>
            <section className={styles.how}>
            <div className={styles.overlay}>
                <div className={styles.centerContent}>
                    <span className={styles.line}></span>
                    <h1 className={styles.title}>HOW IT WORKS</h1>
                    <span className={styles.line}></span>
                </div>
            </div>
        </section>

            <div className="bg-gray-100 py-12 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col items-center font-inter">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-800 tracking-tight leading-none relative inline-block">
                        <span className="relative z-10">{t("heading")}</span>
                        <span className="block mx-auto mt-2 h-2 w-2/3 sm:w-4/5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full opacity-75"></span>
                    </h1>
                </div>


                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="h-full">
                        <StepCard
                            stepNumber="1"
                            title={t("steps.1.title")}
                            description={t("steps.1.description")}
                            details={t("steps.1.details")}
                            icon={
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <Image
                                        src="/user-plus.png"
                                        alt="Sign Up Icon"
                                        width={500}
                                        height={500}
                                        className="object-contain"
                                    />
                                </div>
                            }
                            gradientFrom="from-yellow-200"
                            gradientTo="to-yellow-400"
                            borderColor="border-yellow-400"
                        />
                    </div>

                    <div className="h-full">
                        <StepCard
                            stepNumber="2"
                            title={t("steps.2.title")}
                            description={t("steps.2.description")}
                            icon={
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <Image
                                        src="/join.png"
                                        alt="Join Icon"
                                        width={600}
                                        height={600}
                                        className="object-contain"
                                    />
                                </div>
                            }
                            gradientFrom="from-pink-200"
                            gradientTo="to-pink-400"
                            borderColor="border-pink-400"
                        />
                    </div>

                    <div className="h-full">
                        <StepCard
                            stepNumber="3"
                            title={t("steps.3.title")}
                            description={t("steps.3.description")}
                            icon={
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <Image
                                        src="/kcal.png"
                                        alt="Kcal Icon"
                                        width={500}
                                        height={500}
                                        className="object-contain"
                                    />
                                </div>
                            }
                            gradientFrom="from-green-200"
                            gradientTo="to-green-400"
                            borderColor="border-green-400"
                        />
                    </div>

                    <div className="h-full">
                        <StepCard
                            stepNumber="4"
                            title={t("steps.4.title")}
                            description={t("steps.4.description")}
                            icon={
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <Image
                                        src="/gift-box.png"
                                        alt="Gift Box Icon"
                                        width={500}
                                        height={500}
                                        className="object-contain"
                                    />
                                </div>
                            }
                            gradientFrom="from-blue-200"
                            gradientTo="to-blue-400"
                            borderColor="border-blue-400"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

function StepCard({
    stepNumber,
    title,
    description,
    details,
    icon,
    gradientFrom,
    gradientTo,
    borderColor,
}) {
    return (
        <div
            className={`relative h-full bg-white rounded-2xl shadow-lg p-6 sm:p-7 border-2 ${borderColor} flex flex-col`}
        >
            <div
                className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold text-sm sm:text-base shadow-md
                bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
            >
                STEP {stepNumber}
            </div>

            <div className="flex flex-col items-center text-center pt-6 flex-1">
                <div className="mb-4">{icon}</div>

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    {title}
                </h3>

                <p className="text-gray-600 text-base sm:text-lg mb-2">
                    {description}
                </p>

                {details && (
                    <p className="text-gray-500 text-sm sm:text-base">
                        {details}
                    </p>
                )}
            </div>
        </div>
    );
}
