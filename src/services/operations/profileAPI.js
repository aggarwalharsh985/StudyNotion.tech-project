import { apiconnector } from "../apiconnector"
import { toast } from "react-hot-toast"
import {profileEndpoints} from "../apis"

const {
    GET_USER_ENROLLED_COURSES_API
} = profileEndpoints

export async function getUserEnrolledCourses (token){
    const toastId = toast.loading("Loading...")
    let result = []
    try {
        const response = await apiconnector(
            "GET",
            GET_USER_ENROLLED_COURSES_API,
            null,
            {Authorization: `Bearer ${token}`,}
        )
        if(!response.data.success){
            throw new Error(response.data.data)
        }
        result = response.data.data
    } catch (error) {
        console.log("get user enrolled courses api error", error)
        toast.error("Could not get enrolled courses")
    }finally{
        toast.dismiss(toastId)
    }
    
    return result
}