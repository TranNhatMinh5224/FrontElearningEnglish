import React, { createContext, useContext, useState, useEffect } from 'react';
import enumService from '../Services/enumService';

const EnumContext = createContext();

export const useEnums = () => {
    const context = useContext(EnumContext);
    if (!context) {
        throw new Error('useEnums must be used within EnumProvider');
    }
    return context;
};

export const EnumProvider = ({ children }) => {
    const [enums, setEnums] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEnums = async () => {
            try {
                setLoading(true);
                const response = await enumService.getAllEnums();
                
                if (response.data && response.data.success && response.data.data) {
                    setEnums(response.data.data);
                } else {
                    throw new Error('Failed to load enums');
                }
            } catch (err) {
                console.error('Error loading enums:', err);
                setError(err.message || 'Failed to load enums');
            } finally {
                setLoading(false);
            }
        };

        fetchEnums();
    }, []);

    // Helper functions
    const getEnumLabel = (enumName, value) => {
        if (!enums || !enums[enumName]) return 'Unknown';
        const enumItem = enums[enumName].find(item => item.value === value);
        return enumItem ? enumItem.name : 'Unknown';
    };

    const getEnumOptions = (enumName) => {
        if (!enums || !enums[enumName]) return [];
        return enums[enumName].map(item => ({
            value: item.value,
            label: item.name
        }));
    };

    const value = {
        enums,
        loading,
        error,
        getEnumLabel,
        getEnumOptions,
        
        // Shortcuts cho các enum thường dùng
        questionTypes: enums?.QuestionType || [],
        quizTypes: enums?.QuizType || [],
        quizStatuses: enums?.QuizStatus || [],
        courseStatuses: enums?.CourseStatus || [],
        courseTypes: enums?.CourseType || [],
        difficultyLevels: enums?.DifficultyLevel || [],
        moduleTypes: enums?.ModuleType || [],
        submissionStatuses: enums?.SubmissionStatus || [],
        paymentStatuses: enums?.PaymentStatus || [],
        productTypes: enums?.ProductType || [],
        assetTypes: enums?.AssetType || [],
    };

    return (
        <EnumContext.Provider value={value}>
            {children}
        </EnumContext.Provider>
    );
};
