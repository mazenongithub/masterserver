import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'

const DriverSchema = new mongoose.Schema({
    driverid: String,
    google: String,
    apple: String,
    firstname: String,
    lastname: String,
    emailaddress: String,
    profileurl: String,
    phonenumber: String,
    equipment: [{
        equipmentid: String,
        equipment: String,
        repayment: {
            salvagedate: String,
            salvage: String,
            purchasedate: String,
            purchase: String,
            apr: String
        },
        costs: [{
            costid: String,
            detail: String,
            purchasedate: String,
            amount: String,
            reimbursable: Boolean,
            recharge: {
                totalenergy: String,
                duration: {
                    hours: String,
                    minutes: String,
                    seconds: String
                }
            },
            reoccurring: {
                frequency: String
            },
            images: [{
                imageid: String,
                url: String
            }]
        }],
    }],

    driver: {
        shifts: [{
            shiftid: String,
            timein: String,
            timeout: String,
            deliveries: String,
            earnings: String,
            miles: String,

        }]
    }


});

const MyDriver = mongoose.model("appbaseddrivers", DriverSchema);

class AppBasedDriver {

    async saveDriver(myDriver) {
        try {
            const filter = { _id: myDriver._id };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedDriver = await MyDriver.findOneAndUpdate(filter, myDriver, options);

            return updatedDriver;

        } catch (err) {
            console.error('Error saving driver:', err);
            return { message: `Error: Could not save driver - ${err.message}` };
        }
    }


    async clientLogin(myDriver) {
        try {
            // ✅ Must have at least one provider
            if (!myDriver.apple && !myDriver.google) {
                return { message: 'Missing Apple or Google ID' };
            }

            // ✅ Determine which provider is being used
            const provider = myDriver.apple ? 'apple' : 'google';
            const providerId = myDriver[provider];

            // ✅ Try to find an existing driver for that provider
            let existingDriver;
            if (provider === 'apple') {
                existingDriver = await this.getAppleUser(providerId);
            } else {
                existingDriver = await this.getGoogleUser(providerId);
            }

            if (existingDriver) {
                return existingDriver;
            }

            // ✅ Ensure driver ID is provided before registration
            if (!myDriver.driverid) {
                return { message: 'Cannot register driver — driver ID missing' };
            }

            // ✅ Register new user
            const newDriver = await this.registerNewUser(myDriver);
            return newDriver;

        } catch (err) {
            console.error('Client login error:', err);
            return { message: `Error during client login: ${err.message}` };
        }
    }

    async registerNewUser(newDriver) {
        try {
            // ✅ Hash Apple ID if it exists
            if (newDriver.apple) {
                const salt = await bcrypt.genSalt(10);
                newDriver.apple = await bcrypt.hash(newDriver.apple, salt);
            }

            // ✅ Hash Google ID if it exists
            if (newDriver.google) {
                const salt = await bcrypt.genSalt(10);
                newDriver.google = await bcrypt.hash(newDriver.google, salt);
            }

            // ✅ Create driver in DB
            const createdDriver = await MyDriver.create(newDriver);

            return createdDriver;

        } catch (err) {
            console.error('Error registering new driver:', err);
            return { message: `Error: Could not register driver - ${err.message}` };
        }
    }


    async getAppleUser(apple) {
        try {
            const allDrivers = await MyDriver.find({ apple: { $exists: true } });

            for (const driver of allDrivers) {
                const isMatch = bcrypt.compareSync(apple, driver.apple);
                if (isMatch) {
                    return driver; // return immediately once found
                }
            }

            // If no driver found
            return { message: 'No drivers found with matching Apple credentials' };

        } catch (err) {
            return { message: `Error finding driver: ${err.message}` };
        }
    }

    hashPassword(password) {

        return bcrypt.hashSync(password, 10);
    }




    async getGoogleUser(apple) {
        try {
            const allDrivers = await MyDriver.find({ google: { $exists: true } });

            for (const driver of allDrivers) {
                const isMatch = bcrypt.compareSync(apple, driver.apple);
                if (isMatch) {
                    return driver; // return immediately once found
                }
            }

            // If no driver found
            return { message: 'No drivers found with matching Apple credentials' };

        } catch (err) {
            return { message: `Error finding driver: ${err.message}` };
        }
    }


}

export default AppBasedDriver;