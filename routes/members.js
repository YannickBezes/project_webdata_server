import { db } from '../db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import config from '../config';

export default class {
    static get collection() { return db.collection('members') }

    /**
     * Get all members
     *
     * @param {*} req
     * @param {*} res
     */
    static get_all(req, res) {
        this.collection.find().map(doc => {
            // Delete password and role property to each document
            delete doc.password
            delete doc.role
            return doc
        }).toArray((err, docs) => {
            if (err)
                res.json({ "status": "failed", "data": null, "message": "Can't get members, err : " + err })
            else
                res.json({"status": "success", "data": docs })
        })
    }

    /**
     * Get a member
     *
     * @param {*} req
     * @param {*} res
     */
    static get(req, res) {
        this.collection.find({ _id: ObjectId(req.params._id)}).map(doc => {
            // Delete password
            delete doc.password
            return doc
        }).toArray((err, docs) => {
            if (err)
                res.json({ "status": "failed", "data": null, "message": "Can't get member, err : " + err })
            else
                res.json({"status": "success", "data": docs.pop() })
        })
    }

    /**
     * Login the user and return a token for this user
     * @param {*} req 
     * @param {*} res 
     */
    static login(req, res) {
        this.collection.find({ email: req.body.email }).toArray((err, docs) => {
            if (docs.length == 0)
                res.json({"status": "failed", "data": null, "message": "User not found"})
            else {
                let user = docs.pop()
                if(user.password != req.body.password)
                    res.json({ "status": "failed", "data": null, "message": "Wrong password" })
                else {
                    let token = jwt.sign({user: user.email, password: user.password}, config.SALT, {
                        expiresIn: 1440 // 24 hours
                    })
                    res.json({ "status": "success", "data": token})
                }
            }
        })
    }

    /**
     * Add a member
     *
     * @param {*} req
     * @param {*} res
     */
    static async add(req, res) {
        // Check if the email does not exist
        let exist = await this.email_exist(req.body.email)
        if (!exist) {
            try {
                // Insert the member and get it after
                // sort({_id: -1}) to sort from newest to oldest
                // limt(1) to limit the number to one
                this.collection.insertOne(req.body).then(() => {
                    this.collection.find().sort({ _id: -1 }).limit(1).toArray((err, docs) => {
                        if (err)
                            res.json({ "status": "failed", "data": null, "message": "Can't insert the member, err : " + err })
                        else
                            res.json({ "status": "success", "data": docs.pop() })
                    })
                })
            } catch (error) {
                res.json({ "status": "failed", "data": null, "message": "Can't insert the member, err : " + error.toString() })
            }
        } else {
            res.json({ "status": "failed", "data": null, "message": "Email already exist"})
        }
    }

    /**
     * Update a member
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static async update(req, res) {
        // Check if the email does not exist
        let exist = await this.email_exist(req.body.email, req.params._id)
        if (!exist) {
            try {
                this.collection.find({ _id: ObjectId(req.params._id) }).toArray((err, docs) => {
                    if (err)
                            res.json({ "status": "failed", "data": null, "message": "Can't insert the member, err : " + err })
                    else {
                        // Take old fields of the member
                        let old_member = docs.pop()
    
                        let new_member = {};
                        Object.assign(new_member, req.body)
                        delete new_member.password
                        delete new_member.role
                        delete new_member._id
    
                        // Remove the _id because the field can't be updated
                        delete req.body._id
                        // update with the new fields
                        this.collection.updateOne({ _id: ObjectId(req.params._id) }, { $set: req.body }).then(result => {
                            if (result.modifiedCount == 0)
                                res.json({ "status": "failed", "data": null, "message": "Member not update" })
                            else {
                                this.collection.find({ _id: ObjectId(req.params._id) }).toArray((err, docs) => {
                                    if (err)
                                        res.json({ "status": "failed", "data": null, "message": "Can't get member, err : " + err })
                                    else
                                        res.json({ "status": "success", "data": docs.pop()})
                                })
                                // Update properties and services where the owner is the member updated
                                db.collection('properties').updateMany({ "owner.email": old_member.email }, { $set: { owner: new_member } })
                                db.collection('services').updateMany({ "owner.email": old_member.email }, { $set: { owner: new_member } })
    
                                // Update properties and services where the user is the member updated
                                db.collection('properties').updateMany({ "uses.user.email": old_member.email }, { $set: { "uses.$.user": new_member } })
                                db.collection('services').updateMany({ "uses.user.email": old_member.email}, { $set: { "uses.$.user": new_member } })
                            }
                        })
                    }
                })
            } catch (error) {
                res.json({ "status": "failed", "data": null, "message": "Can't update the member, err : " + error.toString() })
            }
        } else {
            res.json({ "status": "failed", "data": null, "message": "Email already exist"})
        }
    }

    /**
     * Delete a member which the _id given in the request
     *
     * @param {*} req
     * @param {*} res
     */
    static delete(req, res) {
        try {
            this.collection.deleteOne({ _id: ObjectId(req.body._id) }).then(result => {
                // Check if a member as been deleted
                if(result.deletedCount == 0)
                    res.json({"status": "failed", "data": null, "message": "No member deleted"})
                else
                    res.json({"status": "success", "data": req.body})
            })    
        } catch (error) {
            res.json({"status": "failed", "data": null, "message": "Can't delete the member, err : " + error.toString() })
        }
    }

    static email_exist(email, id = null) {
        this.collection.find({ email: email }).toArray((err, docs) => {
            if (err)
                req.json({ "status": "failed", "data": null, "message": "Can't check if the email already exist, err : " + err })
            else {
                if (docs.length != 0) {
                    if (id && docs.pop()._id == id)
                        return false
                    else
                        return true
                }
                return true
            }
        })
    }
}
