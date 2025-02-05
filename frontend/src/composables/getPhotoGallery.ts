import { Storage } from '@ionic/storage';

export function getPhotoGallery() {

    
  const get = async () => {
      const storage = new Storage();
      await storage.create();
      let gallery:any
      await storage.get('userAccessToken').then(async (token: any) => {
        gallery = await fetch(process.env.VUE_APP_BACKEND_URL + '/api/pictures', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer "+ token
                }
            },
        )
      });
      return gallery.json()
  }

  return {
      get,
  }
}