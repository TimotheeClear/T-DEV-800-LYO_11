import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { Storage } from '@ionic/storage';

export function usePhotoGallery() {
  const photos = ref<any[]>([]);
  const lastPhoto = ref();
  const isOpen = ref(false);

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      quality: 100,
      width: 300,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    const fileName = new Date().getTime() + '.jpeg';
    const savedFileImage = await savePicture(photo, fileName);
    photos.value = [savedFileImage, ...photos.value];
  };

  const savePicture = async (photo: Photo, fileName: string) => {
    const storage = new Storage();
    await storage.create();

    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: 'image/.jpeg' })

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', fileName);
      formData.append('tag', '');

      const response = await fetch(process.env.VUE_APP_BACKEND_URL + '/api/pictures', {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + await storage.get('userAccessToken'),
        },
        body: formData
      })
      lastPhoto.value = await response.json()
      isOpen.value = true;
    } catch (error) {
      console.log('error');
    }

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  };

  const updatePicture = async (pictureId: number, pictureName: string, pictureTagList: string[]) => {
    const storage = new Storage();
    await storage.create();

    try {
      await fetch(process.env.VUE_APP_BACKEND_URL + '/api/pictures/' + pictureId, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + await storage.get('userAccessToken'),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "name": pictureName,
          "tags": pictureTagList
        })
      })
    } catch (error) {
      console.log('error');
    }
  }

  return {
    photos,
    takePhoto,
    updatePicture,
    isOpen, 
    lastPhoto,
  };
}