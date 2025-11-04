
import AppBasedDriver from "../classes/appbaseddriver.js"
import { checkSessionDriver } from "../middleware/checkSession.js"
export default (app) => {

  

    app.post('/appbaseddriver/users/clientlogin', async (req, res) => {
        try {
            const appBasedDriver = new AppBasedDriver();

            const {
                firstname,
                lastname,
                emailaddress,
                phonenumber,
                profileurl,
                apple,
                google,
                driverid,
            } = req.body;

            // Construct driver object
            const myDriver = { firstname, lastname, emailaddress, phonenumber, profileurl, apple, google, driverid };

            // Attempt login
            const result = await appBasedDriver.clientLogin(myDriver);

            // Handle result
            if (!result) {
                return res.status(404).json({ message: 'Driver not found or could not log in' });
            }

            req.session.driverId = result._id;
            req.session.save();

            return res.status(200).json(result);

        } catch (err) {
            console.error('Error during driver login:', err);
            return res.status(500).json({ message: `Error: could not log in driver - ${err.message}` });
        }
    });


    app.post('/appbaseddriver/:driverid/savedriver', checkSessionDriver, async (req, res) => {
        const myDriver = req.body.myuser;

        try {
            const appBasedDriver = new AppBasedDriver();
            const updatedDriver = await appBasedDriver.saveDriver(myDriver);

            if (!updatedDriver) {
                return res.status(404).json({ message: 'Driver not found or could not be saved' });
            }

            return res.status(200).json(updatedDriver);

        } catch (err) {
            console.error('Error saving driver:', err);
            return res.status(500).json({ message: `Error: could not save driver - ${err.message}` });
        }
    });


    app.get('/appbaseddriver/checkuser', async (req, res) => {
        const driverId = req.session.driverId
        const appbaseddriver = new AppBasedDriver();

        try {
            if (!driverId) {
                return res.status(400).json({ message: "No driver ID found in session" });
            }

            const driver = await appbaseddriver.findDriverByID(driverId);

            if (!driver) {
                return res.status(404).json({ message: "Driver not found" });
            }

            res.json(driver);
        } catch (err) {
            res.status(500).json({ message: `Error checking driver: ${err.message}` });
        }
    });


    app.get("/appbaseddriver/:driverid/logout", (req, res) => {
        const { driverid } = req.params;

        // Check if a session exists
        if (!req.session) {
            return res.status(400).json({ message: "No active session found" });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
                return res.status(500).json({ message: "Error logging out" });
            }

            res.clearCookie("connect.sid"); // ✅ clear the session cookie
            res.json({ message: `${driverid} has been logged out successfully` });
        });
    });






}