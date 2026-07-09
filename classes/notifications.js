import transporter from '../functions/mailer.js';
class Notifications {



    async sendRegistrationEmail(myuser) {

        const html = (myuser) => {

            let client = "";

            if (myuser.google) {
                client = "google";
            } else if (myuser.apple) {
                client = "apple";
            }
            return `
        <div>
            <div style="margin-bottom:10px;text-align:center;font-family:Tahoma,Arial,Helvetica,sans-serif;">
                <span style="font-size:18px">
                    You have a new Geotechnical Client
                </span>
            </div>

            <div style="margin-bottom:10px;font-family:Tahoma,Arial,Helvetica,sans-serif;">
                <span style="font-size:16px">
                    ${myuser.firstname} ${myuser.lastname} has signed up to become your geotechnical client.
                    Here is the profile information that has been registered.
                </span>
            </div>

            <div style="margin-bottom:10px;font-family:Tahoma,Arial,Helvetica,sans-serif;">
                <span style="font-size:16px">Client: ${client}</span>
            </div>

            <div style="margin-bottom:10px;font-family:Tahoma,Arial,Helvetica,sans-serif;">
                <span style="font-size:16px">Client ID: ${myuser.clientid}</span>
            </div>

            <div style="margin-bottom:10px;font-family:Tahoma,Arial,Helvetica,sans-serif;">
                <span style="font-size:16px">Email Address: ${myuser.emailaddress}</span>
            </div>

             <div style="margin-bottom:10px;font-family:Tahoma,Arial,Helvetica,sans-serif;">
                <span style="font-size:16px">Phone Number: ${myuser.phonenumber}</span>
            </div>

            <div style="margin-bottom:10px;font-family:Tahoma,Arial,Helvetica,sans-serif;">
                <span style="font-size:16px">
                    Address: ${myuser.address}, ${myuser.city}, ${myuser.contactstate}
                </span>
            </div>
        </div>
    `
        }

        await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: 'mazen@civilengineer.io',
            subject: 'You have a new Client',
            html: html(myuser)

        })

    }

    async sendProjectUpdatedEmail(client, project) {
      
        let html = (project) => {

            return (`<div><div style="margin-bottom:10px;align-content:center; text-align: center; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:18px">${client.firstname} ${client.lastname} has updated project ${project.title}</span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">The following project have been updated:</span>
	</div>
		<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.title} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.projectaddress} ${project.projectcity} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.projectnumber} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.sow} </span>
	</div></div>`)

        }

            await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: 'mazen@civilengineer.io',
            subject: `${client.firstname} ${client.lastname} has updated project ${project.title}</span>
`,
            html: html(project)

        })
    }


    async sendProjectChangeNotification(client, created, updated, deleted) {
        let html = ''
        if (created.length > 0) {
            created.forEach(project => {

                html += `<div><div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">The following project has been created: </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.title} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.projectaddress} ${project.projectcity} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.sow} </span>
	</div> </div>`
            })
        }


        if (updated.length > 0) {
            updated.forEach(project => {

                html += `<div><div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">The following project has been updated: </span>
	</div>
    <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">Project Number ${project.after.projectnumber} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.after.title} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.after.projectaddress} ${project.after.projectcity} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.after.sow} </span>
	</div> </div>`
            })
        }


        if (deleted.length > 0) {
            deleted.forEach(project => {

                html += `<div><div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">The following project has been deleted: </span>
	</div>
    <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">Project Number ${project.projectnumber} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.title} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.projectaddress} ${project.projectcity} </span>
	</div>
	<div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif;">
		<span style="font-size:16x">${project.sow} </span>
	</div> </div>`
            })
        }


        await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: 'mazen@civilengineer.io',
            subject: `${client.firstname} ${client.lastname} Project Updates`,
            html: html

        })


    }

}

export default Notifications;