import toast from "react-hot-toast";

import { setUser } from "../../slices/profileSlice";
import { logout } from "./authAPI";
import { apiconnector } from "../apiconnector";
import { settingsEndpoints } from "../apis";

const {
    UPDATE_DISPLAY_PICTURE_API,
    UPDATE_PROFILE_API,
    CHANGE_PASSWORD_API,
    DELETE_PROFILE_API
} = settingsEndpoints

export function updateDisplayPicture (token, formData){
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        try {
            console.log("Token:", token); // Debugging log
            console.log("FormData:", formData); // Debugging log
            const response = await apiconnector(
                "PUT",
                UPDATE_DISPLAY_PICTURE_API,
                formData,
                {
                    "Content-Type ": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                }
            )
            console.log("update dispaly picture api response", response)
            if(!response.data.success){
                throw new Error(response.data.message)
            }
            toast.success("Display update picture successfully")
            dispatch(setUser(response.data.data))
        } catch (error) {
            console.log("Updata display picture error", error)
            toast.error("Could not update display picture ")
        }
        toast.dismiss(toastId)
    }
}

export function updateProfile (token, formData){
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        try {
            const response = await apiconnector(
                "PUT",
                UPDATE_PROFILE_API,
                formData,
            {
                Authorization: `Bearer ${token}`
            })
            console.log("Update Profile responsee api", response)

            if(!response.data.success){
                throw new Error(response.data.message)
            }
            const userImage = response.data.updatedUserDetails.image
            ? response.data.updatedUserDetails.image
            : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.updatedUserDetails.firstName} ${response.data.updatedUserDetails.lastName}`
            dispatch(
                setUser({...response.data.updatedUserDetails, image: userImage})
            )
            toast.success("Profile Updated Successfully")
        } catch (error) {
            console.log("Update profile api response error", error)
            toast.error("Could not update profile")
        }
        toast.dismiss(toastId)
    }
}

export async function changePassword (token, formData){
    const toastId = toast.loading("Loading...")
    try {
        console.log("Token:", token); // Debugging log
        console.log("FormData:", formData); // Debugging log
        const response = await apiconnector("POST", CHANGE_PASSWORD_API, formData,{
            Authorization: `Bearer ${token}`,
        })
        console.log("change password api response ", response)

        if(!response.data.success){
            throw new Error(response.data.message)
        }
        toast.success("Password change successfully")
    } catch (error) {
        console.log("change password api error ", error)
        toast.error("Could not change password ")
    }
    toast.dismiss(toastId)
}

export function deleteProfile (token, navigate){
    return async (dispatch) => {
        const toastId = toast.loading("Loading...")
        try {
            const response = await apiconnector("DELETE", DELETE_PROFILE_API, null, {
                Authorization: `Bearer ${token}`,
            })
            console.log("Delete profile api response ", response)
            if(!response.data.success){
                throw new Error(response.data.message)
            }
            toast.success("DeleteProfile successfully")
            dispatch(logout(navigate))
        } catch (error) {
            console.log("Delete profile api response erorr", error)
            toast.error("Could not Delete Profile")
        }
        toast.dismiss(toastId)
    }
}