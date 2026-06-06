export default function validateProfile(req, res, next) {
    try {
        const myuser = req.body.myuser;

        if (!myuser) {
            return res.status(400).json({
                error: "Missing user payload"
            });
        }

        const errors = [];

        // -----------------------
        // Client ID validation
        // -----------------------
        const clientId = myuser.clientid?.trim().toLowerCase();

        if (!clientId) {
            errors.push("Client ID is required.");
        } else if (!/^[a-z0-9._]{3,30}$/.test(clientId)) {
            errors.push(
                "Client ID must be 3-30 characters and contain only lowercase letters, numbers, periods, and underscores."
            );
        } else {
            // normalize it so downstream code uses safe value
            myuser.clientid = clientId;
        }

        // -----------------------
        // Email validation
        // -----------------------
        const email = myuser.emailaddress?.trim();

        if (!email) {
            errors.push("Email address is required.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("Please enter a valid email address.");
        } else {
            myuser.emailaddress = email;
        }

        // -----------------------
        // Phone validation
        // -----------------------
        const phone = myuser.phonenumber?.trim();

        if (!phone) {
            errors.push("Phone number is required.");
        } else if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
            errors.push("Phone number must be in the format xxx-xxx-xxxx.");
        } else {
            myuser.phonenumber = phone;
        }

        // -----------------------
        // Fail request if errors
        // -----------------------
        if (errors.length > 0) {
            return res.status(400).json({
                errors
            });
        }

        // attach cleaned payload back
        req.body.myuser = myuser;

        next();
    } catch (err) {
        next(err);
    }
}