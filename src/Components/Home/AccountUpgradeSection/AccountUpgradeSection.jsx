import React, { useEffect, useState } from "react";
import UpgradeCard from "../UpgradeCard/UpgradeCard";
import { teacherPackageService } from "../../../Services/teacherPackageService";
import "./AccountUpgradeSection.css";

export default function AccountUpgradeSection({
    selectedPackage,
    onPackageHover,
    onPackageLeave,
    onUpgradeClick,
}) {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const response = await teacherPackageService.getAll();
                const packagesData = response.data?.data || [];
                
                // Map API data to component format
                const mappedPackages = packagesData.map((pkg) => {
                    // Format price: if 0 show "Free", otherwise show price with currency
                    let priceDisplay = "Free";
                    if (pkg.price && pkg.price > 0) {
                        priceDisplay = `${pkg.price.toLocaleString("vi-VN")}đ/tháng`;
                    }
                    
                    return {
                        teacherPackageId: pkg.teacherPackageId,
                        packageType: pkg.packageName?.toLowerCase() || "",
                        title: pkg.packageName || "",
                        description: `Gói ${pkg.packageName} Teacher Package`,
                        price: priceDisplay,
                        level: pkg.level || "",
                    };
                });
                
                setPackages(mappedPackages);
                setError("");
            } catch (err) {
                console.error("Error fetching teacher packages:", err);
                setError("Không thể tải danh sách gói nâng cấp");
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    if (loading) {
        return (
            <div className="account-upgrade-section">
                <h2>Nâng cấp tài khoản</h2>
                <p>
                    Mở khoá toàn bộ tính năng, tham gia lớp học và đồng hành cùng học sinh
                    tốt hơn
                </p>
                <div className="package-grid">
                    <div style={{ textAlign: "center", padding: "20px" }}>Đang tải...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="account-upgrade-section">
                <h2>Nâng cấp tài khoản</h2>
                <p>
                    Mở khoá toàn bộ tính năng, tham gia lớp học và đồng hành cùng học sinh
                    tốt hơn
                </p>
                <div className="package-grid">
                    <div style={{ textAlign: "center", padding: "20px", color: "red" }}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="account-upgrade-section">
            <h2>Nâng cấp tài khoản</h2>
            <p>
                Mở khoá toàn bộ tính năng, tham gia lớp học và đồng hành cùng học sinh
                tốt hơn
            </p>
            <div className="package-grid">
                {packages.slice(0, 4).map((pkg) => (
                    <UpgradeCard
                        key={pkg.teacherPackageId}
                        teacherPackageId={pkg.teacherPackageId}
                        packageType={pkg.packageType}
                        title={pkg.title}
                        description={pkg.description}
                        price={pkg.price}
                        isSelected={selectedPackage === pkg.teacherPackageId}
                        onMouseEnter={() => onPackageHover?.(pkg.teacherPackageId)}
                        onMouseLeave={onPackageLeave}
                        onUpgradeClick={onUpgradeClick}
                    />
                ))}
            </div>
        </div>
    );
}

