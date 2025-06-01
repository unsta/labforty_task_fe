import { reactive } from 'vue'

export const auth = reactive({
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true'
})

export function setAuth(value) {
    auth.isAuthenticated = value
    localStorage.setItem('isAuthenticated', value)
}
