export type CMSUpdatePayload = {
    section: string;
    key: string;
    value?: string | null;
    image_url?: string | null;
};

export const updateCMSContent = async (payload: CMSUpdatePayload) => {
    try {
        const response = await fetch('/api/admin/cms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update CMS content');
        }

        return await response.json();
    } catch (error) {
        console.error("Error in updateCMSContent:", error);
        throw error;
    }
};
