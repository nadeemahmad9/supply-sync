
import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

const initialState = {
    user: null,
    token: localStorage.getItem("admin_token"),
    isAuthenticated: !!localStorage.getItem("admin_token"),
    loading: true,
}


const authReducer = (state, action) => {
    switch (action.type) {
        case "USER_LOADED":
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload,
            }
        // LOGIN_SUCCESS case
        case "LOGIN_SUCCESS":
            localStorage.setItem("admin_token", action.payload.token);
            setAuthToken(action.payload.token); // <-- Make sure axios default header is set immediately
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
            };

        case "AUTH_ERROR":
        case "LOGIN_FAIL":
        case "LOGOUT":
            localStorage.removeItem("admin_token")
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
            }
        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload,
            }
        default:
            return state
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Set auth token in axios headers
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        } else {
            delete axios.defaults.headers.common["Authorization"]
        }
    }

    // Load user
    // const loadUser = async () => {
    //     if (localStorage.admin_token) {
    //         setAuthToken(localStorage.admin_token)
    //     }

    //     try {
    //         const res = await axios.get(`http://localhost:5000/api/auth/me`)

    //         // Check if user is admin
    //         if (res.data.user.role !== "admin") {
    //             dispatch({ type: "AUTH_ERROR" })
    //             toast.error("Access denied. Admin privileges required.")
    //             return
    //         }

    //         dispatch({
    //             type: "USER_LOADED",
    //             payload: res.data.user,
    //         })
    //     } catch (err) {
    //         dispatch({ type: "AUTH_ERROR" })
    //     }
    // }


    // const loadUser = async () => {
    //     const token = localStorage.getItem("admin_token")
    //     if (!token) {
    //         dispatch({ type: "AUTH_ERROR" })
    //         return
    //     }

    //     setAuthToken(token)

    //     try {
    //         const res = await axios.get(`http://localhost:5000/api/auth/me`)
    //         if (res.data.user.role !== "admin") {
    //             dispatch({ type: "AUTH_ERROR" })
    //             toast.error("Access denied. Admin privileges required.")
    //             return
    //         }

    //         dispatch({
    //             type: "USER_LOADED",
    //             payload: res.data.user,
    //         })
    //     } catch (err) {
    //         dispatch({ type: "AUTH_ERROR" })
    //     }
    // }

    const loadUser = async () => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            dispatch({ type: "AUTH_ERROR" });
            return;
        }

        setAuthToken(token); // set axios header first

        try {
            const res = await axios.get(`http://localhost:5000/api/auth/me`);
            if (!res.data.user || res.data.user.role !== "admin") {
                dispatch({ type: "AUTH_ERROR" });
                toast.error("Access denied. Admin privileges required.");
                return;
            }

            dispatch({
                type: "USER_LOADED",
                payload: res.data.user,
            });
        } catch (err) {
            dispatch({ type: "AUTH_ERROR" });
        }
    };



    // Login user
    // const login = async (formData) => {
    //     dispatch({ type: "SET_LOADING", payload: true })

    //     try {
    //         const res = await axios.post(`http://localhost:5000/api/auth/login`, formData)

    //         // Check if user is admin
    //         if (res.data.user.role !== "admin") {
    //             dispatch({ type: "LOGIN_FAIL" })
    //             toast.error("Access denied. Admin privileges required.")
    //             return { success: false, message: "Access denied" }
    //         }

    //         dispatch({
    //             type: "LOGIN_SUCCESS",
    //             payload: res.data,
    //         })

    //         setAuthToken(res.data.token)
    //         toast.success("Login successful!")
    //         return { success: true }
    //     } catch (err) {
    //         const message = err.response?.data?.message || "Login failed"
    //         dispatch({ type: "LOGIN_FAIL" })
    //         toast.error(message)
    //         return { success: false, message }
    //     }
    // }

    const login = async (formData) => {
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            const res = await axios.post(`http://localhost:5000/api/auth/login`, formData);

            if (!res.data.token) {
                toast.error("Login failed: no token returned");
                dispatch({ type: "LOGIN_FAIL" });
                return { success: false };
            }

            if (res.data.user.role !== "admin") {
                dispatch({ type: "LOGIN_FAIL" });
                toast.error("Access denied. Admin privileges required.");
                return { success: false };
            }

            setAuthToken(res.data.token); // <-- important
            dispatch({
                type: "LOGIN_SUCCESS",
                payload: res.data,
            });

            toast.success("Login successful!");
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Login failed";
            dispatch({ type: "LOGIN_FAIL" });
            toast.error(message);
            return { success: false, message };
        }
    };

    // Logout
    const logout = () => {
        dispatch({ type: "LOGOUT" })
        setAuthToken(null)
        toast.success("Logged out successfully!")
    }

    useEffect(() => {
        loadUser()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                loadUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
