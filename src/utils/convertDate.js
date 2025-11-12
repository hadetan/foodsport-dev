export default function convertDDMMYYYYToYYYYMMDD(ddMmyyyy) {
    if (!ddMmyyyy) return "";
    const parts = ddMmyyyy.split("-");
    if (parts.length !== 3) return "";
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}