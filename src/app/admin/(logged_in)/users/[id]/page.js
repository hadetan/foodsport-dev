"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios/api";
import { useUsers } from "@/app/shared/contexts/usersContext";
import Avatar from "@/app/shared/components/avatar";
import { IoIosArrowBack } from "react-icons/io";
import { Pencil, Check, Copy } from "lucide-react";
import formatDate from "@/utils/formatDate";
import FullPageLoader from "../../components/FullPageLoader";
import DobPickerClient from "@/app/shared/components/DobPickerClient";
import convertDDMMYYYYToYYYYMMDD from "@/utils/convertDate";

const UserDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
    );
    const returnPage = searchParams.get("returnPage") || "1";
    const { users, loading: usersLoading, setUsers } = useUsers();
    const [user, setUser] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [copied, setCopied] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState(null);

    // Edit states for additional fields
    const [isEditingGender, setIsEditingGender] = useState(false);
    const [gender, setGender] = useState("");
    const [genderLoading, setGenderLoading] = useState(false);

    const [isEditingHeight, setIsEditingHeight] = useState(false);
    const [height, setHeight] = useState("");
    const [heightLoading, setHeightLoading] = useState(false);

    const [isEditingDateOfBirth, setIsEditingDateOfBirth] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [dateOfBirthLoading, setDateOfBirthLoading] = useState(false);

    const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneNumberLoading, setPhoneNumberLoading] = useState(false);

    const [isEditingWeight, setIsEditingWeight] = useState(false);
    const [weight, setWeight] = useState("");
    const [weightLoading, setWeightLoading] = useState(false);

    // Store original values when entering edit mode
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalGender, setOriginalGender] = useState("");
    const [originalHeight, setOriginalHeight] = useState("");
    const [originalDateOfBirth, setOriginalDateOfBirth] = useState("");
    const [originalPhoneNumber, setOriginalPhoneNumber] = useState("");
    const [originalWeight, setOriginalWeight] = useState("");

    useEffect(() => {
        if (users && users.length > 0) {
            const filtered = users.filter((u) => String(u.id) === String(id));
            setUser(filtered.length > 0 ? filtered[0] : null);
            if (filtered.length > 0) {
                setEmail(filtered[0].email || "");
                setGender(filtered[0].gender || "");
                setHeight(filtered[0].height || "");
                setDateOfBirth(
                    filtered[0].dateOfBirth
                        ? filtered[0].dateOfBirth.split("T")[0]
                        : ""
                );
                setPhoneNumber(filtered[0].phoneNumber || "");
                setWeight(filtered[0].weight || "");
                // Extract activities from user data
                const activitiesList = filtered[0].joinedActivities ?? [];
                setActivities(
                    Array.isArray(activitiesList) ? activitiesList : []
                );
                setActivitiesLoading(false);
                setActivitiesError(null);
            }
        }
    }, [users, id]);

    const handleUserStatus = async () => {
        if (statusLoading || !user) return;

        const newStatus = !user.isActive;
        setStatusLoading(true);

        try {
            const { data } = await api.patch(`/admin/users`, {
                userId: user.id,
                isActive: newStatus,
            });

            if (data) {
                setUser({ ...user, isActive: newStatus });
                setUsers(
                    users.map((u) =>
                        u.id === user.id ? { ...u, isActive: newStatus } : u
                    )
                );
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update user status.");
        } finally {
            setStatusLoading(false);
        }
    };

    const handleEmailSave = async () => {
        if (!user) return;
        
        // Check if value has changed
        const currentEmail = originalEmail || "";
        const newEmail = email || "";
        if (currentEmail === newEmail) {
            setIsEditingEmail(false);
            return;
        }
        
        setEmailLoading(true);
        try {
            const { data } = await api.patch("/admin/users", {
                userId: user.id,
                email,
            });
            if (data && !data.error) {
                setUser({ ...user, email });
                setUsers(
                    users.map((u) => (u.id === user.id ? { ...u, email } : u))
                );
                setIsEditingEmail(false);
            } else {
                alert(data?.error || "Failed to update email.");
            }
        } catch (err) {
            console.error("Email update error:", err);
            alert("Failed to update email.");
        } finally {
            setEmailLoading(false);
        }
    };

    const handleGenderSave = async () => {
        if (!user) return;
        
        // Check if value has changed
        const currentGender = originalGender || "";
        const newGender = gender || "";
        if (currentGender === newGender) {
            setIsEditingGender(false);
            return;
        }
        
        setGenderLoading(true);
        try {
            const { data } = await api.patch("/admin/users", {
                userId: user.id,
                gender,
            });
            if (data && !data.error) {
                setUser({ ...user, gender });
                setUsers(
                    users.map((u) => (u.id === user.id ? { ...u, gender } : u))
                );
                setIsEditingGender(false);
            } else {
                alert(data?.error || "Failed to update gender.");
            }
        } catch (err) {
            console.error("Gender update error:", err);
            alert("Failed to update gender.");
        } finally {
            setGenderLoading(false);
        }
    };

    const handleHeightSave = async () => {
        if (!user) return;
        
        // Check if value has changed
        const currentHeight = parseFloat(originalHeight) || 0;
        const newHeight = parseFloat(height) || 0;
        if (currentHeight === newHeight) {
            setIsEditingHeight(false);
            return;
        }
        
        setHeightLoading(true);
        try {
            const { data } = await api.patch("/admin/users", {
                userId: user.id,
                height: parseFloat(height),
            });
            if (data && !data.error) {
                const updatedHeight = parseFloat(height);
                setUser({ ...user, height: updatedHeight });
                setUsers(
                    users.map((u) =>
                        u.id === user.id ? { ...u, height: updatedHeight } : u
                    )
                );
                setIsEditingHeight(false);
            } else {
                alert(data?.error || "Failed to update height.");
            }
        } catch (err) {
            console.error("Height update error:", err);
            alert("Failed to update height.");
        } finally {
            setHeightLoading(false);
        }
    };

    const handleDateOfBirthSave = async () => {
        if (!user) return;
        
        // Check if value has changed
        const currentDateOfBirth = originalDateOfBirth || "";
        const newDateOfBirth = dateOfBirth || "";
        if (currentDateOfBirth === newDateOfBirth) {
            setIsEditingDateOfBirth(false);
            return;
        }
        
        setDateOfBirthLoading(true);
        try {
            const { data } = await api.patch("/admin/users", {
                userId: user.id,
                dateOfBirth: new Date(dateOfBirth).toISOString(),
            });
            if (data && !data.error) {
                const updatedDateOfBirth = new Date(dateOfBirth).toISOString();
                setUser({ ...user, dateOfBirth: updatedDateOfBirth });
                setUsers(
                    users.map((u) =>
                        u.id === user.id
                            ? { ...u, dateOfBirth: updatedDateOfBirth }
                            : u
                    )
                );
                setIsEditingDateOfBirth(false);
            } else {
                alert(data?.error || "Failed to update date of birth.");
            }
        } catch (err) {
            console.error("Date of birth update error:", err);
            alert("Failed to update date of birth.");
        } finally {
            setDateOfBirthLoading(false);
        }
    };

    const handlePhoneNumberSave = async () => {
        if (!user) return;
        
        // Check if value has changed
        const currentPhoneNumber = originalPhoneNumber || "";
        const newPhoneNumber = phoneNumber || "";
        if (currentPhoneNumber === newPhoneNumber) {
            setIsEditingPhoneNumber(false);
            return;
        }
        
        setPhoneNumberLoading(true);
        try {
            const { data } = await api.patch("/admin/users", {
                userId: user.id,
                phoneNumber,
            });
            if (data && !data.error) {
                setUser({ ...user, phoneNumber });
                setUsers(
                    users.map((u) =>
                        u.id === user.id ? { ...u, phoneNumber } : u
                    )
                );
                setIsEditingPhoneNumber(false);
            } else {
                alert(data?.error || "Failed to update phone number.");
            }
        } catch (err) {
            console.error("Phone number update error:", err);
            alert("Failed to update phone number.");
        } finally {
            setPhoneNumberLoading(false);
        }
    };

    const handleWeightSave = async () => {
        if (!user) return;
        
        // Check if value has changed
        const currentWeight = parseFloat(originalWeight) || 0;
        const newWeight = parseFloat(weight) || 0;
        if (currentWeight === newWeight) {
            setIsEditingWeight(false);
            return;
        }
        
        setWeightLoading(true);
        try {
            const { data } = await api.patch("/admin/users", {
                userId: user.id,
                weight: parseFloat(weight),
            });
            if (data && !data.error) {
                const updatedWeight = parseFloat(weight);
                setUser({ ...user, weight: updatedWeight });
                setUsers(
                    users.map((u) =>
                        u.id === user.id ? { ...u, weight: updatedWeight } : u
                    )
                );
                setIsEditingWeight(false);
            } else {
                alert(data?.error || "Failed to update weight.");
            }
        } catch (err) {
            console.error("Weight update error:", err);
            alert("Failed to update weight.");
        } finally {
            setWeightLoading(false);
        }
    };

    const handleCopyId = () => {
        if (!user?.id) return;
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    if (usersLoading) return <FullPageLoader />;
    if (!user)
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="text-5xl font-extrabold text-purple-500 mb-4">
                        User Not Found
                    </div>
                    <div className="text-lg text-gray-300">
                        Sorry, we could not find a user with this ID.
                    </div>
                </div>
            </div>
        );

    return (
        <div className="p-4 md:p-8 bg-base-200 min-h-screen">
            <div>
                <div className="flex items-center mb-8">
                    <button
                        onClick={() =>
                            router.push(`/admin/users?page=${returnPage}`)
                        }
                        className="flex items-center text-base-content/60 hover:text-primary transition-colors duration-200 mr-4 cursor-pointer"
                    >
                        <IoIosArrowBack className="w-5 h-5 mr-1" />
                        Back
                    </button>
                    <h2 className="text-2xl md:text-3xl font-bold text-base-content">
                        User Details
                    </h2>
                </div>
                <div className="bg-base-100 border border-base-300 rounded-2xl shadow-lg">
                    <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-gradient-to-r from-primary/10 to-base-100 border-b border-base-300">
                        <div className="flex-shrink-0">
                            <Avatar
                                srcAvatar={user.profilePictureUrl}
                                firstName={user.firstname}
                                lastName={user.lastname}
                                size="20"
                                isNav={true}
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-2xl font-semibold text-base-content">
                                {user.firstname} {user.lastname}
                            </div>
                            <div className="text-base-content/70 text-sm mt-1 flex items-center gap-2">
                                {isEditingEmail ? (
                                    <>
                                        <input
                                            className="input input-bordered input-sm"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            autoFocus
                                            disabled={emailLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={handleEmailSave}
                                            aria-label="Save Email"
                                            disabled={emailLoading}
                                        >
                                            {emailLoading ? (
                                                <span className="loading loading-spinner loading-xs text-success" />
                                            ) : (
                                                <Check className="w-4 h-4 text-success" />
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span>{email}</span>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setOriginalEmail(email);
                                                setIsEditingEmail(true);
                                            }}
                                            aria-label="Edit Email"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="mt-3 flex flex-col md:flex-row gap-2 items-center">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        user.isRegistered === false
                                            ? "bg-yellow-100 text-yellow-700"
                                            : user.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {user.isRegistered === false
                                        ? "Unregistered"
                                        : user.isActive
                                        ? "Active"
                                        : "Blocked"}
                                </span>
                                <button
                                    onClick={handleUserStatus}
                                    disabled={
                                        statusLoading ||
                                        user.isRegistered === false
                                    }
                                    className={`relative inline-flex items-center h-7 rounded-full w-14 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 ${
                                        user.isRegistered === false
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : user.isActive
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    } ml-0 md:ml-4 mt-2 md:mt-0`}
                                >
                                    {statusLoading && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <span className="loading loading-spinner loading-xs text-white"></span>
                                        </span>
                                    )}
                                    <span
                                        className={`${
                                            user.isActive
                                                ? "translate-x-7"
                                                : "translate-x-1"
                                        } inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300`}
                                    />
                                    <span className="sr-only">
                                        {user.isActive
                                            ? "Block User"
                                            : "Activate User"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <Detail
                            label="ID"
                            value={
                                <span className="flex items-center gap-2">
                                    {user.id}
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs p-1"
                                        onClick={handleCopyId}
                                        aria-label="Copy User ID"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    {copied && (
                                        <span className="text-xs text-success ml-1">
                                            Copied!
                                        </span>
                                    )}
                                </span>
                            }
                        />
                        <Detail
                            label="Date of Birth"
                            value={
                                isEditingDateOfBirth ? (
                                    <div className="flex items-center gap-2">
                                        <DobPickerClient
                                            value={dateOfBirth}
                                            onChange={(val) => setDateOfBirth(convertDDMMYYYYToYYYYMMDD(val))}
                                            disableLabel
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={handleDateOfBirthSave}
                                            aria-label="Save Date of Birth"
                                            disabled={dateOfBirthLoading}
                                        >
                                            {dateOfBirthLoading ? (
                                                <span className="loading loading-spinner loading-xs text-success" />
                                            ) : (
                                                <Check className="w-4 h-4 text-success" />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {user.dateOfBirth ? (
                                            <span>
                                                {formatDate(
                                                    user.dateOfBirth.split(
                                                        "T"
                                                    )[0]
                                                )}
                                            </span>
                                        ) : (
                                            <span className="italic text-base-content/50">
                                                Empty
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setOriginalDateOfBirth(dateOfBirth);
                                                setIsEditingDateOfBirth(true);
                                            }}
                                            aria-label="Edit Date of Birth"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            }
                        />
                        <Detail
                            label="Gender"
                            value={
                                isEditingGender ? (
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="select select-bordered select-sm"
                                            value={gender}
                                            onChange={(e) =>
                                                setGender(e.target.value)
                                            }
                                            autoFocus
                                            disabled={genderLoading}
                                        >
                                            <option value="">
                                                Select Gender
                                            </option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={handleGenderSave}
                                            aria-label="Save Gender"
                                            disabled={genderLoading}
                                        >
                                            {genderLoading ? (
                                                <span className="loading loading-spinner loading-xs text-success" />
                                            ) : (
                                                <Check className="w-4 h-4 text-success" />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {user.gender ? (
                                            <span>
                                                {user.gender
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    user.gender.slice(1)}
                                            </span>
                                        ) : (
                                            <span className="italic text-base-content/50">
                                                Empty
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setOriginalGender(gender);
                                                setIsEditingGender(true);
                                            }}
                                            aria-label="Edit Gender"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            }
                        />
                        <Detail
                            label="Phone Number"
                            value={
                                isEditingPhoneNumber ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="input input-bordered input-sm"
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) =>
                                                setPhoneNumber(e.target.value)
                                            }
                                            autoFocus
                                            disabled={phoneNumberLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={handlePhoneNumberSave}
                                            aria-label="Save Phone Number"
                                            disabled={phoneNumberLoading}
                                        >
                                            {phoneNumberLoading ? (
                                                <span className="loading loading-spinner loading-xs text-success" />
                                            ) : (
                                                <Check className="w-4 h-4 text-success" />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {user.phoneNumber ? (
                                            <span>{user.phoneNumber}</span>
                                        ) : (
                                            <span className="italic text-base-content/50">
                                                Empty
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setOriginalPhoneNumber(phoneNumber);
                                                setIsEditingPhoneNumber(true);
                                            }}
                                            aria-label="Edit Phone Number"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            }
                        />
                        <Detail
                            label="Height"
                            value={
                                isEditingHeight ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="input input-bordered input-sm"
                                            type="number"
                                            value={height}
                                            onChange={(e) =>
                                                setHeight(e.target.value)
                                            }
                                            placeholder="cm"
                                            autoFocus
                                            disabled={heightLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={handleHeightSave}
                                            aria-label="Save Height"
                                            disabled={heightLoading}
                                        >
                                            {heightLoading ? (
                                                <span className="loading loading-spinner loading-xs text-success" />
                                            ) : (
                                                <Check className="w-4 h-4 text-success" />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {user.height ? (
                                            <span>{user.height} cm</span>
                                        ) : (
                                            <span className="italic text-base-content/50">
                                                Empty
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setOriginalHeight(height);
                                                setIsEditingHeight(true);
                                            }}
                                            aria-label="Edit Height"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            }
                        />
                        <Detail
                            label="Weight"
                            value={
                                isEditingWeight ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="input input-bordered input-sm"
                                            type="number"
                                            value={weight}
                                            onChange={(e) =>
                                                setWeight(e.target.value)
                                            }
                                            placeholder="kg"
                                            autoFocus
                                            disabled={weightLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={handleWeightSave}
                                            aria-label="Save Weight"
                                            disabled={weightLoading}
                                        >
                                            {weightLoading ? (
                                                <span className="loading loading-spinner loading-xs text-success" />
                                            ) : (
                                                <Check className="w-4 h-4 text-success" />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {user.weight ? (
                                            <span>{user.weight} kg</span>
                                        ) : (
                                            <span className="italic text-base-content/50">
                                                Empty
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setOriginalWeight(weight);
                                                setIsEditingWeight(true);
                                            }}
                                            aria-label="Edit Weight"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            }
                        />
                        <Detail
                            label="Total Calories Donated"
                            value={
                                user.totalCaloriesDonated === 0 ? (
                                    <span className="italic text-base-content/50">
                                        No donations made
                                    </span>
                                ) : (
                                    user.totalCaloriesDonated
                                )
                            }
                        />
                        <Detail
                            label="Registered At"
                            value={
                                user.createdAt ? (
                                    formatDate(user.createdAt.split("T")[0])
                                ) : (
                                    <span className="italic text-base-content/50">
                                        Empty
                                    </span>
                                )
                            }
                        />
                    </div>
                </div>

                <div className="mt-8 bg-base-100 border border-base-300 rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-base-content">
                            Joined Activities
                            <span className="ml-2 text-base-content/60 text-sm">
                                ({activities.length})
                            </span>
                        </h3>
                    </div>

                    {activitiesLoading ? (
                        <div className="p-6 flex items-center gap-2">
                            <span className="loading loading-spinner loading-sm" />
                            <span className="text-base-content/70 text-sm">
                                Loading activities...
                            </span>
                        </div>
                    ) : activitiesError ? (
                        <div className="p-6 text-error text-sm">
                            {activitiesError}
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="p-6 text-base-content/60 text-sm">
                            No activities joined.
                        </div>
                    ) : (
                        <div className="overflow-x-auto ">
                            <table className="table table-zebra-zebra mb-4">
                                <thead className="bg-base-200">
                                    <tr>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Activity
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Activity Type
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Location
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Joined At
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Was Present
                                        </th>
                                        <th className="text-xs font-semibold uppercase text-base-content/60">
                                            Calories Donated
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.slice().map((a, index) => {
                                        const activityName =
                                            a.title ?? a.name ?? "Unknown";
                                        const activityType =
                                            a.activityType ?? a.type ?? "—";
                                        const location = a.location ?? "—";
                                        const joinedAtRaw = a.createdAt ?? null;
                                        const wasPresent =
                                            a.wasPresent ?? false;
                                        const calories = a.caloriesDonated ?? 0;

                                        return (
                                            <tr
                                                key={`${
                                                    a.id || "unknown"
                                                }-${activityName}-${index}`}
                                                className="py-3"
                                            >
                                                <td className="text-sm text-base-content">
                                                    {activityName}
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                    {activityType}
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                    {location}
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                    {joinedAtRaw ? (
                                                        formatDate(
                                                            String(
                                                                joinedAtRaw
                                                            ).split("T")[0]
                                                        )
                                                    ) : (
                                                        <span className="italic text-base-content/50">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs ${
                                                            wasPresent
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {wasPresent
                                                            ? "Yes"
                                                            : "No"}
                                                    </span>
                                                </td>
                                                <td className="text-sm text-base-content/80">
                                                    {calories || 0}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function Detail({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                {label}
            </span>
            <span className="text-base-content text-sm">{value}</span>
        </div>
    );
}

export default UserDetailPage;
