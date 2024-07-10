const Category = require("../models/Category")

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

exports.createCategory = async (req, res) => {
    try {
        // fetch data from body
        const {name, description} = req.body;
        // validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        // create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description
        });
        console.log(categoryDetails);

        // return response
        return res.status(200).json({
            success: true,
            message: "Category create successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//get all Category handler
exports.showAllCategories = async (req, res) => {
    try {
        const allCategory = await Category.find();
        return res.status(200).json({
        success: true,
        message: "All Category created successfully",
        allCategory
    });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

// category page details
exports.categoryPageDetails = async (req, res) => {
    try {
        // get category id
        const {categoryId} = req.body;

        // get course for specified category id
        const selectedCategory = await Category.findById(categoryId)
                                        .populate(
                                            {path: "courses",
                                            match: { status: "Published" },
                                            // populate: "ratingAndReviews",
                                            }
                                        )
                                        .exec();
            console.log("SELECTED COURSE", selectedCategory)
            // validation 
            if(!selectedCategory){
                console.log("Category not found.")
                return res.status(404).json({
                    success: false,
                    message: "category not found"
                })
            };

            const categoriesExceptSelected = await Category.find({
                _id: { $ne: categoryId },
            })

            // get courses for diffrent categories
            let differentCategories = await Category.findOne(
                categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
            )
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec();

            // get top selling course across all categories
            const allCategories = await Category.find()
                .populate({
                    path: "courses",
                    match: { status: "Published" },
                })
                .exec()
            const allCourses = allCategories.flatMap((Category) => Category.courses)
            const mostSellingCourses = allCourses
                .sort((a, b) => b.sold - a.sold)
                .slice(0,10)

            // return response
            res.status(200).json({
                success: true,
                data: {
                    selectedCategory,
                    differentCategories,
                    mostSellingCourses
                }
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        })
    }
}