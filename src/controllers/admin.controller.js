import jwt from "jsonwebtoken";

const adminLogin = async (req, res) => {

    try {

        const { adminEmail, password } = req.body;

        if (!adminEmail || !password) {

            return res.status(400).json({

                success: false,

                message: "All fields are required"

            });

        }

        // Compare with ADMIN_EMAIL and ADMIN_SECRET from .env
        if (
            adminEmail !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_SECRET
        ) {

            return res.status(401).json({

                success: false,

                message: "Invalid Admin Credentials"

            });

        }

        const token = jwt.sign(

            {

                role: "admin"

            },

            process.env.ACCESS_TOKEN_SECRET,

            {

                expiresIn: "1d"

            }

        );

        return res.status(200).json({

            success: true,

            message: "Admin Login Successful",

            token

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export { adminLogin };