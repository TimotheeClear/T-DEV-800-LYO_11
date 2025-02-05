import { Storage } from '@ionic/storage';
import router from '@/router';

export function userAuthentification() {

    const login = async (email: string, password: string) => {
        const token = await fetch(process.env.VUE_APP_BACKEND_URL + '/api/users/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "email": email,
                    "password": password
                })
            },
        )

        const value = await token.json()
        const storage = new Storage();
        await storage.create();
        await storage.set('userAccessToken', value.acces_token);
        router.push("/TabsPage");
    }

    return {
        login,
    }
}