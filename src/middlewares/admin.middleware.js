const verifyAdmin = (req, res, next) => {

    try {

        const adminEmail = req.headers["x-admin-email"];
        const adminSecret = req.headers["x-admin-secret"];

        if (
            !adminEmail ||
            !adminSecret
        ) {

            return res.status(401).json({

                success: false,

                message: "Admin credentials are required"

            });

        }

        if (
            adminEmail !== process.env.ADMIN_EMAIL ||
            adminSecret !== process.env.ADMIN_SECRET
        ) {

            return res.status(403).json({

                success: false,

                message: "Invalid admin credentials"

            });

        }

        next();

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export default verifyAdmin;