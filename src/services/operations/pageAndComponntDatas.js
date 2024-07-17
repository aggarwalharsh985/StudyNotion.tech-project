import { apiconnector } from "../apiconnector"
import { catalogData } from "../apis"
import {toast} from "react-hot-toast"

export const getCatalogPageData = async (categoryId) => {
    const toastId = toast.loading("Loading...")
    let result = []
    try {
        const response = await apiconnector(
            "POST",
            catalogData.CATALOGPAGEDATA_API,
            {
                categoryId: categoryId
            }
        )
        if(!response?.data?.success){
            throw new Error("Could not fetch Category page data")
        }
        result = response?.data
    } catch (error) {
        console.log("CATALOGPAGEDATA_API API ERROR............", error)
        toast.error(error.message)
        result = error.response?.data
    }
    toast.dismiss(toastId)
    return result
}