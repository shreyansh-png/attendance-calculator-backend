import jwt from "jsonwebtoken";

const adminLogin = async (req, res) => {

    try {

        const { adminEmail, adminId, email, password } = req.body;
        const adminIdentifier = (adminEmail || adminId || email || "").trim().toLowerCase();
        const configuredAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

        if (!adminIdentifier || !password) {

            return res.status(400).json({

                success: false,

                message: "All fields are required"

            });

        }

        // Compare with ADMIN_EMAIL and ADMIN_SECRET from .env
        if (
            adminIdentifier !== configuredAdminEmail ||
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

            data: {
                token,
                role: "admin"
            },

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