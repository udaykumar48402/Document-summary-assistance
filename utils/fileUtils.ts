export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // result is "data:mime/type;base64,..."
            // we need to strip the prefix
            const base64String = result.split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error("Failed to extract Base64 from file data."));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};
