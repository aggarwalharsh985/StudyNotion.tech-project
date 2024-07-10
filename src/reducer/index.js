import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../slices/authSlice"
import courseReducer from "../slices/courseSlice"
import profileReducer from "../slices/profileSlice"
import cartReducer from "../slices/cartSlice"
// import viewCourseReducer from "../slices/viewCourseSlice"

const rootReducer = combineReducers({
    auth:authReducer,
    course: courseReducer,
    profile:profileReducer,
    // viewCourse: viewCourseReducer,
    cart:cartReducer    
})
export default rootReducer