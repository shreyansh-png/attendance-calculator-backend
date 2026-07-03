const verifyAdmin = (req, res, next) => {

    try {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }
    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export default verifyAdmin;