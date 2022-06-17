import {useCookies} from "vue3-cookies"

const {cookies} = useCookies();

class Auth {
    TOKEN_KEY = "x-token"

    isXtoken() {
        return cookies.isKey(this.TOKEN_KEY)
    }

    getXtoken() {
        let token = ""
        try {
            token = cookies.get(this.TOKEN_KEY)
        } catch (e) {
            console.log(e)
        }
        return token;
    }

    setXtoken(value: string) {
        if (value == null || value.trim().length <= 0) return
        cookies.set(this.TOKEN_KEY, value, -1)
    }

    removeXtoken() {
        cookies.remove(this.TOKEN_KEY)
    }
}

export let AUTH = new Auth()

