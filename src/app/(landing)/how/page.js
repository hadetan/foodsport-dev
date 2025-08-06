import React from "react";
import Image from "next/image";
import styles from "./HowPage.module.css";

export default function HowPage() {
    return (
        <main className={styles.container}>
            <div className={styles.heroWrapper}>
                <Image
                    src="/how.png"
                    alt="How"
                    width={1784}
                    height={400}
                    className={styles.backgroundImage}
                />
                <div className={styles.textContainer}>
                    <span className={styles.line}></span>
                    <h1 className={styles.heading}>HOW DOES IT WORK</h1>
                    <span className={styles.line}></span>
                </div>
            </div>

            <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center font-inter">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-800 tracking-tight leading-none relative inline-block">
                        <span className="relative z-10">HOW DOES IT WORK</span>
                        {/* Decorative underline/shadow effect */}
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full opacity-75 z-0"></span>
                    </h1>
                </div>

                {/* Steps Container */}
                <div className="w-full max-w-2xl space-y-8">
                    <StepCard
                        stepNumber="1"
                        title="SIGN UP"
                        description="Sign Up to become a FOODSPORT Member"
                        details="Start your exercising for hunger journey with FOODSPORT by becoming a FOODSPORT member"
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-16 h-16 text-yellow-700"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                            </svg>
                        }
                        gradientFrom="from-yellow-200"
                        gradientTo="to-yellow-400"
                        borderColor="border-yellow-400"
                    />

                    <StepCard
                        stepNumber="2"
                        title="JOIN"
                        description="Join a FOODSPORT Calorie Drive Activity / Program"
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-16 h-16 text-pink-700"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.72c.553-.171 1.13-.27 1.72-.27h4.5c.59 0 1.167.099 1.72.27m-2.25-4.72c-.553-.171-1.13-.27-1.72-.27H9a3 3 0 0 0-3 3v3.375c0 .621.504 1.125 1.125 1.125h4.5c.621 0 1.125-.504 1.125-1.125V1.5M12 21.75V15m0 0l3 3m-3-3-3 3m-2.25-4.72A7.485 7.485 0 0 1 12 15.75a7.485 7.485 0 0 1 7.72-4.725M9 12h3"
                                />
                            </svg>
                        }
                        gradientFrom="from-pink-200"
                        gradientTo="to-pink-400"
                        borderColor="border-pink-400"
                    />

                    <StepCard
                        stepNumber="3"
                        title="KCALS"
                        description="Convert your calories into food equivalent for donation"
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-16 h-16 text-green-700"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 18.75a60.07 60.07 0 0 1 15.795 2.104c.803.179 1.615-.49 1.615-1.329V11.25a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.793 2.912m0 0a.75.75 0 0 0 1.06 1.06l1.742-1.742m6.605 10.01L10.5 21.75V12a9 9 0 0 0-9-9h-1.5m11.963 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                            </svg>
                        }
                        gradientFrom="from-green-200"
                        gradientTo="to-green-400"
                        borderColor="border-green-400"
                    />

                    <StepCard
                        stepNumber="4"
                        title="FS POINTS"
                        description="Redeem rewards with FS POINTS"
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-16 h-16 text-blue-700"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5H12a2.25 2.25 0 0 0 2.25-2.25V1.5a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 0 .75.75H21a.75.75 0 0 1 .75.75v3.75m-18.75 0h16.5m-16.5 0h16.5m-16.5 0v-2.25h2.25m-1.5 0H21m-18.75 0v9.75m-1.5-9.75a.75.75 0 0 0-.75.75v3.75m1.5-4.5h16.5"
                                />
                            </svg>
                        }
                        gradientFrom="from-blue-200"
                        gradientTo="to-blue-400"
                        borderColor="border-blue-400"
                    />
                </div>
            </div>
        </main>
    );
}

// Reusable Step Card component
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
            className={`relative bg-white rounded-2xl shadow-lg p-6 border-2 ${borderColor}`}
        >
            {/* Step Number Badge */}
            <div
                className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold text-sm sm:text-base shadow-md
                bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
            >
                STEP {stepNumber}
            </div>

            <div className="flex flex-col items-center text-center pt-6">
                {/* Icon */}
                <div className="mb-4">{icon}</div>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-base sm:text-lg mb-2">
                    {description}
                </p>

                {/* Optional Details */}
                {details && (
                    <p className="text-gray-500 text-sm sm:text-base">
                        {details}
                    </p>
                )}
            </div>
        </div>
    );
}
