import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import toast from "react-hot-toast"
import {setSignupData} from "../../../slices/authSlice"
import {AiOutlineEye } from "react-icons/ai";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import Tab from "../../Common/Tab";
import { sendotp } from "../../../services/operations/authAPI";

function SignupForm (){
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Student or Instructor
    const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)

    const [passAlert, setPassAlert] = useState("");

    const [formData, setFormData] = useState({
        firstName:"",
        lastName:"",
        email:"",
        password:"",
        confirmPassword:""
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {firstName, lastName, email, password, confirmPassword} = formData

    // Handle input field when some value change
    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name] : e.target.value
        }));
    }
    const handleOnSubmit = (e) => {
        e.preventDefault()
        // const password = {password};
        if(password.length < 8){
            setPassAlert("Password must be have a 8 character")
            return
        }
        if(password !== confirmPassword){
            toast.error("Password Do Not Match")
            return 
        }
        const SignupData = {
            ...formData,
            accountType
        }
        // setting signup data to state
        // to be used after otp verification 
        dispatch(setSignupData(SignupData))
        // send otp to verification 
        dispatch(sendotp(formData.email, navigate))

        setFormData({
            firstName:"",
            lastName:"",
            email:"",
            password:"",
            confirmPassword:""
        })
        setAccountType(ACCOUNT_TYPE.STUDENT)
    }
    const tabData = [
        {
            id:1,
            tabName:"Student",
            type:ACCOUNT_TYPE.STUDENT
        },
        {
            id:2,
            tabName:"Instructor",
            type:ACCOUNT_TYPE.INSTRUCTOR
        }
    ]
    
    return (
        <div>
            {/* Tab */}
            <Tab tabData={tabData} field={accountType} setField={setAccountType} ></Tab>

            {/* Form */}
            <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4" >
                <div className="flex gap-x-4">
                    <label>
                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                            First Name <sup className="text-pink-200">*</sup>
                        </p>
                        <input
                            required
                            type="text"
                            name="firstName"
                            value={firstName}
                            onChange={handleOnChange}
                            placeholder="Enter First Name"
                            className="form-style w-full"
                        />
                    </label>
                    <label>
                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                            Last Name <sup className="text-pink-200">*</sup>
                        </p>
                        <input
                            required
                            type="text"
                            name="lastName"
                            value={lastName}
                            onChange={handleOnChange}
                            placeholder="Enter Last Name"
                            className="form-style w-full"
                        />
                    </label>
                </div>
                <label className="w-full">
                    <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                        Email Address <sup className="text-pink-200">*</sup>
                    </p>
                    <input
                        required
                        type="text"
                        name="email"
                        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                        value={email}
                        onChange={handleOnChange}
                        placeholder="Enter email address"
                        className="form-style w-full"
                    />
                </label>
                <div className="flex gap-x-4">
                    <label className="relative">
                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                            Create Password <sup className="text-pink-200">*</sup>
                        </p>
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={password}
                            onChange={handleOnChange}
                            placeholder="Enter Password"
                            className="form-style w-full !pr-10"
                        />
                        <span 
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-[38px] z-[10] cursor-pointer"
                        >
                            {showPassword ? (
                                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                            ) : (
                                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                            )}
                        </span>
                        <p className="text-pink-100 mt-1 ">{passAlert}</p>
                    </label>
                    <label className="relative">
                        <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                            Confirm Password <sup className="text-pink-200">*</sup>
                        </p>
                        <input
                            required
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleOnChange}
                            placeholder="Confirm Password"
                            className="form-style w-full !pr-10"
                        />
                        <span
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-[38px] z-[10] cursor-pointer"
                        >
                            {showConfirmPassword ? (
                                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                            ) : (
                                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                            )}
                        </span>
                    </label>
                </div>
                <button
                    type="submit"
                    className="mt-6 rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900"
                >
                 Create Account   
                </button>
            </form>
        </div>
    )
}
export default SignupForm;