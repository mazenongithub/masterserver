"use strict";

/** Functionality related to chatting. */

// Room is an abstraction of a chat channel
import Room from './room.js'

//const { getRandomJoke } = require("./jokes");

/** ChatUser is a individual connection from client -> server to chat. */

class ChatUser {
    /** Make chat user: store connection-device, room.
     *
     * @param send {function} callback to send message to this user
     * @param room {Room} room user will be in
     * */

    constructor(send, roomName, clientid) {
        this._send = send; // "send" function for this user
        this.room = Room.get(roomName); // room user will be in
        this.name = clientid; // becomes the username of the visitor


        console.log(`created chat in ${this.room.name}`);
    }

    /** Send msgs to this client using underlying connection-send-function.
     *
     * @param data {string} message to send
     * */

    send(data) {
        try {
            this._send(data);
        } catch {
            // If trying to send to a user fails, ignore it
        }
    }

    /** Handle joining: add to room members, announce join.
     *
     * @param name {string} name to use in room
     * */



    /** Handle a chat: broadcast to room.
     *
     * @param text {string} message to send
     * */




    /** Handle a private chat: send to recipient only.
     *
     * @param recipient {string} recipient of chat
     * @param text {string} message to send
     * */



    /** Handle messages from client:
     *
     * @param jsonData {string} raw message data
     *
     * @example<code>
     * - {type: "join", name: username} : join
     * - {type: "chat", text: msg }     : chat
     * </code>
     */



    async projectHandler(jsonData) {


        const msg = JSON.parse(jsonData);
        switch (msg.type) {
            case "join":

                this.room.join(this);
                this.room.broadcast({

                    type: "join",
                    text: `${this.name} joined ${this.room.name}`

                })

                return;
            case "viewproject-client":

                this.room.broadcast({

                    type: "viewproject-client",
                    message: "project saved",
                    updatedProject: msg.updatedProject
                })
                return;
            case "viewproposal-client":
                this.room.broadcast({

                    type: "viewproposal-client",
                    message: "proposal updated",
                    updatedProposal: msg.updatedProposal
                })
                return;

            case "default":
                return;
        }




    }





    /** Connection was closed: leave room, announce exit to others. */

    handleClose() {
        this.room.leave(this);
        this.room.broadcast({
            type: "note",
            text: `${this.name} left ${this.room.name}.`,
        });
    }

    /** Handle get joke: get a joke, send to this user only */


    /** Handle get room members:
     * - gets all room members
     * - send member names to this user only
     */

    handleGetMembers() {
        // members is a Set of user instances
        const members = this.room.getMembers();
        const memberNames = [];

        for (let member of members) {
            memberNames.push(member.name);
        }

        this.send(JSON.stringify(
            {
                name: "In room",
                type: "chat",
                text: memberNames.join(", "),
            }));
    }

    /** Change user's name:
     *
     * @param username {string} new name for this user
     * */

    changeUsername(username) {
        this.name = username;
    }

    /** Handle changing a user's name: broadcast change to room.
    *
    * @param username {string} new name for this user
    * */

    handleChangeUsername(username) {
        const currentName = this.name;
        this.changeUsername(username);
        const updatedName = this.name;

        this.room.broadcast({
            name: "server",
            type: "chat",
            text: `The username for ${currentName} has changed to ${updatedName}`,
        });
    }
}

export default ChatUser;
