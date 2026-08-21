import apiClient from './client';

export const uploadImages = async (uris: string[]): Promise<string[]> => {
  const form = new FormData();

  uris.forEach((uri, idx) => {
    // Extract filename
    const filename = uri.split('/').pop() || `photo_${Date.now()}_${idx}.jpg`;
    // Attempt to determine type from extension
    const match = filename.match(/\.(jpg|jpeg|png)$/i);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    // @ts-ignore - React Native FormData file object
    form.append('files', {
      uri,
      name: filename,
      type,
    });
  });

  const response = await apiClient.post('/uploads', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // increase timeout for uploads
    timeout: 120000,
  });

  // Expect { success: true, files: [url,...] }
  return response.data?.files ?? [];
};

export default uploadImages;
