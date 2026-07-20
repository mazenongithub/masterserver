import transporter from '../functions/mailer.js';
import GFK from './gfk.js';
import Geotech from './geotech.js';
import geotech from '../routes/geotech.js';
class Notifications {

    async proposalEmail(clientid, projectid, proposalid) {
        const gfk = new GFK();
        const geotech = new Geotech();

        try {

            const [client, project, proposal] = await Promise.all([
                geotech.findClientByID(clientid),
                gfk.getProjectById(projectid),
                gfk.getProposal(projectid, proposalid)
            ]);

            const formatDate = (date) =>
                new Date(date).toLocaleDateString("en-US", {
                    timeZone: "America/Los_Angeles",
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric"
                });

            const formatMoney = (value) =>
                Number(value).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                });

            const formatDateTime = (date) =>
                new Date(date).toLocaleString("en-US", {
                    timeZone: "America/Los_Angeles",
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                });

            const approvedBy = `${client.firstname} ${client.lastname}`;

            const proposalRows = proposal.items.map(item => {

                let date;
                let quantity;
                let amount;

                if (item.type === "labor") {

                    const totalHours =
                        (new Date(item.timeout) - new Date(item.timein)) /
                        (1000 * 60 * 60);

                    date = formatDate(item.timein);

                    quantity = `${totalHours.toFixed(2)} hrs @ ${formatMoney(item.laborrate)}/hr`;

                    amount = totalHours * item.laborrate;

                } else {

                    date = formatDate(item.datein);

                    quantity = `${item.quantity} ${item.unit} @ ${formatMoney(item.unitcost)}/${item.unit}`;

                    amount = item.quantity * item.unitcost;

                }



                const dateApproved = proposal.dateapproved
                    ? formatDate(proposal.dateapproved)
                    : formatDate(new Date());

                return `
                <tr style="font-family:Tahoma, Arial, Helvetica, sans-serif;font-size:16px">
                    <td width="17%">${date}</td>
                    <td width="52%" colspan="3">${item.description || ""}</td>
                    <td width="18%">${quantity}</td>
                    <td width="13%" align="right">${formatMoney(amount)}</td>
                </tr>
            `;

            }).join("");

            const html = `
<div>

    <div style="margin-bottom:10px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">${client.firstname} ${client.lastname}</span>
    </div>

    <div style="margin-bottom:10px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">${client.address}</span>
    </div>

    <div style="margin-bottom:30px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">
            ${client.city}, ${client.contactstate} ${client.zipcode}
        </span>
    </div>

    <div style="margin-bottom:10px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">
            <strong>Project Number:</strong> ${project.projectnumber || ""}
        </span>
    </div>

    <div style="margin-bottom:10px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">${project.title}</span>
    </div>

    <div style="margin-bottom:10px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">${project.projectaddress}</span>
    </div>

    <div style="margin-bottom:30px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">${project.projectcity}</span>
    </div>

    <div style="margin-bottom:10px;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:16px">
            <strong>Proposal Date:</strong> ${formatDate(proposal.dateproposal)}
        </span>
    </div>

    <div style="margin-bottom:20px;text-align:center;font-family:Tahoma, Arial, Helvetica, sans-serif;">
        <span style="font-size:20px"><strong>Proposed Schedule</strong></span>
    </div>

    <table width="100%" border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;">

        <thead>
            <tr style="font-family:Tahoma, Arial, Helvetica, sans-serif;font-size:16px;font-weight:bold;">
                <th width="17%">Date</th>
                <th width="52%" colspan="3">Description</th>
                <th width="18%">Quantity</th>
                <th width="13%">Amount</th>
            </tr>
        </thead>

        <tbody>

            ${proposalRows}

            <tr style="font-family:Tahoma, Arial, Helvetica, sans-serif;font-size:16px;font-weight:bold;">
                <td colspan="5" align="right">Total</td>
                <td align="right">${formatMoney(proposal.totalAmount)}</td>
            </tr>

        </tbody>

    </table>

    <table width="100%" cellpadding="5" cellspacing="0" style="margin-top:30px;">
    <tr style="font-family:Tahoma, Arial, Helvetica, sans-serif;font-size:16px;">
        <td width="50%" align="center">
            <strong>Approved By</strong><br>
            ${approvedBy}
        </td>

        <td width="50%" align="center">
            <strong>Date Approved</strong><br>
            ${formatDateTime(proposal.dateapproved)}
        </td>
    </tr>
</table>

</div>
`;

            await transporter.sendMail({
                from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
                to: "mazen@civilengineer.io",
                subject: `${project.title} - Proposal`,
                html
            });

             await transporter.sendMail({
                from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
                to: `${client.emailaddress}`,
                subject: `${project.title} - Proposal`,
                html
            });


        } catch (err) {
            console.error("Error sending proposal email:", err);
        }
    }

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