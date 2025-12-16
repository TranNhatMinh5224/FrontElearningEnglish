import React from "react";
import UpgradeCard from "../UpgradeCard/UpgradeCard";
import "./AccountUpgradeSection.css";

export default function AccountUpgradeSection({
    selectedPackage,
    onPackageHover,
    onPackageLeave,
    onUpgradeClick,
}) {
    const packages = [
        {
            packageType: "vip",
            title: "VIP",
            description: "Tham gia vào bài học cao cấp",
            price: "299.000đ/tháng",
        },
        {
            packageType: "premium",
            title: "Premium",
            description: "Trở thành giáo viên",
            price: "399.000đ/tháng",
        },
    ];

    return (
        <div className="account-upgrade-section">
            <h2>Nâng cấp tài khoản</h2>
            <p>
                Mở khoá toàn bộ tính năng, tham gia lớp học và đồng hành cùng học sinh
                tốt hơn
            </p>
            <div className="package-grid">
                {packages.map((pkg) => (
                    <UpgradeCard
                        key={pkg.packageType}
                        packageType={pkg.packageType}
                        title={pkg.title}
                        description={pkg.description}
                        price={pkg.price}
                        isSelected={selectedPackage === pkg.packageType}
                        onMouseEnter={() => onPackageHover?.(pkg.packageType)}
                        onMouseLeave={onPackageLeave}
                        onUpgradeClick={onUpgradeClick}
                    />
                ))}
            </div>
        </div>
    );
}

