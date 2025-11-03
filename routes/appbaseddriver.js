
import AppBasedDriver from "../classes/appbaseddriver.js"
export default (app) => {

    app.get(`/appbaseddriver`, (req, res) => {
        res.json({ appbaseddriver: `Hello appbaseddriver ${process.env.NODE_ENV}` })
    })

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

            return res.status(200).json(result);

        } catch (err) {
            console.error('Error during driver login:', err);
            return res.status(500).json({ message: `Error: could not log in driver - ${err.message}` });
        }
    });


    app.post('/appbaseddriver/:driverid/savedriver', async (req, res) => {
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

  


}