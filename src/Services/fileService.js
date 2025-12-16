import axiosClient from "./axiosClient";

export const fileService = {
    uploadTempFile: async (file, bucketName, tempFolder = "temp") => {
        const formData = new FormData();
        formData.append("file", file);

        return axiosClient.post(
            `/shared/files/temp-file?bucketName=${bucketName}&tempFolder=${tempFolder}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },
};

