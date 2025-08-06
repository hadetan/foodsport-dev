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

                    <StepCard
                        stepNumber="2"
                        title="JOIN"
                        description="Join a FOODSPORT Calorie Drive Activity / Program"
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

                    <StepCard
                        stepNumber="3"
                        title="KCALS"
                        description="Convert your calories into food equivalent for donation"
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

                    <StepCard
                        stepNumber="4"
                        title="FS POINTS"
                        description="Redeem rewards with FS POINTS"
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
