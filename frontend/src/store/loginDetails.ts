import create from 'zustand';
interface loginDetail {
    authToken: string;
    setUserAuthToken: (token: string) => void;

    userId: number;
    setUserId: (id: number) => void;
}

const getTokenStorage = (key: string): string => JSON.parse(window.localStorage.getItem(key) as string);
const setTokenStorage = (key: string, value:string) => window.localStorage.setItem(key, JSON.stringify(value));

const getIdStorage = (key: string): number => JSON.parse(window.localStorage.getItem(key) as string);
const setUserIdStorage = (key: string, value:number) => window.localStorage.setItem(key, JSON.stringify(value));

const useStore = create<loginDetail>((set) => ({
    authToken: getTokenStorage('authToken') || "",
    userId: getIdStorage('userId') || -1,

    setUserId: (userId: number) => set(() => {
        setUserIdStorage('userId', userId)
        return {userId: userId}
    }),
    setUserAuthToken: (authToken: string) => set(() => {
        setTokenStorage('authToken', authToken)
        return {authToken: authToken}
    })
}))
export const useLoginDetailStore = useStore;