// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

// Import required modules
import { Autoplay, Navigation, FreeMode, Pagination } from "swiper/modules"

import Course_Card from "./Course_Card"

function Course_Slider({ Courses }) {

    // console.log("lenght", Courses.length)
    return (
        <>
            {Courses?.length ? (
                <Swiper
                    slidesPerView={1}
                    spaceBetween={25}
                    loop={true}
                    modules={[Autoplay, FreeMode, Pagination, Navigation]}
                    breakpoints={{
                        1024: {
                        slidesPerView: 3,
                        },
                    }}
                    autoplay={{
                        delay: 2000,
                        disableOnInteraction: false,
                    }}
                    navigation={true}
                    className="max-h-[30rem]"
                >
                {Courses?.map((course, i) => (
                    <SwiperSlide key={i}>
                        <Course_Card course={course} Height={"h-[250px]"} />
                    </SwiperSlide>
                ))}
                </Swiper>
            ) : (
                <p className="text-xl text-richblack-5">No Course Found</p>
            )}
        </>
    )
}

export default Course_Slider
